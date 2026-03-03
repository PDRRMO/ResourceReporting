-- Resource table: ANYONE can READ, ONLY RESPONDERS CAN INSERT / UPDATE / DELETE    
-- Allowing PUBLIC read on RESOURCES
CREATE POLICY "Allow public read on resource" ON resource FOR SELECT USING (true);

-- Allow only responder and admin to INSERT 
CREATE POLICY "Allow responder insert on resources" ON resource FOR INSERT WITH CHECK (auth.uid() IN ( SELECT user_id FROM users WHERE role IN ('responder', 'admin')));

-- Allow responder and admin to update 
CREATE POLICY "Allow responder update on resource" ON resource
    FOR UPDATE USING ( auth.uid() IN (SELECT user_id FROM users WHERE role IN ('responder', 'admin')));

-- Also enable read on other tables for public access
CREATE POLICY "Allow public read on resource_types" ON resource_types FOR SELECT USING (true);
CREATE POLICY "Allow public read on municipality" ON municipality FOR SELECT USING (true);
CREATE POLICY "Allow public read on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read on status_logs" ON status_logs FOR SELECT USING (true);