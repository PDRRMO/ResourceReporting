-- Creating Resource Types --
CREATE TABLE IF NOT EXISTS resource_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE resource_types IS 'Store types of resources';
COMMENT ON COLUMN resource_types.code IS 'Short code for identifier such as ambulance / firetruck';
COMMENT ON COLUMN resource_types.full_name IS 'Full descriptive name ';
COMMENT ON COLUMN resource_types.icon IS 'Icon identifer for UI display';