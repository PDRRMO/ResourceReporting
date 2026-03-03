-- Create status_logs table
CREATE TABLE IF NOT EXISTS status_logs (
    status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES resource(resource_id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    on_status TEXT,
    new_status TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE status_logs IS 'Tracks status changes on resources';