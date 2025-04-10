export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      acquisition_type_master: {
        Row: {
          acquisition_type_id: string
          code: string
          description: string | null
          display_order: number
          name: string
        }
        Insert: {
          acquisition_type_id?: string
          code: string
          description?: string | null
          display_order: number
          name: string
        }
        Update: {
          acquisition_type_id?: string
          code?: string
          description?: string | null
          display_order?: number
          name?: string
        }
        Relationships: []
      }
      category: {
        Row: {
          category_id: string
          code: string
          description: string | null
          display_order: number | null
          name: string
        }
        Insert: {
          category_id?: string
          code: string
          description?: string | null
          display_order?: number | null
          name?: string
        }
        Update: {
          category_id?: string
          code?: string
          description?: string | null
          display_order?: number | null
          name?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          created_at: string
          entry_id: string
          line1: string
          line2: string | null
          line3: string | null
          recorded_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entry_id?: string
          line1: string
          line2?: string | null
          line3?: string | null
          recorded_at: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entry_id?: string
          line1?: string
          line2?: string | null
          line3?: string | null
          recorded_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diary_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_parrot_icons: {
        Row: {
          created_at: string | null
          entry_id: string
          icon_id: string
          parrot_id: string | null
          position: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entry_id: string
          icon_id?: string
          parrot_id?: string | null
          position?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entry_id?: string
          icon_id?: string
          parrot_id?: string | null
          position?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diary_parrot_icons_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "diary_entries"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "diary_parrot_icons_parrot_id_fkey"
            columns: ["parrot_id"]
            isOneToOne: false
            referencedRelation: "parrots"
            referencedColumns: ["parrot_id"]
          },
          {
            foreignKeyName: "diary_parrot_icons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_types: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          is_active: boolean
          type_id: number
          type_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order: number
          is_active?: boolean
          type_id: number
          type_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          type_id?: number
          type_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gacha_history: {
        Row: {
          executed_at: string
          gacha_id: string
          parrot_id: string | null
          user_id: string | null
        }
        Insert: {
          executed_at?: string
          gacha_id?: string
          parrot_id?: string | null
          user_id?: string | null
        }
        Update: {
          executed_at?: string
          gacha_id?: string
          parrot_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gacha_history_parrot_id_fkey"
            columns: ["parrot_id"]
            isOneToOne: false
            referencedRelation: "parrots"
            referencedColumns: ["parrot_id"]
          },
          {
            foreignKeyName: "last_updated_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gacha_tickets: {
        Row: {
          last_updated: string
          ticket_count: number
          user_id: string
        }
        Insert: {
          last_updated?: string
          ticket_count?: number
          user_id: string
        }
        Update: {
          last_updated?: string
          ticket_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gacha_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parrots: {
        Row: {
          category_id: string | null
          description: string | null
          display_order: number | null
          image_url: string
          name: string
          parrot_id: string
          rarity_id: string | null
        }
        Insert: {
          category_id?: string | null
          description?: string | null
          display_order?: number | null
          image_url: string
          name: string
          parrot_id?: string
          rarity_id?: string | null
        }
        Update: {
          category_id?: string | null
          description?: string | null
          display_order?: number | null
          image_url?: string
          name?: string
          parrot_id?: string
          rarity_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parrots_rarity_id_fkey"
            columns: ["rarity_id"]
            isOneToOne: false
            referencedRelation: "rarity"
            referencedColumns: ["rarity_id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: number
          token: string
          used: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: number
          token: string
          used?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: number
          token?: string
          used?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pomodoro_duration_types: {
        Row: {
          created_at: string
          display_order: number
          duration_type_id: number
          is_active: boolean
          minutes: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order: number
          duration_type_id?: number
          is_active?: boolean
          minutes: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          duration_type_id?: number
          is_active?: boolean
          minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      pomodoro_records: {
        Row: {
          created_at: string
          duration_type_id: number
          end_time: string | null
          record_id: number
          session_id: number
          start_time: string
          status_type_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_type_id: number
          end_time?: string | null
          record_id?: number
          session_id: number
          start_time: string
          status_type_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_type_id?: number
          end_time?: string | null
          record_id?: number
          session_id?: number
          start_time?: string
          status_type_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_records_duration_type_id_fkey"
            columns: ["duration_type_id"]
            isOneToOne: false
            referencedRelation: "pomodoro_duration_types"
            referencedColumns: ["duration_type_id"]
          },
          {
            foreignKeyName: "pomodoro_records_status_type_id_fkey"
            columns: ["status_type_id"]
            isOneToOne: false
            referencedRelation: "pomodoro_status_types"
            referencedColumns: ["status_type_id"]
          },
        ]
      }
      pomodoro_sessions: {
        Row: {
          actual_count: number
          completed_at: string | null
          created_at: string
          session_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actual_count: number
          completed_at?: string | null
          created_at: string
          session_id?: string
          started_at: string
          status: string
          updated_at: string
          user_id?: string | null
        }
        Update: {
          actual_count?: number
          completed_at?: string | null
          created_at?: string
          session_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pomodoro_status_types: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          is_active: boolean
          status_key: string
          status_name: string
          status_type_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order: number
          is_active?: boolean
          status_key: string
          status_name: string
          status_type_id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          status_key?: string
          status_name?: string
          status_type_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      rarity: {
        Row: {
          abbreviation: string | null
          display_order: number | null
          drop_rate: number
          name: string
          rarity_id: string
        }
        Insert: {
          abbreviation?: string | null
          display_order?: number | null
          drop_rate: number
          name: string
          rarity_id?: string
        }
        Update: {
          abbreviation?: string | null
          display_order?: number | null
          drop_rate?: number
          name?: string
          rarity_id?: string
        }
        Relationships: []
      }
      tag_usage_histories: {
        Row: {
          entry_id: string | null
          history_id: string
          tag_id: string | null
          used_at: string
          user_id: string | null
        }
        Insert: {
          entry_id?: string | null
          history_id?: string
          tag_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Update: {
          entry_id?: string | null
          history_id?: string
          tag_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tag_usage_histories_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "diary_entries"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "tag_usage_histories_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["tag_id"]
          },
          {
            foreignKeyName: "tag_usage_histories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          created_by: string | null
          last_used_at: string | null
          name: string
          tag_id: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          last_used_at?: string | null
          name: string
          tag_id?: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          last_used_at?: string | null
          name?: string
          tag_id?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_acquisition_history: {
        Row: {
          acquired_at: string
          acquisition_id: string
          acquisition_type_id: string | null
          ticket_count: number
          user_id: string | null
        }
        Insert: {
          acquired_at?: string
          acquisition_id?: string
          acquisition_type_id?: string | null
          ticket_count: number
          user_id?: string | null
        }
        Update: {
          acquired_at?: string
          acquisition_id?: string
          acquisition_type_id?: string | null
          ticket_count?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_acquisition_history_acquisition_type_id_fkey"
            columns: ["acquisition_type_id"]
            isOneToOne: false
            referencedRelation: "acquisition_type_master"
            referencedColumns: ["acquisition_type_id"]
          },
          {
            foreignKeyName: "ticket_acquisition_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_activities: {
        Row: {
          activity_date: string
          created_at: string
          id: number
          pomodoro_count: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activity_date: string
          created_at?: string
          id?: number
          pomodoro_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activity_date?: string
          created_at?: string
          id?: number
          pomodoro_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_experience: {
        Row: {
          action_type: string
          created_at: string
          earned_at: string
          id: number
          user_id: string | null
          xp_amount: number
        }
        Insert: {
          action_type: string
          created_at?: string
          earned_at?: string
          id?: number
          user_id?: string | null
          xp_amount: number
        }
        Update: {
          action_type?: string
          created_at?: string
          earned_at?: string
          id?: number
          user_id?: string | null
          xp_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_experience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_parrots: {
        Row: {
          obtain_count: number
          obtained_at: string
          parrot_id: string
          user_id: string
        }
        Insert: {
          obtain_count?: number
          obtained_at?: string
          parrot_id: string
          user_id: string
        }
        Update: {
          obtain_count?: number
          obtained_at?: string
          parrot_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_parrots_parrot_id_fkey"
            columns: ["parrot_id"]
            isOneToOne: false
            referencedRelation: "parrots"
            referencedColumns: ["parrot_id"]
          },
          {
            foreignKeyName: "user_parrots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_parrots_tags: {
        Row: {
          entry_id: string
          executed_at: string
          parrot_id: string
          parrot_tag_name: string
          user_id: string
        }
        Insert: {
          entry_id?: string
          executed_at: string
          parrot_id: string
          parrot_tag_name: string
          user_id: string
        }
        Update: {
          entry_id?: string
          executed_at?: string
          parrot_id?: string
          parrot_tag_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_parrots_tags_parrot_id_fkey"
            columns: ["parrot_id"]
            isOneToOne: false
            referencedRelation: "parrots"
            referencedColumns: ["parrot_id"]
          },
          {
            foreignKeyName: "user_parrots_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: number
          session_token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: number
          session_token?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: number
          session_token?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          id: number
          last_login_date: string
          login_max_streak: number
          login_streak_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          last_login_date: string
          login_max_streak?: number
          login_streak_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          last_login_date?: string
          login_max_streak?: number
          login_streak_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login_at: string | null
          level: number
          password_hash: string
          streak: number
          total_xp: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_login_at?: string | null
          level?: number
          password_hash: string
          streak?: number
          total_xp?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login_at?: string | null
          level?: number
          password_hash?: string
          streak?: number
          total_xp?: number
          updated_at?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
