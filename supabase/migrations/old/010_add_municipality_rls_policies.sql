-- Add INSERT and UPDATE policies for municipality table (missing from 007_create_rls_policies.sql)

-- Allow admin to insert municipalities
CREATE POLICY "Allow admin insert on municipality" ON municipality FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin'));

-- Allow admin to update municipalities
CREATE POLICY "Allow admin update on municipality" ON municipality FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin'));

-- Allow admin to delete municipalities
CREATE POLICY "Allow admin delete on municipality" ON municipality FOR DELETE USING (auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin'));
