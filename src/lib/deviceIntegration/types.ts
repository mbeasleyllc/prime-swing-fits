// Type definitions for device integration system

export type DeviceProvider = 'trackman' | 'arccos' | 'shot_scope' | 'swing_daddy';

export type ConnectionStatus = 'active' | 'expired' | 'revoked' | 'error';

export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'manual';

export interface DeviceConnection {
  id: string;
  user_id: string;
  provider_id: string;
  device_username?: string;
  connection_status: ConnectionStatus;
  last_sync_at?: string;
  sync_frequency: SyncFrequency;
  auto_sync_enabled: boolean;
  error_message?: string;
  error_count: number;
  created_at: string;
  provider: {
    name: DeviceProvider;
    display_name: string;
    logo_url?: string;
  };
}

export interface SwingData {
  id: string;
  connection_id: string;
  user_id: string;
  device_swing_id: string;
  swing_date: string;
  club_type?: string;
  club_name?: string;
  
  // Swing metrics
  swing_speed?: number;
  ball_speed?: number;
  smash_factor?: number;
  launch_angle?: number;
  attack_angle?: number;
  club_path?: number;
  face_angle?: number;
  
  // Ball flight
  spin_rate?: number;
  backspin?: number;
  sidespin?: number;
  carry_distance?: number;
  total_distance?: number;
  max_height?: number;
  
  // Shot dispersion
  lateral_deviation?: number;
  offline_distance?: number;
  shot_shape?: string;
  
  // GPS data
  gps_latitude?: number;
  gps_longitude?: number;
  course_name?: string;
  hole_number?: number;
  target_distance?: number;
  
  created_at: string;
}

export interface SyncLog {
  id: string;
  connection_id: string;
  sync_type: 'manual' | 'automatic' | 'webhook';
  sync_status: 'success' | 'partial' | 'failed';
  records_imported: number;
  records_failed: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface DeviceOAuthConfig {
  provider: DeviceProvider;
  authorize_url: string;
  token_url: string;
  client_id: string;
  client_secret: string;
  scope: string[];
  redirect_uri: string;
}

export interface DeviceAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    total: number;
    has_more: boolean;
  };
}