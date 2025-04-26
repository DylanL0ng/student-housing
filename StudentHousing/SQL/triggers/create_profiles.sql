CREATE OR REPLACE FUNCTION public.create_profiles_on_new_profile()
RETURNS trigger AS $$
BEGIN
    -- Insert two new profiles into the profile_mapping table
    INSERT INTO public.profile_mapping (linked_profile, type, created)
    VALUES (NEW.id, 'flatmate', false), (NEW.id, 'accommodation', false);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_profiles_on_new_profile();