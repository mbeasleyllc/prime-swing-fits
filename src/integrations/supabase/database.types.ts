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
          club_length_adj: string | null
          club_type_rec: string | null
          driver_confidence: number | null
          driver_spec: string | null
          fairway_woods: string | null
          gaps_identified: string[] | null
          generated_at: string | null
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
          club_length_adj?: string | null
          club_type_rec?: string | null
          driver_confidence?: number | null
          driver_spec?: string | null
          fairway_woods?: string | null
          gaps_identified?: string[] | null
          generated_at?: string | null
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
          club_length_adj?: string | null
          club_type_rec?: string | null
          driver_confidence?: number | null
          driver_spec?: string | null
          fairway_woods?: string | null
          gaps_identified?: string[] | null
          generated_at?: string | null
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
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          flagged: boolean | null
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          flagged?: boolean | null
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          flagged?: boolean | null
          id?: string
          status?: string | null
          user_id?: string
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
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
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
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
