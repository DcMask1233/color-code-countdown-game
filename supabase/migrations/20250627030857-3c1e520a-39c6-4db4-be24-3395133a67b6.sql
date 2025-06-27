
-- Update the generate_period function to use the new YYYY-MM-DD-XXX format
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
  -- Get IST time (UTC + 5.5 hours) - exactly like frontend
  ist_time := now() AT TIME ZONE 'UTC' + INTERVAL '5 hours 30 minutes';
  
  -- Get start of day in IST
  start_of_day := date_trunc('day', ist_time);
  
  -- Calculate seconds since start of day
  seconds_since_start := EXTRACT(EPOCH FROM (ist_time - start_of_day))::INTEGER;
  
  -- Calculate period number - add 1 to start from 001 at midnight (exactly like frontend)
  period_number := floor(seconds_since_start / game_duration) + 1;
  
  -- Format date as YYYY-MM-DD (human readable)
  formatted_date := to_char(ist_time, 'YYYY-MM-DD');
  
  -- Return period as YYYY-MM-DD-XXX (human readable format)
  RETURN formatted_date || '-' || lpad(period_number::TEXT, 3, '0');
END;
$$;
