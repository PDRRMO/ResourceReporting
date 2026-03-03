-- Add INSERT, UPDATE, DELETE policies for resource_types table

-- Allow admin to insert resource_types
CREATE POLICY "Allow admin insert on resource_types" ON resource_types FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin'));

-- Allow admin to update resource_types
CREATE POLICY "Allow admin update on resource_types" ON resource_types FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin'));

-- Allow admin to delete resource_types
CREATE POLICY "Allow admin delete on resource_types" ON resource_types FOR DELETE USING (auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin'));
