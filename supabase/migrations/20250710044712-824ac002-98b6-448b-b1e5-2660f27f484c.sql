-- Clean up existing period data to use consistent YYYYMMDDRRR format
-- and remove periods with inconsistent formatting

-- DELETE periods that don't match the YYYYMMDDRRR pattern (11 characters, all digits)
DELETE FROM public.game_periods 
WHERE LENGTH(period) != 11 OR period !~ '^[0-9]{11}$';

-- Note: This will clean up old test data with formats like '20250704660_1'
-- The generate_period function already produces the correct format YYYYMMDDRRR