-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to generate game results every minute
-- This will call the edge function to generate results for all game types
SELECT cron.schedule(
  'generate-game-results-every-minute',
  '* * * * *', -- every minute
  $$
  SELECT net.http_post(
    url := 'https://rdhfmkqxkycdjkystkbt.supabase.co/functions/v1/generate-game-results',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkaGZta3F4a3ljZGpreXN0a2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTUwNTQsImV4cCI6MjA2NDY3MTA1NH0.6RrvPNTklAlq9awTWxGBVNWlwPZ9qW13MzZw8Bwvoy0"}'::jsonb,
    body := '{"source": "cron_job"}'::jsonb
  );
  $$
);

-- Also enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;