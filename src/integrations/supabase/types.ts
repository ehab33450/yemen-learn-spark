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
      badges: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          sort_order: number
          title: string
          xp_reward: number
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title: string
          xp_reward?: number
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      certificates: {
        Row: {
          course_id: string | null
          id: string
          issued_at: string
          kind: string
          track_id: string | null
          user_id: string
        }
        Insert: {
          course_id?: string | null
          id?: string
          issued_at?: string
          kind: string
          track_id?: string | null
          user_id: string
        }
        Update: {
          course_id?: string | null
          id?: string
          issued_at?: string
          kind?: string
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          duration: string | null
          emoji: string | null
          id: string
          is_published: boolean
          learning_plan: Json | null
          level: string | null
          outcomes: Json | null
          slug: string
          sort_order: number
          title: string
          track_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          emoji?: string | null
          id?: string
          is_published?: boolean
          learning_plan?: Json | null
          level?: string | null
          outcomes?: Json | null
          slug: string
          sort_order?: number
          title: string
          track_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          emoji?: string | null
          id?: string
          is_published?: boolean
          learning_plan?: Json | null
          level?: string | null
          outcomes?: Json | null
          slug?: string
          sort_order?: number
          title?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          completed: boolean
          created_at: string
          current_value: number
          id: string
          target_value: number
          user_id: string
          xp_reward: number
        }
        Insert: {
          challenge_date?: string
          challenge_type: string
          completed?: boolean
          created_at?: string
          current_value?: number
          id?: string
          target_value?: number
          user_id: string
          xp_reward?: number
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          completed?: boolean
          created_at?: string
          current_value?: number
          id?: string
          target_value?: number
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          applied: boolean
          completed_at: string | null
          course_id: string
          id: string
          lesson_id: string
          mastery_percent: number
          quiz_score: number | null
          read: boolean
          reviewed: boolean
          updated_at: string
          user_id: string
          watched: boolean
        }
        Insert: {
          applied?: boolean
          completed_at?: string | null
          course_id: string
          id?: string
          lesson_id: string
          mastery_percent?: number
          quiz_score?: number | null
          read?: boolean
          reviewed?: boolean
          updated_at?: string
          user_id: string
          watched?: boolean
        }
        Update: {
          applied?: boolean
          completed_at?: string | null
          course_id?: string
          id?: string
          lesson_id?: string
          mastery_percent?: number
          quiz_score?: number | null
          read?: boolean
          reviewed?: boolean
          updated_at?: string
          user_id?: string
          watched?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_quizzes: {
        Row: {
          correct_index: number
          id: string
          lesson_id: string
          options: Json
          question: string
          sort_order: number
        }
        Insert: {
          correct_index: number
          id?: string
          lesson_id: string
          options: Json
          question: string
          sort_order?: number
        }
        Update: {
          correct_index?: number
          id?: string
          lesson_id?: string
          options?: Json
          question?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          example_text: string | null
          extra_links: Json | null
          id: string
          module_id: string
          sort_order: number
          text_content: string | null
          title: string
          youtube_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          example_text?: string | null
          extra_links?: Json | null
          id?: string
          module_id: string
          sort_order?: number
          text_content?: string | null
          title: string
          youtube_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          example_text?: string | null
          extra_links?: Json | null
          id?: string
          module_id?: string
          sort_order?: number
          text_content?: string | null
          title?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          display_name: string
          id: string
          level: number
          preferred_track: string | null
          updated_at: string
          user_id: string
          welcomed_at: string | null
          xp_points: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          id?: string
          level?: number
          preferred_track?: string | null
          updated_at?: string
          user_id: string
          welcomed_at?: string | null
          xp_points?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          id?: string
          level?: number
          preferred_track?: string | null
          updated_at?: string
          user_id?: string
          welcomed_at?: string | null
          xp_points?: number
        }
        Relationships: []
      }
      tracks: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          slug: string
          sort_order: number
          subtitle: string | null
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          slug: string
          sort_order?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          slug?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_badge: {
        Args: { _badge_code: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_user_streak: {
        Args: { _user_id: string }
        Returns: {
          current_streak: number
          longest_streak: number
        }[]
      }
    }
    Enums: {
      app_role: "student" | "teacher" | "admin"
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
    Enums: {
      app_role: ["student", "teacher", "admin"],
    },
  },
} as const
