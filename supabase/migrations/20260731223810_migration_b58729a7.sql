-- Device integration tables for golf tracking devices
-- Supports OAuth connections and automatic data sync

-- Device providers (Trackman, Arccos, Shot Scope, SwingDaddy)
CREATE TABLE IF NOT EXISTS device_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  oauth_authorize_url TEXT,
  oauth_token_url TEXT,
  api_base_url TEXT,
  webhook_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  required_tier TEXT[], -- tiers that can access this device
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User device connections
CREATE TABLE IF NOT EXISTS user_device_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES device_providers(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  device_user_id TEXT, -- user's ID on the device platform
  device_username TEXT,
  connection_status TEXT DEFAULT 'active', -- active, expired, revoked, error
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'hourly', -- realtime, hourly, daily, manual
  auto_sync_enabled BOOLEAN DEFAULT true,
  error_message TEXT,
  error_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- Synced swing data from devices
CREATE TABLE IF NOT EXISTS device_swing_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES user_device_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_swing_id TEXT NOT NULL, -- unique ID from device platform
  swing_date TIMESTAMPTZ NOT NULL,
  club_type TEXT,
  club_name TEXT,
  
  -- Swing metrics
  swing_speed DECIMAL(5,2), -- mph
  ball_speed DECIMAL(5,2), -- mph
  smash_factor DECIMAL(3,2),
  launch_angle DECIMAL(4,2), -- degrees
  attack_angle DECIMAL(4,2), -- degrees
  club_path DECIMAL(4,2), -- degrees
  face_angle DECIMAL(4,2), -- degrees
  
  -- Ball flight data
  spin_rate INTEGER, -- rpm
  backspin INTEGER, -- rpm
  sidespin INTEGER, -- rpm
  carry_distance DECIMAL(6,2), -- yards
  total_distance DECIMAL(6,2), -- yards
  max_height DECIMAL(5,2), -- yards
  
  -- Shot dispersion
  lateral_deviation DECIMAL(5,2), -- yards (left/right from target)
  offline_distance DECIMAL(5,2), -- yards
  shot_shape TEXT, -- draw, fade, straight, hook, slice
  
  -- GPS and course data (if available)
  gps_latitude DECIMAL(10,8),
  gps_longitude DECIMAL(11,8),
  course_name TEXT,
  hole_number INTEGER,
  target_distance DECIMAL(6,2),
  
  -- Device metadata
  device_model TEXT,
  firmware_version TEXT,
  conditions JSONB, -- weather, wind, temperature
  notes TEXT,
  raw_data JSONB, -- full device response
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, device_swing_id)
);

-- Device sync logs for debugging and monitoring
CREATE TABLE IF NOT EXISTS device_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES user_device_connections(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- manual, automatic, webhook
  sync_status TEXT NOT NULL, -- success, partial, failed
  records_imported INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_connections_user ON user_device_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_device_connections_status ON user_device_connections(connection_status);
CREATE INDEX IF NOT EXISTS idx_device_swing_data_user ON device_swing_data(user_id);
CREATE INDEX IF NOT EXISTS idx_device_swing_data_connection ON device_swing_data(connection_id);
CREATE INDEX IF NOT EXISTS idx_device_swing_data_date ON device_swing_data(swing_date DESC);
CREATE INDEX IF NOT EXISTS idx_device_sync_logs_connection ON device_sync_logs(connection_id);

-- RLS Policies
ALTER TABLE device_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_device_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_swing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sync_logs ENABLE ROW LEVEL SECURITY;

-- Device providers are public read
CREATE POLICY "public_read_providers" ON device_providers FOR SELECT USING (true);

-- Users can only see their own connections
CREATE POLICY "users_read_own_connections" ON user_device_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_connections" ON user_device_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_connections" ON user_device_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_connections" ON user_device_connections FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own swing data
CREATE POLICY "users_read_own_swing_data" ON device_swing_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service_insert_swing_data" ON device_swing_data FOR INSERT WITH CHECK (true);

-- Users can see their own sync logs
CREATE POLICY "users_read_own_sync_logs" ON device_sync_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_device_connections
    WHERE user_device_connections.id = device_sync_logs.connection_id
    AND user_device_connections.user_id = auth.uid()
  )
);

-- Insert default device providers
INSERT INTO device_providers (name, display_name, description, required_tier) VALUES
  ('trackman', 'TrackMan', 'Professional launch monitor with comprehensive swing data', ARRAY['premium', 'pro']),
  ('arccos', 'Arccos Golf', 'Smart sensors with automatic shot tracking and GPS', ARRAY['premium', 'pro']),
  ('shot_scope', 'Shot Scope', 'GPS watch with performance tracking', ARRAY['premium', 'pro']),
  ('swing_daddy', 'SwingDaddy', 'AI-powered swing analyzer', ARRAY['premium', 'pro'])
ON CONFLICT (name) DO NOTHING;