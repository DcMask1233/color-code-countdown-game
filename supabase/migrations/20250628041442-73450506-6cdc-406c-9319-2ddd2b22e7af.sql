
-- First, let's check what tables exist and drop them properly
DROP TABLE IF EXISTS public.admin_results CASCADE;
DROP TABLE IF EXISTS public.bets CASCADE;
DROP TABLE IF EXISTS public.user_bets CASCADE;
DROP TABLE IF EXISTS public.game_results CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.user_wallets CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Create users table (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL DEFAULT 1000 CHECK (balance >= 0),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_periods table
CREATE TABLE public.game_periods (
  id BIGSERIAL PRIMARY KEY,
  game_type TEXT NOT NULL CHECK (game_type IN ('parity', 'sapre', 'bcone', 'emerd')),
  game_mode TEXT NOT NULL CHECK (game_mode IN ('wingo1min', 'wingo3min', 'wingo5min')),
  period TEXT NOT NULL,
  result JSONB DEFAULT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_type, game_mode, period)
);

-- Create user_bets table
CREATE TABLE public.user_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  period_id BIGINT REFERENCES public.game_periods(id) ON DELETE CASCADE NOT NULL,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('color', 'number')),
  bet_value TEXT NOT NULL,
  amount DECIMAL NOT NULL CHECK (amount > 0),
  result TEXT DEFAULT NULL CHECK (result IN ('win', 'lose')),
  payout DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bet', 'win', 'deposit', 'withdraw')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for game_periods (public read, admin write)
CREATE POLICY "Anyone can view game periods" ON public.game_periods
  FOR SELECT TO public USING (true);
CREATE POLICY "Only admins can manage game periods" ON public.game_periods
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- RLS Policies for user_bets
CREATE POLICY "Users can view their own bets" ON public.user_bets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bets" ON public.user_bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update bets for settlement" ON public.user_bets
  FOR UPDATE TO service_role USING (true);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create transactions" ON public.transactions
  FOR INSERT TO service_role WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_game_periods_type_mode ON public.game_periods(game_type, game_mode);
CREATE INDEX idx_game_periods_end_time ON public.game_periods(end_time);
CREATE INDEX idx_user_bets_user_period ON public.user_bets(user_id, period_id);
CREATE INDEX idx_transactions_user_type ON public.transactions(user_id, type);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, balance)
  VALUES (NEW.id, 1000);
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger for automatic user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create new game period
CREATE OR REPLACE FUNCTION public.create_new_period(
  p_game_type TEXT,
  p_game_mode TEXT,
  p_duration INTEGER
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_period TEXT;
  period_start TIMESTAMP WITH TIME ZONE;
  period_end TIMESTAMP WITH TIME ZONE;
  new_period_id BIGINT;
BEGIN
  -- Generate period in YYYYMMDDRR format
  new_period := public.generate_period(p_duration);
  
  -- Calculate start and end times
  period_start := now();
  period_end := period_start + (p_duration || ' seconds')::INTERVAL;
  
  -- Insert new period
  INSERT INTO public.game_periods (game_type, game_mode, period, start_time, end_time)
  VALUES (p_game_type, p_game_mode, new_period, period_start, period_end)
  RETURNING id INTO new_period_id;
  
  RETURN new_period_id;
END;
$$;

-- Function to place bet securely
CREATE OR REPLACE FUNCTION public.place_bet_secure(
  p_period_id BIGINT,
  p_bet_type TEXT,
  p_bet_value TEXT,
  p_amount DECIMAL
)
RETURNS TABLE(success BOOLEAN, message TEXT, new_balance DECIMAL)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_balance DECIMAL;
  period_locked BOOLEAN;
  updated_balance DECIMAL;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'User not authenticated', 0::DECIMAL;
    RETURN;
  END IF;
  
  -- Check if period is locked
  SELECT is_locked INTO period_locked 
  FROM public.game_periods 
  WHERE id = p_period_id;
  
  IF period_locked THEN
    RETURN QUERY SELECT FALSE, 'Betting is locked for this period', 0::DECIMAL;
    RETURN;
  END IF;
  
  -- Check balance
  SELECT balance INTO current_balance 
  FROM public.users 
  WHERE id = current_user_id;
  
  IF current_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, 'Insufficient balance', current_balance;
    RETURN;
  END IF;
  
  -- Deduct balance
  UPDATE public.users 
  SET balance = balance - p_amount
  WHERE id = current_user_id
  RETURNING balance INTO updated_balance;
  
  -- Create bet record
  INSERT INTO public.user_bets (user_id, period_id, bet_type, bet_value, amount)
  VALUES (current_user_id, p_period_id, p_bet_type, p_bet_value, p_amount);
  
  -- Create transaction record
  INSERT INTO public.transactions (user_id, amount, type, metadata)
  VALUES (current_user_id, -p_amount, 'bet', 
    jsonb_build_object('period_id', p_period_id, 'bet_type', p_bet_type, 'bet_value', p_bet_value));
  
  RETURN QUERY SELECT TRUE, 'Bet placed successfully', updated_balance;
END;
$$;

-- Function to generate and settle period result
CREATE OR REPLACE FUNCTION public.generate_and_settle_result(p_period_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  winning_number INTEGER;
  winning_colors TEXT[];
  result_json JSONB;
  bet RECORD;
  payout DECIMAL;
BEGIN
  -- Generate secure random result
  winning_number := floor(random() * 10)::INTEGER;
  winning_colors := public.get_result_colors(winning_number);
  
  -- Create result JSON
  result_json := jsonb_build_object(
    'number', winning_number,
    'colors', winning_colors
  );
  
  -- Update period with result
  UPDATE public.game_periods
  SET result = result_json, is_locked = true
  WHERE id = p_period_id;
  
  -- Process all bets for this period
  FOR bet IN
    SELECT * FROM public.user_bets
    WHERE period_id = p_period_id AND result IS NULL
  LOOP
    payout := 0;
    
    -- Calculate payout
    IF bet.bet_type = 'number' AND bet.bet_value::INTEGER = winning_number THEN
      payout := bet.amount * 9;
    ELSIF bet.bet_type = 'color' AND bet.bet_value = ANY(winning_colors) THEN
      payout := bet.amount * 2;
    END IF;
    
    -- Update bet result
    UPDATE public.user_bets
    SET 
      result = CASE WHEN payout > 0 THEN 'win' ELSE 'lose' END,
      payout = payout
    WHERE id = bet.id;
    
    -- Credit winnings if won
    IF payout > 0 THEN
      UPDATE public.users
      SET balance = balance + payout
      WHERE id = bet.user_id;
      
      -- Create win transaction
      INSERT INTO public.transactions (user_id, amount, type, metadata)
      VALUES (bet.user_id, payout, 'win', 
        jsonb_build_object('period_id', p_period_id, 'bet_id', bet.id));
    END IF;
  END LOOP;
END;
$$;

-- Enable realtime for tables
ALTER TABLE public.game_periods REPLICA IDENTITY FULL;
ALTER TABLE public.user_bets REPLICA IDENTITY FULL;
ALTER TABLE public.users REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_periods;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_bets;
