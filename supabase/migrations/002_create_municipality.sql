-- Create municipality table
CREATE TABLE IF NOT EXISTS municipality (
    municipality_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    boundary_shape JSONB
);

COMMENT ON TABLE municipality IS 'Stores municipality data';
COMMENT ON COLUMN municipality.name IS 'Name of the municipality';
COMMENT ON COLUMN municipality.latitude IS 'Center latitude coordinate';
COMMENT ON COLUMN municipality.longitude IS 'Center longitude coordinate';
COMMENT ON COLUMN municipality.boundary_shape IS 'GeoJSON boundary shape for mapping';