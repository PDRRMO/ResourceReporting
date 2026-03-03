-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resource_municipality ON resource(municipality_id);
CREATE INDEX IF NOT EXISTS idx_resource_type ON resource(type_id);
CREATE INDEX IF NOT EXISTS idx_resource_status ON resource(status);
CREATE INDEX IF NOT EXISTS idx_status_logs_resource On status_logs(resource_id);