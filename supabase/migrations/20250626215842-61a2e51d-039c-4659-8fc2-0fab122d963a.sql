
-- Add missing columns to the wallets table
ALTER TABLE public.wallets 
ADD COLUMN IF NOT EXISTS total_bet_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_withdraw_amount NUMERIC DEFAULT 0;

-- Update existing records to have default values
UPDATE public.wallets 
SET 
  total_bet_amount = COALESCE(total_bet_amount, 0),
  total_deposit_amount = COALESCE(total_deposit_amount, 0),
  total_withdraw_amount = COALESCE(total_withdraw_amount, 0)
WHERE total_bet_amount IS NULL 
   OR total_deposit_amount IS NULL 
   OR total_withdraw_amount IS NULL;
