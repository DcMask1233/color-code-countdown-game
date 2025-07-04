-- Create initial game periods for all game types and modes
-- This will populate the database with current periods so the app can function

DO $$
DECLARE
  current_period TEXT;
  period_start TIMESTAMP WITH TIME ZONE;
  period_end TIMESTAMP WITH TIME ZONE;
  game_types TEXT[] := ARRAY['parity', 'sapre', 'bcone', 'emerd'];
  game_modes TEXT[] := ARRAY['wingo1min', 'wingo3min', 'wingo5min'];
  duration_map JSONB := '{"wingo1min": 60, "wingo3min": 180, "wingo5min": 300}'::JSONB;
  current_duration INTEGER;
  v_game_type TEXT;
  v_game_mode TEXT;
BEGIN
  -- Loop through each game type and mode combination
  FOREACH v_game_type IN ARRAY game_types
  LOOP
    FOREACH v_game_mode IN ARRAY game_modes
    LOOP
      -- Get duration for this game mode
      current_duration := (duration_map->v_game_mode)::INTEGER;
      
      -- Generate current period
      current_period := public.generate_period(current_duration);
      
      -- Calculate start and end times for current period
      period_start := now();
      period_end := period_start + (current_duration || ' seconds')::INTERVAL;
      
      -- Insert current period
      INSERT INTO public.game_periods (game_type, game_mode, period, start_time, end_time)
      VALUES (v_game_type, v_game_mode, current_period, period_start, period_end)
      ON CONFLICT (game_type, game_mode, period) DO NOTHING;
      
      -- Insert a few historical periods for demo data
      FOR i IN 1..5
      LOOP
        current_period := public.generate_period(current_duration);
        period_start := now() - (i * current_duration || ' seconds')::INTERVAL;
        period_end := period_start + (current_duration || ' seconds')::INTERVAL;
        
        INSERT INTO public.game_periods (game_type, game_mode, period, start_time, end_time, result)
        VALUES (
          v_game_type, 
          v_game_mode, 
          current_period || '_' || i::TEXT, -- Make periods unique for historical data
          period_start, 
          period_end,
          jsonb_build_object(
            'number', floor(random() * 10)::INTEGER,
            'colors', CASE 
              WHEN floor(random() * 10)::INTEGER = 0 THEN ARRAY['red', 'violet']
              WHEN floor(random() * 10)::INTEGER = 5 THEN ARRAY['green', 'violet']
              WHEN floor(random() * 10)::INTEGER IN (1,3,7,9) THEN ARRAY['green']
              ELSE ARRAY['red']
            END
          )
        )
        ON CONFLICT (game_type, game_mode, period) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;