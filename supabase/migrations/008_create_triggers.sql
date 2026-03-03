-- Functions to auto-create user profile when users signs up
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$ 
BEGIN 
    INSERT INTO public.users (user_id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
    );
    RETURN NEW;
END;

$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to auto-log status changes
CREATE OR REPLACE FUNCTION handle_resource_status_change()
RETURNS TRIGGER AS $$
BEGIN 
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO status_logs (resource_id, changed_by, old_status, new_status)
        VALUES (
            NEW.resource_id,
            auth.uid(),
            OLD.status,
            NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log status changes
CREATE TRIGGER on_resource_status_changed
    AFTER UPDATE ON resource
    FOR EACH ROW EXECUTE FUNCTION handle_resource_status_change();