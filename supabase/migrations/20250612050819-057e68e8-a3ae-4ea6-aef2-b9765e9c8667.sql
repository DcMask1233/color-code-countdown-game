
-- Create game_results table
CREATE TABLE public.game_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period TEXT NOT NULL,
  number INTEGER NOT NULL CHECK (number >= 0 AND number <= 9),
  result_color TEXT[] NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('parity', 'sapre', 'bcone', 'emerd')),
  duration INTEGER NOT NULL CHECK (duration IN (60, 180, 300)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_game_results_game_type_duration ON public.game_results(game_type, duration, created_at DESC);
CREATE INDEX idx_game_results_period ON public.game_results(period);

-- Enable Row Level Security
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (since game results are public)
CREATE POLICY "Allow public read access to game results" 
  ON public.game_results 
  FOR SELECT 
  TO public 
  USING (true);

-- Create policy to allow inserts (for the edge function)
CREATE POLICY "Allow service role to insert game results" 
  ON public.game_results 
  FOR INSERT 
  TO service_role 
  WITH CHECK (true);

-- Enable realtime for the table
ALTER TABLE public.game_results REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_results;

-- Create function to generate winning number
CREATE OR REPLACE FUNCTION public.generate_winning_number()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN floor(random() * 10)::INTEGER;
END;
$$;

-- Create function to get result colors based on number
CREATE OR REPLACE FUNCTION public.get_result_colors(winning_number INTEGER)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
BEGIN
  CASE winning_number
    WHEN 0 THEN RETURN ARRAY['red', 'violet'];
    WHEN 5 THEN RETURN ARRAY['green', 'violet'];
    WHEN 1, 3, 7, 9 THEN RETURN ARRAY['green'];
    WHEN 2, 4, 6, 8 THEN RETURN ARRAY['red'];
    ELSE RETURN ARRAY['green']; -- fallback
  END CASE;
END;
$$;

-- Create function to generate period
CREATE OR REPLACE FUNCTION public.generate_period(game_duration INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  ist_time TIMESTAMP WITH TIME ZONE;
  start_of_day TIMESTAMP WITH TIME ZONE;
  seconds_since_start INTEGER;
  round_number INTEGER;
  year_month_day TEXT;
BEGIN
  -- Get IST time (UTC + 5:30)
  ist_time := now() AT TIME ZONE 'UTC' + INTERVAL '5 hours 30 minutes';
  
  -- Get start of day in IST
  start_of_day := date_trunc('day', ist_time);
  
  -- Calculate seconds since start of day
  seconds_since_start := EXTRACT(EPOCH FROM (ist_time - start_of_day))::INTEGER;
  
  -- Calculate round number
  round_number := (seconds_since_start / game_duration) + 1;
  
  -- Format date as YYYYMMDD
  year_month_day := to_char(ist_time, 'YYYYMMDD');
  
  -- Return period as YYYYMMDDXXXX
  RETURN year_month_day || lpad(round_number::TEXT, 4, '0');
END;
$$;

-- Create function to insert game result
CREATE OR REPLACE FUNCTION public.insert_game_result(
  p_game_type TEXT,
  p_duration INTEGER
)
RETURNS TABLE(
  period TEXT,
  number INTEGER,
  result_color TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_period TEXT;
  winning_number INTEGER;
  colors TEXT[];
BEGIN
  -- Generate period
  new_period := public.generate_period(p_duration);
  
  -- Generate winning number
  winning_number := public.generate_winning_number();
  
  -- Get result colors
  colors := public.get_result_colors(winning_number);
  
  -- Insert the result
  INSERT INTO public.game_results (period, number, result_color, game_type, duration)
  VALUES (new_period, winning_number, colors, p_game_type, p_duration);
  
  -- Return the result
  RETURN QUERY SELECT new_period, winning_number, colors;
END;
$$;
