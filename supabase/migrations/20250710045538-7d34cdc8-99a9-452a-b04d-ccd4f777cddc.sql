-- Create a current period with result for proper display
-- First, let's create a period close to current time
INSERT INTO public.game_periods (game_type, game_mode, period, start_time, end_time, result, is_locked)
VALUES (
  'parity', 
  'wingo1min', 
  '20250710624', -- Previous period to current 20250710625
  NOW() - INTERVAL '60 seconds',
  NOW(),
  jsonb_build_object('number', 3, 'colors', ARRAY['green']),
  true
);

-- Add another recent period
INSERT INTO public.game_periods (game_type, game_mode, period, start_time, end_time, result, is_locked)
VALUES (
  'parity', 
  'wingo1min', 
  '20250710623', 
  NOW() - INTERVAL '120 seconds',
  NOW() - INTERVAL '60 seconds',
  jsonb_build_object('number', 5, 'colors', ARRAY['green', 'violet']),
  true
);