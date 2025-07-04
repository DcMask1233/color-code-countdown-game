-- Create profile for existing user who doesn't have one
INSERT INTO public.users (id, balance) 
VALUES ('8d423bf2-ab6e-49a0-b006-3f1deea773d9', 1000)
ON CONFLICT (id) DO NOTHING;