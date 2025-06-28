
-- Update the generate_period function to use YYYYMMDDRRR format
CREATE OR REPLACE FUNCTION public.generate_period(game_duration integer)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  ist_time TIMESTAMP WITH TIME ZONE;
  start_of_day TIMESTAMP WITH TIME ZONE;
  seconds_since_start INTEGER;
  period_number INTEGER;
  formatted_date TEXT;
BEGIN
  -- Get IST time (UTC + 5.5 hours)
  ist_time := now() AT TIME ZONE 'UTC' + INTERVAL '5 hours 30 minutes';
  
  -- Get start of day in IST
  start_of_day := date_trunc('day', ist_time);
  
  -- Calculate seconds since start of day
  seconds_since_start := EXTRACT(EPOCH FROM (ist_time - start_of_day))::INTEGER;
  
  -- Calculate period number - add 1 to start from 001 at midnight
  period_number := floor(seconds_since_start / game_duration) + 1;
  
  -- Format date as YYYYMMDD
  formatted_date := to_char(ist_time, 'YYYYMMDD');
  
  -- Return period as YYYYMMDDRRR format
  RETURN formatted_date || lpad(period_number::TEXT, 3, '0');
END;
$$;

-- Create a function to get current period with time left for frontend
CREATE OR REPLACE FUNCTION public.get_current_period_info(p_duration integer)
RETURNS TABLE(period text, time_left integer)
LANGUAGE plpgsql
AS $$
DECLARE
  current_period TEXT;
  ist_time TIMESTAMP WITH TIME ZONE;
  start_of_day TIMESTAMP WITH TIME ZONE;
  seconds_since_start INTEGER;
  seconds_in_current_period INTEGER;
  time_remaining INTEGER;
BEGIN
  -- Get current period
  current_period := public.generate_period(p_duration);
  
  -- Calculate time left in current period
  ist_time := now() AT TIME ZONE 'UTC' + INTERVAL '5 hours 30 minutes';
  start_of_day := date_trunc('day', ist_time);
  seconds_since_start := EXTRACT(EPOCH FROM (ist_time - start_of_day))::INTEGER;
  seconds_in_current_period := seconds_since_start % p_duration;
  time_remaining := p_duration - seconds_in_current_period;
  
  RETURN QUERY SELECT current_period, time_remaining;
END;
$$;
