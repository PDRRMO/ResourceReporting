-- Create resource table
CREATE TABLE IF NOT EXISTS resource (
    resource_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type_id UUID REFERENCES resource_types(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipality(municipality_id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('ready', 'deployed', 'maintenance')) DEFAULT 'ready',
    photo_url TEXT,
    description TEXT,
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    added_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE resource IS 'Core table for resources';
COMMENT ON COLUMN resource.status IS 'Resource availability status';
COMMENT ON COLUMN resource.photo_url IS 'URL to resource photo in storage';