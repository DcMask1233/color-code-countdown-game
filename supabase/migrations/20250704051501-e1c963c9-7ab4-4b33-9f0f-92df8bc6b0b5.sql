-- Create trigger to automatically create user profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, balance)
  VALUES (NEW.id, 1000)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profile for existing user
INSERT INTO public.users (id, balance) 
VALUES ('8d423bf2-ab6e-49a0-b006-3f1deea773d9', 1000)
ON CONFLICT (id) DO NOTHING;