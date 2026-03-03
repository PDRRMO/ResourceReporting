-- Seed data for municipalities with GeoJSON boundaries
-- Run with: supabase db push

-- Add municipalities with boundary shapes (GeoJSON Polygons)
INSERT INTO municipality (name, latitude, longitude, boundary_shape) VALUES
(
  'Iloilo City', 
  10.7202, 
  122.5621, 
  '{"type":"Polygon","coordinates":[[[122.4941,10.6779],[122.5986,10.6779],[122.5986,10.7809],[122.4941,10.7809],[122.4941,10.6779]]]}'
),
(
  'Oton', 
  10.5917, 
  122.4758, 
  '{"type":"Polygon","coordinates":[[[122.4400,10.5500],[122.5100,10.5500],[122.5100,10.6400],[122.4400,10.6400],[122.4400,10.5500]]]}'
),
(
  'Pavia', 
  10.8291, 
  122.5303, 
  '{"type":"Polygon","coordinates":[[[122.5000,10.8000],[122.5600,10.8000],[122.5600,10.8600],[122.5000,10.8600],[122.5000,10.8000]]]}'
),
(
  'Leganes', 
  10.8317, 
  122.5083, 
  '{"type":"Polygon","coordinates":[[[122.4800,10.8000],[122.5400,10.8000],[122.5400,10.8700],[122.4800,10.8700],[122.4800,10.8000]]]}'
),
(
  'Santa Barbara', 
  10.8167, 
  122.5167, 
  '{"type":"Polygon","coordinates":[[[122.4700,10.7700],[122.5600,10.7700],[122.5600,10.8600],[122.4700,10.8600],[122.4700,10.7700]]]}'
),
(
  'Dumangas', 
  10.7833, 
  122.5000, 
  '{"type":"Polygon","coordinates":[[[122.4400,10.7200],[122.5600,10.7200],[122.5600,10.8500],[122.4400,10.8500],[122.4400,10.7200]]]}'
)
ON CONFLICT DO NOTHING;

-- Add resource types
INSERT INTO resource_types (code, full_name, icon) VALUES
('ambulance', 'Ambulance', 'ambulance'),
('firetruck', 'Fire Truck', 'firetruck'),
('rescue', 'Rescue Team', 'life-buoy'),
('hospital', 'Hospital', 'building'),
('shelter', 'Emergency Shelter', 'home'),
('comm', 'Communications', 'radio'),
('tools', 'Equipment/Tools', 'wrench'),
('trucks', 'Utility Trucks', 'truck'),
('watercraft', 'Watercraft', 'ship'),
('fr', 'Fire Response', 'flame'),
('har', 'High Angle Rescue', 'mountain'),
('usar', 'Urban Search & Rescue', 'search'),
('wasar', 'Water Rescue', 'waves'),
('ews', 'Early Warning System', 'siren'),
('ems', 'Emergency Medical Services', 'heart-pulse')
ON CONFLICT (code) DO NOTHING;
