-- Add document resource type
INSERT INTO resource_types (code, full_name, icon) VALUES
('document', 'Document', 'file-text')
ON CONFLICT (code) DO NOTHING;
