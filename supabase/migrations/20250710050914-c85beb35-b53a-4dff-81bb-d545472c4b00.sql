-- Fix the insert_game_result function to work with game_periods table
CREATE OR REPLACE FUNCTION public.insert_game_result(p_game_type text, p_duration integer)
 RETURNS TABLE(period text, number integer, result_color text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  new_period TEXT;
  winning_number INTEGER;
  colors TEXT[];
  game_mode TEXT;
  existing_period_id BIGINT;
  period_start TIMESTAMP WITH TIME ZONE;
  period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Convert duration to game_mode
  CASE p_duration
    WHEN 60 THEN game_mode := 'wingo1min';
    WHEN 180 THEN game_mode := 'wingo3min';
    WHEN 300 THEN game_mode := 'wingo5min';
    ELSE game_mode := 'wingo1min';
  END CASE;

  -- Generate period using the existing function
  new_period := public.generate_period(p_duration);
  
  -- Generate winning number and colors
  winning_number := public.generate_winning_number();
  colors := public.get_result_colors(winning_number);
  
  -- Calculate period times
  period_start := now();
  period_end := period_start + (p_duration || ' seconds')::INTERVAL;
  
  -- Check if period already exists
  SELECT id INTO existing_period_id
  FROM public.game_periods
  WHERE game_type = p_game_type 
    AND game_mode = game_mode 
    AND period = new_period;
  
  IF existing_period_id IS NOT NULL THEN
    -- Update existing period with result if it doesn't have one
    UPDATE public.game_periods
    SET 
      result = jsonb_build_object('number', winning_number, 'colors', colors),
      is_locked = true
    WHERE id = existing_period_id 
      AND result IS NULL;
  ELSE
    -- Insert new period with result
    INSERT INTO public.game_periods (
      game_type, 
      game_mode, 
      period, 
      result, 
      start_time, 
      end_time, 
      is_locked
    )
    VALUES (
      p_game_type, 
      game_mode, 
      new_period, 
      jsonb_build_object('number', winning_number, 'colors', colors),
      period_start,
      period_end,
      true
    );
  END IF;
  
  -- Settle any existing bets for this period
  PERFORM public.generate_and_settle_result(
    (SELECT id FROM public.game_periods 
     WHERE game_type = p_game_type 
       AND game_mode = game_mode 
       AND period = new_period 
     LIMIT 1)
  );
  
  -- Return the result
  RETURN QUERY
  SELECT 
    new_period, 
    winning_number, 
    colors;
END;
$$;