
-- Fix the missing database function that useGamePeriods is trying to call
CREATE OR REPLACE FUNCTION public.get_current_game_period(p_duration integer)
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
