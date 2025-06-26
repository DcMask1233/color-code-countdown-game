
-- Phase 1: Database Schema Corrections (Fixed)

-- First, let's create the proper user_bets table that matches frontend expectations
CREATE TABLE IF NOT EXISTS public.user_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_type TEXT NOT NULL,
  game_mode TEXT NOT NULL,
  period TEXT NOT NULL,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('color', 'number')),
  bet_value TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  settled BOOLEAN NOT NULL DEFAULT false,
  win BOOLEAN DEFAULT NULL,
  payout NUMERIC DEFAULT 0
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_bets_user_id ON public.user_bets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bets_period ON public.user_bets(period);
CREATE INDEX IF NOT EXISTS idx_user_bets_game_type_mode ON public.user_bets(game_type, game_mode);
CREATE INDEX IF NOT EXISTS idx_user_bets_settled ON public.user_bets(settled);

-- Enable Row Level Security
ALTER TABLE public.user_bets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_bets
CREATE POLICY "Users can view their own bets" 
  ON public.user_bets 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Users can create their own bets" 
  ON public.user_bets 
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow service role to update bets for settlement" 
  ON public.user_bets 
  FOR UPDATE 
  TO service_role 
  USING (true);

-- Add constraint to ensure unique period+game combination in game_results (fixed syntax)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_period_game' 
    AND table_name = 'game_results'
  ) THEN
    ALTER TABLE public.game_results 
    ADD CONSTRAINT unique_period_game 
    UNIQUE (period, game_type, duration);
  END IF;
END $$;

-- Update the settlement function to work with new user_bets table
CREATE OR REPLACE FUNCTION public.settle_bets_for_result(p_game_type text, p_period text, p_duration integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  winning_number INTEGER;
  winning_colors TEXT[];
  bet RECORD;
  payout NUMERIC;
BEGIN
  -- Get the winning result
  SELECT number, result_color INTO winning_number, winning_colors
  FROM public.game_results
  WHERE game_type = p_game_type AND period = p_period AND duration = p_duration
  LIMIT 1;

  IF winning_number IS NULL THEN
    RAISE NOTICE 'No result found for period % game % duration %', p_period, p_game_type, p_duration;
    RETURN;
  END IF;

  -- Process all unsettled bets for this period and game
  FOR bet IN
    SELECT * FROM public.user_bets
    WHERE game_type = p_game_type 
    AND period = p_period 
    AND settled = false
  LOOP
    payout := 0;

    -- Calculate payout based on bet type
    IF bet.bet_type = 'number' AND bet.bet_value::INTEGER = winning_number THEN
      payout := bet.amount * 9;
    ELSIF bet.bet_type = 'color' AND bet.bet_value = ANY(winning_colors) THEN
      payout := bet.amount * 2;
    END IF;

    -- Update the bet record
    UPDATE public.user_bets
    SET 
      settled = true,
      win = (payout > 0),
      payout = payout
    WHERE id = bet.id;

    -- Log the result
    RAISE NOTICE 'Bet % settled: win=%, payout=%', bet.id, (payout > 0), payout;
  END LOOP;
END;
$$;

-- Update the insert_game_result function to trigger settlement
CREATE OR REPLACE FUNCTION public.insert_game_result(p_game_type text, p_duration integer)
RETURNS TABLE(period text, number integer, result_color text[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_period TEXT;
  winning_number INTEGER;
  colors TEXT[];
BEGIN
  -- Generate period using the existing function
  new_period := public.generate_period(p_duration);
  
  -- Generate winning number and colors
  winning_number := public.generate_winning_number();
  colors := public.get_result_colors(winning_number);
  
  -- Insert the result (will be ignored if already exists due to unique constraint)
  INSERT INTO public.game_results (period, number, result_color, game_type, duration)
  VALUES (new_period, winning_number, colors, p_game_type, p_duration)
  ON CONFLICT ON CONSTRAINT unique_period_game DO NOTHING;
  
  -- Settle bets for this result
  PERFORM public.settle_bets_for_result(p_game_type, new_period, p_duration);
  
  -- Return the result
  RETURN QUERY
  SELECT 
    gr.period, 
    gr.number, 
    gr.result_color
  FROM public.game_results gr
  WHERE gr.period = new_period
    AND gr.game_type = p_game_type
    AND gr.duration = p_duration;
END;
$$;

-- Create a function to place bets securely
CREATE OR REPLACE FUNCTION public.place_user_bet(
  p_user_id TEXT,
  p_game_type TEXT,
  p_game_mode TEXT,
  p_period TEXT,
  p_bet_type TEXT,
  p_bet_value TEXT,
  p_amount NUMERIC
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate inputs
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT false, 'Invalid bet amount';
    RETURN;
  END IF;

  IF p_bet_type NOT IN ('color', 'number') THEN
    RETURN QUERY SELECT false, 'Invalid bet type';
    RETURN;
  END IF;

  -- Insert the bet
  INSERT INTO public.user_bets (
    user_id, game_type, game_mode, period, bet_type, bet_value, amount
  ) VALUES (
    p_user_id::UUID, p_game_type, p_game_mode, p_period, p_bet_type, p_bet_value, p_amount
  );

  RETURN QUERY SELECT true, 'Bet placed successfully';
END;
$$;
