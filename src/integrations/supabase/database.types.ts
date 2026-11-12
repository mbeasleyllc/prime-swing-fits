/* eslint-disable @typescript-eslint/no-empty-object-type */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievement_badges: {
        Row: {
          badge_description: string
          badge_icon: string | null
          badge_name: string
          badge_type: string
          created_at: string | null
          earned_date: string
          id: string
          metric_value: number | null
          user_id: string
        }
        Insert: {
          badge_description: string
          badge_icon?: string | null
          badge_name: string
          badge_type: string
          created_at?: string | null
          earned_date?: string
          id?: string
          metric_value?: number | null
          user_id: string
        }
        Update: {
          badge_description?: string
          badge_icon?: string | null
          badge_name?: string
          badge_type?: string
          created_at?: string | null
          earned_date?: string
          id?: string
          metric_value?: number | null
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          times_used: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          times_used?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          times_used?: number
          updated_at?: string
        }
        Relationships: []
      }
      course_conditions: {
        Row: {
          ball_used: string | null
          id: string
          session_id: string
          turf_type: string | null
          typical_weather: string | null
          user_id: string
        }
        Insert: {
          ball_used?: string | null
          id?: string
          session_id: string
          turf_type?: string | null
          typical_weather?: string | null
          user_id: string
        }
        Update: {
          ball_used?: string | null
          id?: string
          session_id?: string
          turf_type?: string | null
          typical_weather?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_conditions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "fitting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_conditions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      current_equipment: {
        Row: {
          club_brand: string | null
          club_length: string | null
          grip_size: string | null
          id: string
          pain_points: string | null
          satisfaction: number | null
          session_id: string
          shaft_flex: string | null
          user_id: string
        }
        Insert: {
          club_brand?: string | null
          club_length?: string | null
          grip_size?: string | null
          id?: string
          pain_points?: string | null
          satisfaction?: number | null
          session_id: string
          shaft_flex?: string | null
          user_id: string
        }
        Update: {
          club_brand?: string | null
          club_length?: string | null
          grip_size?: string | null
          id?: string
          pain_points?: string | null
          satisfaction?: number | null
          session_id?: string
          shaft_flex?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "current_equipment_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "fitting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "current_equipment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      device_providers: {
        Row: {
          api_base_url: string | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          oauth_authorize_url: string | null
          oauth_token_url: string | null
          required_tier: string[] | null
          updated_at: string | null
          webhook_secret: string | null
        }
        Insert: {
          api_base_url?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          oauth_authorize_url?: string | null
          oauth_token_url?: string | null
          required_tier?: string[] | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Update: {
          api_base_url?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          oauth_authorize_url?: string | null
          oauth_token_url?: string | null
          required_tier?: string[] | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Relationships: []
      }
      device_swing_data: {
        Row: {
          attack_angle: number | null
          backspin: number | null
          ball_speed: number | null
          carry_distance: number | null
          club_name: string | null
          club_path: number | null
          club_type: string | null
          conditions: Json | null
          connection_id: string
          course_name: string | null
          created_at: string | null
          device_model: string | null
          device_swing_id: string
          face_angle: number | null
          firmware_version: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          hole_number: number | null
          id: string
          lateral_deviation: number | null
          launch_angle: number | null
          max_height: number | null
          notes: string | null
          offline_distance: number | null
          raw_data: Json | null
          shot_shape: string | null
          sidespin: number | null
          smash_factor: number | null
          spin_rate: number | null
          swing_date: string
          swing_speed: number | null
          target_distance: number | null
          total_distance: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attack_angle?: number | null
          backspin?: number | null
          ball_speed?: number | null
          carry_distance?: number | null
          club_name?: string | null
          club_path?: number | null
          club_type?: string | null
          conditions?: Json | null
          connection_id: string
          course_name?: string | null
          created_at?: string | null
          device_model?: string | null
          device_swing_id: string
          face_angle?: number | null
          firmware_version?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          hole_number?: number | null
          id?: string
          lateral_deviation?: number | null
          launch_angle?: number | null
          max_height?: number | null
          notes?: string | null
          offline_distance?: number | null
          raw_data?: Json | null
          shot_shape?: string | null
          sidespin?: number | null
          smash_factor?: number | null
          spin_rate?: number | null
          swing_date: string
          swing_speed?: number | null
          target_distance?: number | null
          total_distance?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attack_angle?: number | null
          backspin?: number | null
          ball_speed?: number | null
          carry_distance?: number | null
          club_name?: string | null
          club_path?: number | null
          club_type?: string | null
          conditions?: Json | null
          connection_id?: string
          course_name?: string | null
          created_at?: string | null
          device_model?: string | null
          device_swing_id?: string
          face_angle?: number | null
          firmware_version?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          hole_number?: number | null
          id?: string
          lateral_deviation?: number | null
          launch_angle?: number | null
          max_height?: number | null
          notes?: string | null
          offline_distance?: number | null
          raw_data?: Json | null
          shot_shape?: string | null
          sidespin?: number | null
          smash_factor?: number | null
          spin_rate?: number | null
          swing_date?: string
          swing_speed?: number | null
          target_distance?: number | null
          total_distance?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_swing_data_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "user_device_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      device_sync_logs: {
        Row: {
          completed_at: string | null
          connection_id: string
          created_at: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          records_failed: number | null
          records_imported: number | null
          started_at: string
          sync_status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          records_failed?: number | null
          records_imported?: number | null
          started_at: string
          sync_status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          records_failed?: number | null
          records_imported?: number | null
          started_at?: string
          sync_status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_sync_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "user_device_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          email_type: string
          error_message: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          session_id: string | null
          status: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          email_type: string
          error_message?: string | null
          id?: string
          recipient_email: string
          sent_at?: string | null
          session_id?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          session_id?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "fitting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fitting_recommendations: {
        Row: {
          advisory_notes: string | null
          ball_compression: number | null
          ball_optimal_swing_speed: string | null
          ball_spin_rating: string | null
          club_length_adj: string | null
          club_type_rec: string | null
          driver_confidence: number | null
          driver_spec: string | null
          fairway_woods: string | null
          gaps_identified: string[] | null
          generated_at: string | null
          golf_ball_rec: string | null
          golf_balls_spec: Json | null
          grip_size_rec: string | null
          hybrids: string | null
          id: string
          irons_confidence: number | null
          irons_spec: string | null
          lie_angle_adj: string | null
          predicted_accuracy: string | null
          predicted_consistency: string | null
          predicted_driver_gain: string | null
          putter_confidence: number | null
          putter_spec: string | null
          recommended_bag: string | null
          redundancies: string[] | null
          session_id: string
          shaft_flex_rec: string | null
          shaft_weight: string | null
          user_id: string
          wedge_confidence: number | null
          wedges_spec: string | null
        }
        Insert: {
          advisory_notes?: string | null
          ball_compression?: number | null
          ball_optimal_swing_speed?: string | null
          ball_spin_rating?: string | null
          club_length_adj?: string | null
          club_type_rec?: string | null
          driver_confidence?: number | null
          driver_spec?: string | null
          fairway_woods?: string | null
          gaps_identified?: string[] | null
          generated_at?: string | null
          golf_ball_rec?: string | null
          golf_balls_spec?: Json | null
          grip_size_rec?: string | null
          hybrids?: string | null
          id?: string
          irons_confidence?: number | null
          irons_spec?: string | null
          lie_angle_adj?: string | null
          predicted_accuracy?: string | null
          predicted_consistency?: string | null
          predicted_driver_gain?: string | null
          putter_confidence?: number | null
          putter_spec?: string | null
          recommended_bag?: string | null
          redundancies?: string[] | null
          session_id: string
          shaft_flex_rec?: string | null
          shaft_weight?: string | null
          user_id: string
          wedge_confidence?: number | null
          wedges_spec?: string | null
        }
        Update: {
          advisory_notes?: string | null
          ball_compression?: number | null
          ball_optimal_swing_speed?: string | null
          ball_spin_rating?: string | null
          club_length_adj?: string | null
          club_type_rec?: string | null
          driver_confidence?: number | null
          driver_spec?: string | null
          fairway_woods?: string | null
          gaps_identified?: string[] | null
          generated_at?: string | null
          golf_ball_rec?: string | null
          golf_balls_spec?: Json | null
          grip_size_rec?: string | null
          hybrids?: string | null
          id?: string
          irons_confidence?: number | null
          irons_spec?: string | null
          lie_angle_adj?: string | null
          predicted_accuracy?: string | null
          predicted_consistency?: string | null
          predicted_driver_gain?: string | null
          putter_confidence?: number | null
          putter_spec?: string | null
          recommended_bag?: string | null
          redundancies?: string[] | null
          session_id?: string
          shaft_flex_rec?: string | null
          shaft_weight?: string | null
          user_id?: string
          wedge_confidence?: number | null
          wedges_spec?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fitting_recommendations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "fitting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fitting_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fitting_recommendations_v2: {
        Row: {
          category: string
          confidence_score: number | null
          created_at: string | null
          generated_at: string | null
          id: string
          recommendations: Json
          session_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          confidence_score?: number | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          recommendations?: Json
          session_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          confidence_score?: number | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          recommendations?: Json
          session_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fitting_recommendations_v2_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "fitting_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      fitting_rules: {
        Row: {
          created_at: string | null
          id: string
          input_field: string
          input_value: string
          output_field: string
          output_value: string
          priority: number | null
          rule_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          input_field: string
          input_value: string
          output_field: string
          output_value: string
          priority?: number | null
          rule_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          input_field?: string
          input_value?: string
          output_field?: string
          output_value?: string
          priority?: number | null
          rule_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fitting_sessions: {
        Row: {
          athletic_background: string[] | null
          average_score: number | null
          ball_striking_quality: string | null
          carries_driver: boolean | null
          carries_fairway_woods: string[] | null
          carries_hybrids: string[] | null
          carries_irons: string[] | null
          carries_putter: boolean | null
          carries_wedges: string[] | null
          carry_3wood: number | null
          carry_4iron: number | null
          carry_5iron: number | null
          carry_5wood: number | null
          choke_down_frequency: string | null
          clubs_age: string | null
          clubs_fitted_count: number | null
          completed_at: string | null
          created_at: string | null
          current_7iron_carry: number | null
          current_driver_flex: string | null
          current_driver_length: number | null
          current_driver_loft: number | null
          current_driver_make: string | null
          current_driver_model: string | null
          current_putter_length: number | null
          current_putter_model: string | null
          current_step: number | null
          distance_gap_target: number | null
          driver_accuracy_satisfaction: string | null
          driver_adjustability_importance: string | null
          driver_avg_carry: number | null
          driver_avg_total: number | null
          driver_ball_flight: string | null
          driver_best_distance: number | null
          driver_common_miss: string | null
          driver_current_flex: string | null
          driver_current_loft: number | null
          driver_distance_satisfaction: string | null
          driver_face_pref: string | null
          driver_head_shape_pref: string | null
          driver_head_size_pref: string | null
          driver_length: number | null
          driver_make: string | null
          driver_miss_pattern: Json | null
          driver_miss_percentage: number | null
          driver_model: string | null
          driver_performance_goals: Json | null
          driver_shaft_weight: number | null
          driver_sound_pref: string | null
          driver_swing_speed: string | null
          driver_tempo: string | null
          driver_trajectory: string | null
          experience_level: string | null
          fairway_accuracy: number | null
          flagged: boolean | null
          glove_size: string | null
          goals_ranking: Json | null
          hand_length: number | null
          handedness: string | null
          handicap_goal: number | null
          handicap_index: number | null
          has_clubs: boolean | null
          has_physical_limitations: boolean | null
          height_cm: number | null
          height_ft: number | null
          height_in: number | null
          hybrid_desired_flight: string | null
          hybrid_primary_use: string | null
          id: string
          iron_7_carry: number | null
          iron_7_flight: string | null
          iron_ball_speed: number | null
          iron_common_miss: string | null
          iron_current_length: string | null
          iron_descent_angle: number | null
          iron_dispersion: number | null
          iron_launch_angle: number | null
          iron_peak_height: number | null
          iron_priority_miss: string | null
          iron_shot_shape: string | null
          iron_spin_rate: number | null
          long_iron_miss_type: string | null
          long_iron_trouble_club: string | null
          longest_finger: number | null
          miss_percentage: number | null
          most_common_miss: string | null
          physical_limitations_text: string | null
          player_age: number | null
          player_name: string | null
          playing_frequency: string | null
          practice_frequency: string | null
          putter_alignment_pref: string | null
          putter_arm_hang: string | null
          putter_common_miss: string | null
          putter_current_length: number | null
          putter_eye_position: string | null
          putter_face_rotation: string | null
          putter_feel_pref: string | null
          putter_forgiveness_priority: string | null
          putter_forward_press: boolean | null
          putter_green_speed: string | null
          putter_grip_size_pref: string | null
          putter_hand_activity: string | null
          putter_head_style_pref: string | null
          putter_posture: string | null
          putter_satisfaction: string | null
          putter_sole_flush: string | null
          putter_stroke_type: string | null
          pw_loft: number | null
          replacement_scope: string | null
          selected_categories: Json | null
          status: string | null
          step_0_data: Json | null
          subscription_tier: string | null
          swing_tempo: string | null
          swing_type: string | null
          transition_speed: string | null
          typical_ball_flight: string | null
          typical_trajectory: string | null
          unit_preference: string | null
          user_id: string
          uses_category_selection: boolean | null
          wedge_common_miss: string | null
          wedge_current_challenge: string | null
          wrist_to_floor: number | null
          years_playing: string | null
        }
        Insert: {
          athletic_background?: string[] | null
          average_score?: number | null
          ball_striking_quality?: string | null
          carries_driver?: boolean | null
          carries_fairway_woods?: string[] | null
          carries_hybrids?: string[] | null
          carries_irons?: string[] | null
          carries_putter?: boolean | null
          carries_wedges?: string[] | null
          carry_3wood?: number | null
          carry_4iron?: number | null
          carry_5iron?: number | null
          carry_5wood?: number | null
          choke_down_frequency?: string | null
          clubs_age?: string | null
          clubs_fitted_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          current_7iron_carry?: number | null
          current_driver_flex?: string | null
          current_driver_length?: number | null
          current_driver_loft?: number | null
          current_driver_make?: string | null
          current_driver_model?: string | null
          current_putter_length?: number | null
          current_putter_model?: string | null
          current_step?: number | null
          distance_gap_target?: number | null
          driver_accuracy_satisfaction?: string | null
          driver_adjustability_importance?: string | null
          driver_avg_carry?: number | null
          driver_avg_total?: number | null
          driver_ball_flight?: string | null
          driver_best_distance?: number | null
          driver_common_miss?: string | null
          driver_current_flex?: string | null
          driver_current_loft?: number | null
          driver_distance_satisfaction?: string | null
          driver_face_pref?: string | null
          driver_head_shape_pref?: string | null
          driver_head_size_pref?: string | null
          driver_length?: number | null
          driver_make?: string | null
          driver_miss_pattern?: Json | null
          driver_miss_percentage?: number | null
          driver_model?: string | null
          driver_performance_goals?: Json | null
          driver_shaft_weight?: number | null
          driver_sound_pref?: string | null
          driver_swing_speed?: string | null
          driver_tempo?: string | null
          driver_trajectory?: string | null
          experience_level?: string | null
          fairway_accuracy?: number | null
          flagged?: boolean | null
          glove_size?: string | null
          goals_ranking?: Json | null
          hand_length?: number | null
          handedness?: string | null
          handicap_goal?: number | null
          handicap_index?: number | null
          has_clubs?: boolean | null
          has_physical_limitations?: boolean | null
          height_cm?: number | null
          height_ft?: number | null
          height_in?: number | null
          hybrid_desired_flight?: string | null
          hybrid_primary_use?: string | null
          id?: string
          iron_7_carry?: number | null
          iron_7_flight?: string | null
          iron_ball_speed?: number | null
          iron_common_miss?: string | null
          iron_current_length?: string | null
          iron_descent_angle?: number | null
          iron_dispersion?: number | null
          iron_launch_angle?: number | null
          iron_peak_height?: number | null
          iron_priority_miss?: string | null
          iron_shot_shape?: string | null
          iron_spin_rate?: number | null
          long_iron_miss_type?: string | null
          long_iron_trouble_club?: string | null
          longest_finger?: number | null
          miss_percentage?: number | null
          most_common_miss?: string | null
          physical_limitations_text?: string | null
          player_age?: number | null
          player_name?: string | null
          playing_frequency?: string | null
          practice_frequency?: string | null
          putter_alignment_pref?: string | null
          putter_arm_hang?: string | null
          putter_common_miss?: string | null
          putter_current_length?: number | null
          putter_eye_position?: string | null
          putter_face_rotation?: string | null
          putter_feel_pref?: string | null
          putter_forgiveness_priority?: string | null
          putter_forward_press?: boolean | null
          putter_green_speed?: string | null
          putter_grip_size_pref?: string | null
          putter_hand_activity?: string | null
          putter_head_style_pref?: string | null
          putter_posture?: string | null
          putter_satisfaction?: string | null
          putter_sole_flush?: string | null
          putter_stroke_type?: string | null
          pw_loft?: number | null
          replacement_scope?: string | null
          selected_categories?: Json | null
          status?: string | null
          step_0_data?: Json | null
          subscription_tier?: string | null
          swing_tempo?: string | null
          swing_type?: string | null
          transition_speed?: string | null
          typical_ball_flight?: string | null
          typical_trajectory?: string | null
          unit_preference?: string | null
          user_id: string
          uses_category_selection?: boolean | null
          wedge_common_miss?: string | null
          wedge_current_challenge?: string | null
          wrist_to_floor?: number | null
          years_playing?: string | null
        }
        Update: {
          athletic_background?: string[] | null
          average_score?: number | null
          ball_striking_quality?: string | null
          carries_driver?: boolean | null
          carries_fairway_woods?: string[] | null
          carries_hybrids?: string[] | null
          carries_irons?: string[] | null
          carries_putter?: boolean | null
          carries_wedges?: string[] | null
          carry_3wood?: number | null
          carry_4iron?: number | null
          carry_5iron?: number | null
          carry_5wood?: number | null
          choke_down_frequency?: string | null
          clubs_age?: string | null
          clubs_fitted_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          current_7iron_carry?: number | null
          current_driver_flex?: string | null
          current_driver_length?: number | null
          current_driver_loft?: number | null
          current_driver_make?: string | null
          current_driver_model?: string | null
          current_putter_length?: number | null
          current_putter_model?: string | null
          current_step?: number | null
          distance_gap_target?: number | null
          driver_accuracy_satisfaction?: string | null
          driver_adjustability_importance?: string | null
          driver_avg_carry?: number | null
          driver_avg_total?: number | null
          driver_ball_flight?: string | null
          driver_best_distance?: number | null
          driver_common_miss?: string | null
          driver_current_flex?: string | null
          driver_current_loft?: number | null
          driver_distance_satisfaction?: string | null
          driver_face_pref?: string | null
          driver_head_shape_pref?: string | null
          driver_head_size_pref?: string | null
          driver_length?: number | null
          driver_make?: string | null
          driver_miss_pattern?: Json | null
          driver_miss_percentage?: number | null
          driver_model?: string | null
          driver_performance_goals?: Json | null
          driver_shaft_weight?: number | null
          driver_sound_pref?: string | null
          driver_swing_speed?: string | null
          driver_tempo?: string | null
          driver_trajectory?: string | null
          experience_level?: string | null
          fairway_accuracy?: number | null
          flagged?: boolean | null
          glove_size?: string | null
          goals_ranking?: Json | null
          hand_length?: number | null
          handedness?: string | null
          handicap_goal?: number | null
          handicap_index?: number | null
          has_clubs?: boolean | null
          has_physical_limitations?: boolean | null
          height_cm?: number | null
          height_ft?: number | null
          height_in?: number | null
          hybrid_desired_flight?: string | null
          hybrid_primary_use?: string | null
          id?: string
          iron_7_carry?: number | null
          iron_7_flight?: string | null
          iron_ball_speed?: number | null
          iron_common_miss?: string | null
          iron_current_length?: string | null
          iron_descent_angle?: number | null
          iron_dispersion?: number | null
          iron_launch_angle?: number | null
          iron_peak_height?: number | null
          iron_priority_miss?: string | null
          iron_shot_shape?: string | null
          iron_spin_rate?: number | null
          long_iron_miss_type?: string | null
          long_iron_trouble_club?: string | null
          longest_finger?: number | null
          miss_percentage?: number | null
          most_common_miss?: string | null
          physical_limitations_text?: string | null
          player_age?: number | null
          player_name?: string | null
          playing_frequency?: string | null
          practice_frequency?: string | null
          putter_alignment_pref?: string | null
          putter_arm_hang?: string | null
          putter_common_miss?: string | null
          putter_current_length?: number | null
          putter_eye_position?: string | null
          putter_face_rotation?: string | null
          putter_feel_pref?: string | null
          putter_forgiveness_priority?: string | null
          putter_forward_press?: boolean | null
          putter_green_speed?: string | null
          putter_grip_size_pref?: string | null
          putter_hand_activity?: string | null
          putter_head_style_pref?: string | null
          putter_posture?: string | null
          putter_satisfaction?: string | null
          putter_sole_flush?: string | null
          putter_stroke_type?: string | null
          pw_loft?: number | null
          replacement_scope?: string | null
          selected_categories?: Json | null
          status?: string | null
          step_0_data?: Json | null
          subscription_tier?: string | null
          swing_tempo?: string | null
          swing_type?: string | null
          transition_speed?: string | null
          typical_ball_flight?: string | null
          typical_trajectory?: string | null
          unit_preference?: string | null
          user_id?: string
          uses_category_selection?: boolean | null
          wedge_common_miss?: string | null
          wedge_current_challenge?: string | null
          wrist_to_floor?: number | null
          years_playing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fitting_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_profile: {
        Row: {
          hand_size: string | null
          height_ft: number | null
          height_in: number | null
          id: string
          injuries: string[] | null
          mobility_limit: string | null
          session_id: string
          user_id: string
          wrist_to_floor: number | null
        }
        Insert: {
          hand_size?: string | null
          height_ft?: number | null
          height_in?: number | null
          id?: string
          injuries?: string[] | null
          mobility_limit?: string | null
          session_id: string
          user_id: string
          wrist_to_floor?: number | null
        }
        Update: {
          hand_size?: string | null
          height_ft?: number | null
          height_in?: number | null
          id?: string
          injuries?: string[] | null
          mobility_limit?: string | null
          session_id?: string
          user_id?: string
          wrist_to_floor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "physical_profile_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "fitting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physical_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      player_profile: {
        Row: {
          age: number | null
          budget_range: string | null
          dominant_hand: string | null
          experience: string | null
          full_name: string | null
          handicap: string | null
          id: string
          primary_goal: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          age?: number | null
          budget_range?: string | null
          dominant_hand?: string | null
          experience?: string | null
          full_name?: string | null
          handicap?: string | null
          id?: string
          primary_goal?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          age?: number | null
          budget_range?: string | null
          dominant_hand?: string | null
          experience?: string | null
          full_name?: string | null
          handicap?: string | null
          id?: string
          primary_goal?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_profile_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "fitting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_url: string | null
          brand: string | null
          category: string | null
          flex_category: string | null
          grip_size: string | null
          id: string
          image_url: string | null
          model_name: string | null
          price_usd: number | null
          recommended_for: string[] | null
          weight_grams: number | null
        }
        Insert: {
          affiliate_url?: string | null
          brand?: string | null
          category?: string | null
          flex_category?: string | null
          grip_size?: string | null
          id?: string
          image_url?: string | null
          model_name?: string | null
          price_usd?: number | null
          recommended_for?: string[] | null
          weight_grams?: number | null
        }
        Update: {
          affiliate_url?: string | null
          brand?: string | null
          category?: string | null
          flex_category?: string | null
          grip_size?: string | null
          id?: string
          image_url?: string | null
          model_name?: string | null
          price_usd?: number | null
          recommended_for?: string[] | null
          weight_grams?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          archived: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          archived?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          archived?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          order_number: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          subject: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          order_number?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          order_number?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swing_goals: {
        Row: {
          completed_date: string | null
          created_at: string | null
          current_value: number | null
          goal_name: string
          id: string
          last_reminder_sent: string | null
          metric_name: string
          notes: string | null
          progress_percent: number | null
          start_date: string
          start_value: number | null
          status: string | null
          target_date: string
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_name: string
          id?: string
          last_reminder_sent?: string | null
          metric_name: string
          notes?: string | null
          progress_percent?: number | null
          start_date?: string
          start_value?: number | null
          status?: string | null
          target_date: string
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_name?: string
          id?: string
          last_reminder_sent?: string | null
          metric_name?: string
          notes?: string | null
          progress_percent?: number | null
          start_date?: string
          start_value?: number | null
          status?: string | null
          target_date?: string
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      swing_insights: {
        Row: {
          created_at: string | null
          description: string
          dismissed_at: string | null
          id: string
          insight_type: string
          priority: string | null
          recommendation: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          dismissed_at?: string | null
          id?: string
          insight_type: string
          priority?: string | null
          recommendation?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          dismissed_at?: string | null
          id?: string
          insight_type?: string
          priority?: string | null
          recommendation?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      swing_metrics: {
        Row: {
          attack_angle: number | null
          ball_speed: number | null
          carry_distance: number | null
          club_path: number | null
          club_speed: number | null
          club_used: string | null
          created_at: string | null
          dynamic_loft: number | null
          face_angle: number | null
          id: string
          landing_angle: number | null
          launch_angle: number | null
          launch_direction: number | null
          max_height: number | null
          session_id: string
          shot_number: number
          shot_type: string | null
          smash_factor: number | null
          spin_axis: number | null
          spin_rate: number | null
          total_distance: number | null
          user_id: string
        }
        Insert: {
          attack_angle?: number | null
          ball_speed?: number | null
          carry_distance?: number | null
          club_path?: number | null
          club_speed?: number | null
          club_used?: string | null
          created_at?: string | null
          dynamic_loft?: number | null
          face_angle?: number | null
          id?: string
          landing_angle?: number | null
          launch_angle?: number | null
          launch_direction?: number | null
          max_height?: number | null
          session_id: string
          shot_number: number
          shot_type?: string | null
          smash_factor?: number | null
          spin_axis?: number | null
          spin_rate?: number | null
          total_distance?: number | null
          user_id: string
        }
        Update: {
          attack_angle?: number | null
          ball_speed?: number | null
          carry_distance?: number | null
          club_path?: number | null
          club_speed?: number | null
          club_used?: string | null
          created_at?: string | null
          dynamic_loft?: number | null
          face_angle?: number | null
          id?: string
          landing_angle?: number | null
          launch_angle?: number | null
          launch_direction?: number | null
          max_height?: number | null
          session_id?: string
          shot_number?: number
          shot_type?: string | null
          smash_factor?: number | null
          spin_axis?: number | null
          spin_rate?: number | null
          total_distance?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swing_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "swing_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      swing_profile: {
        Row: {
          ball_flight: string | null
          id: string
          miss_tendency: string | null
          session_id: string
          swing_strength: string | null
          swing_tempo: string | null
          typical_shot: string | null
          user_id: string
        }
        Insert: {
          ball_flight?: string | null
          id?: string
          miss_tendency?: string | null
          session_id: string
          swing_strength?: string | null
          swing_tempo?: string | null
          typical_shot?: string | null
          user_id: string
        }
        Update: {
          ball_flight?: string | null
          id?: string
          miss_tendency?: string | null
          session_id?: string
          swing_strength?: string | null
          swing_tempo?: string | null
          typical_shot?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swing_profile_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "fitting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swing_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swing_sessions: {
        Row: {
          avg_ball_speed: number | null
          avg_carry_distance: number | null
          avg_club_speed: number | null
          avg_launch_angle: number | null
          avg_spin_rate: number | null
          avg_total_distance: number | null
          consistency_score: number | null
          created_at: string | null
          device_type: string | null
          id: string
          location: string | null
          notes: string | null
          session_date: string
          session_name: string | null
          total_shots: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_ball_speed?: number | null
          avg_carry_distance?: number | null
          avg_club_speed?: number | null
          avg_launch_angle?: number | null
          avg_spin_rate?: number | null
          avg_total_distance?: number | null
          consistency_score?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          session_date?: string
          session_name?: string | null
          total_shots?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_ball_speed?: number | null
          avg_carry_distance?: number | null
          avg_club_speed?: number | null
          avg_launch_angle?: number | null
          avg_spin_rate?: number | null
          avg_total_distance?: number | null
          consistency_score?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          session_date?: string
          session_name?: string | null
          total_shots?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_device_connections: {
        Row: {
          access_token: string
          auto_sync_enabled: boolean | null
          connection_status: string | null
          created_at: string | null
          device_user_id: string | null
          device_username: string | null
          error_count: number | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          metadata: Json | null
          provider_id: string
          refresh_token: string | null
          sync_frequency: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          auto_sync_enabled?: boolean | null
          connection_status?: string | null
          created_at?: string | null
          device_user_id?: string | null
          device_username?: string | null
          error_count?: number | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider_id: string
          refresh_token?: string | null
          sync_frequency?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          auto_sync_enabled?: boolean | null
          connection_status?: string | null
          created_at?: string | null
          device_user_id?: string | null
          device_username?: string | null
          error_count?: number | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider_id?: string
          refresh_token?: string | null
          sync_frequency?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_device_connections_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "device_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          ai_training_opt_out: boolean | null
          attack_angle: string | null
          ball_flight: string | null
          city: string | null
          club_budget: string | null
          club_path: string | null
          club_priorities: string[] | null
          created_at: string | null
          date_of_birth: string | null
          dominant_hand: string | null
          driver_distance: string | null
          first_name: string | null
          gender: string | null
          glove_size: string | null
          hand_size: string | null
          handicap_index: number | null
          height_ft: number | null
          height_in: number | null
          id: string
          iron_7_distance: number | null
          last_name: string | null
          membership_tier: string | null
          miss_direction: string | null
          phone_number: string | null
          physical_considerations: string[] | null
          preferred_ball_height: string | null
          preferred_brands: string[] | null
          primary_goals: string[] | null
          state: string | null
          subscription_tier: string | null
          swing_speed_range: string | null
          updated_at: string | null
          user_id: string
          wrist_to_floor: number | null
          years_playing: string | null
        }
        Insert: {
          ai_training_opt_out?: boolean | null
          attack_angle?: string | null
          ball_flight?: string | null
          city?: string | null
          club_budget?: string | null
          club_path?: string | null
          club_priorities?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          dominant_hand?: string | null
          driver_distance?: string | null
          first_name?: string | null
          gender?: string | null
          glove_size?: string | null
          hand_size?: string | null
          handicap_index?: number | null
          height_ft?: number | null
          height_in?: number | null
          id?: string
          iron_7_distance?: number | null
          last_name?: string | null
          membership_tier?: string | null
          miss_direction?: string | null
          phone_number?: string | null
          physical_considerations?: string[] | null
          preferred_ball_height?: string | null
          preferred_brands?: string[] | null
          primary_goals?: string[] | null
          state?: string | null
          subscription_tier?: string | null
          swing_speed_range?: string | null
          updated_at?: string | null
          user_id: string
          wrist_to_floor?: number | null
          years_playing?: string | null
        }
        Update: {
          ai_training_opt_out?: boolean | null
          attack_angle?: string | null
          ball_flight?: string | null
          city?: string | null
          club_budget?: string | null
          club_path?: string | null
          club_priorities?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          dominant_hand?: string | null
          driver_distance?: string | null
          first_name?: string | null
          gender?: string | null
          glove_size?: string | null
          hand_size?: string | null
          handicap_index?: number | null
          height_ft?: number | null
          height_in?: number | null
          id?: string
          iron_7_distance?: number | null
          last_name?: string | null
          membership_tier?: string | null
          miss_direction?: string | null
          phone_number?: string | null
          physical_considerations?: string[] | null
          preferred_ball_height?: string | null
          preferred_brands?: string[] | null
          primary_goals?: string[] | null
          state?: string | null
          subscription_tier?: string | null
          swing_speed_range?: string | null
          updated_at?: string | null
          user_id?: string
          wrist_to_floor?: number | null
          years_playing?: string | null
        }
        Relationships: []
      }
      user_swing_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          data_retention_months: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          last_payment_date: string | null
          max_sessions_per_month: number | null
          next_payment_date: string | null
          plan_id: string | null
          start_date: string
          status: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          data_retention_months?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          last_payment_date?: string | null
          max_sessions_per_month?: number | null
          next_payment_date?: string | null
          plan_id?: string | null
          start_date?: string
          status?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          data_retention_months?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          last_payment_date?: string | null
          max_sessions_per_month?: number | null
          next_payment_date?: string | null
          plan_id?: string | null
          start_date?: string
          status?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_badge_view: string | null
          role: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_badge_view?: string | null
          role?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_badge_view?: string | null
          role?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      backfill_user_profiles: { Args: never; Returns: undefined }
      calculate_consistency_score: {
        Args: { p_session_id: string }
        Returns: number
      }
      get_improvement_trend: {
        Args: { p_days_back?: number; p_metric_name: string; p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
