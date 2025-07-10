-- Generate a test result for the existing period to verify the display works
UPDATE public.game_periods 
SET result = jsonb_build_object(
  'number', 7,
  'colors', ARRAY['green']
),
is_locked = true
WHERE id = 1;