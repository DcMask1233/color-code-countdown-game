
-- First, let's clean up existing data and fix the foreign key constraint issue

-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.user_bets DROP CONSTRAINT IF EXISTS user_bets_user_id_fkey;

-- Delete orphaned records in user_bets that don't have corresponding users
DELETE FROM public.user_bets 
WHERE user_id NOT IN (
  SELECT id FROM auth.users
);

-- Create profiles table with UUID and 6-digit user codes
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_code TEXT UNIQUE NOT NULL, -- 6-digit user code for display
  mobile TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallets table linked to profiles
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  balance NUMERIC DEFAULT 1000 CHECK (balance >= 0),
  total_bet_amount NUMERIC DEFAULT 0,
  total_deposit_amount NUMERIC DEFAULT 0,
  total_withdraw_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Function to generate 6-digit user code
CREATE OR REPLACE FUNCTION public.generate_user_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-digit code (100000 to 999999)
    new_code := LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create profiles for existing auth users
INSERT INTO public.profiles (id, user_code)
SELECT 
  au.id,
  public.generate_user_code()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Create wallets for all profiles
INSERT INTO public.wallets (user_id, balance)
SELECT 
  p.id,
  1000
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.wallets w WHERE w.user_id = p.id
);

-- Now we can safely add the foreign key constraint
ALTER TABLE public.user_bets ADD CONSTRAINT user_bets_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Enable RLS on wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallets
CREATE POLICY "Users can view their own wallet" 
  ON public.wallets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" 
  ON public.wallets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_code TEXT;
BEGIN
  -- Generate unique user code
  new_user_code := public.generate_user_code();
  
  -- Insert profile
  INSERT INTO public.profiles (id, user_code)
  VALUES (NEW.id, new_user_code);
  
  -- Create wallet for new user
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 1000);
  
  RETURN NEW;
END;
$$;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get current period for any game duration
CREATE OR REPLACE FUNCTION public.get_current_period(p_duration INTEGER)
RETURNS TABLE(period TEXT, time_left INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_period TEXT;
  seconds_left INTEGER;
BEGIN
  -- Generate current period
  current_period := public.generate_period(p_duration);
  
  -- Calculate time left in current period
  WITH time_calc AS (
    SELECT 
      EXTRACT(EPOCH FROM (now() AT TIME ZONE 'UTC' + INTERVAL '5.5 hours'))::INTEGER AS current_seconds,
      EXTRACT(EPOCH FROM (date_trunc('day', now() AT TIME ZONE 'UTC' + INTERVAL '5.5 hours')))::INTEGER AS day_start_seconds
  )
  SELECT p_duration - ((current_seconds - day_start_seconds) % p_duration) INTO seconds_left
  FROM time_calc;
  
  RETURN QUERY SELECT current_period, seconds_left;
END;
$$;

-- Function to place bet and update wallet
CREATE OR REPLACE FUNCTION public.place_bet_with_wallet(
  p_game_type TEXT,
  p_game_mode TEXT,
  p_period TEXT,
  p_bet_type TEXT,
  p_bet_value TEXT,
  p_amount NUMERIC
)
RETURNS TABLE(success BOOLEAN, message TEXT, new_balance NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_balance NUMERIC;
  updated_balance NUMERIC;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'User not authenticated', 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check current balance
  SELECT balance INTO current_balance 
  FROM public.wallets 
  WHERE user_id = current_user_id;
  
  IF current_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Wallet not found', 0::NUMERIC;
    RETURN;
  END IF;
  
  IF current_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, 'Insufficient balance', current_balance;
    RETURN;
  END IF;
  
  -- Deduct from wallet and update bet stats
  UPDATE public.wallets 
  SET 
    balance = balance - p_amount,
    total_bet_amount = total_bet_amount + p_amount,
    updated_at = NOW()
  WHERE user_id = current_user_id
  RETURNING balance INTO updated_balance;
  
  -- Place the bet
  INSERT INTO public.user_bets (
    user_id, game_type, game_mode, period, bet_type, bet_value, amount
  ) VALUES (
    current_user_id, p_game_type, p_game_mode, p_period, p_bet_type, p_bet_value, p_amount
  );
  
  RETURN QUERY SELECT TRUE, 'Bet placed successfully', updated_balance;
END;
$$;

-- Function to get user profile and wallet info
CREATE OR REPLACE FUNCTION public.get_user_info()
RETURNS TABLE(
  user_id UUID,
  user_code TEXT,
  mobile TEXT,
  balance NUMERIC,
  total_bet_amount NUMERIC,
  total_deposit_amount NUMERIC,
  total_withdraw_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.user_code,
    p.mobile,
    w.balance,
    w.total_bet_amount,
    w.total_deposit_amount,
    w.total_withdraw_amount
  FROM public.profiles p
  JOIN public.wallets w ON p.id = w.user_id
  WHERE p.id = current_user_id;
END;
$$;

-- Update settle_bets_for_result to credit winnings to wallet
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

    -- Credit winnings to wallet if won
    IF payout > 0 THEN
      UPDATE public.wallets
      SET balance = balance + payout, updated_at = NOW()
      WHERE user_id = bet.user_id;
    END IF;

    -- Log the result
    RAISE NOTICE 'Bet % settled: win=%, payout=%', bet.id, (payout > 0), payout;
  END LOOP;
END;
$$;
