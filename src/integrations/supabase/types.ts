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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      classes: {
        Row: {
          class_code: string
          created_at: string
          id: string
          name: string
          teacher_id: string
          year_level: string
        }
        Insert: {
          class_code: string
          created_at?: string
          id?: string
          name?: string
          teacher_id: string
          year_level: string
        }
        Update: {
          class_code?: string
          created_at?: string
          id?: string
          name?: string
          teacher_id?: string
          year_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          class_id: string
          ended_at: string | null
          enrolled_at: string
          id: string
          status: string
          student_id: string
        }
        Insert: {
          class_id: string
          ended_at?: string | null
          enrolled_at?: string
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          class_id?: string
          ended_at?: string | null
          enrolled_at?: string
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_student_links: {
        Row: {
          id: string
          linked_at: string
          parent_user_id: string
          relationship: string
          status: string
          student_id: string
        }
        Insert: {
          id?: string
          linked_at?: string
          parent_user_id: string
          relationship?: string
          status?: string
          student_id: string
        }
        Update: {
          id?: string
          linked_at?: string
          parent_user_id?: string
          relationship?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          completed_lesson_ids: Json
          created_at: string
          id: string
          pretest_score: number | null
          quiz_scores: Json
          status: string
          student_id: string
          unlocked_legends: Json
          updated_at: string
          week: number | null
          year: string
        }
        Insert: {
          completed_lesson_ids?: Json
          created_at?: string
          id?: string
          pretest_score?: number | null
          quiz_scores?: Json
          status?: string
          student_id: string
          unlocked_legends?: Json
          updated_at?: string
          week?: number | null
          year: string
        }
        Update: {
          completed_lesson_ids?: Json
          created_at?: string
          id?: string
          pretest_score?: number | null
          quiz_scores?: Json
          status?: string
          student_id?: string
          unlocked_legends?: Json
          updated_at?: string
          week?: number | null
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          class_id: string | null
          created_at: string
          display_name: string
          id: string
          pin: string | null
          qr_token: string | null
          user_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          display_name: string
          id?: string
          pin?: string | null
          qr_token?: string | null
          user_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          display_name?: string
          id?: string
          pin?: string | null
          qr_token?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_access_credentials: {
        Row: {
          created_at: string
          created_by: string | null
          credential_secret: string
          credential_type: string
          expires_at: string | null
          id: string
          revoked_at: string | null
          student_id: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          credential_secret: string
          credential_type: string
          expires_at?: string | null
          id?: string
          revoked_at?: string | null
          student_id: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          credential_secret?: string
          credential_type?: string
          expires_at?: string | null
          id?: string
          revoked_at?: string | null
          student_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_access_credentials_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_student_profile: {
        Args: { claim_code_input: string }
        Returns: {
          class_id: string | null
          class_name: string | null
          display_name: string
          link_status: string
          student_id: string
        }[]
      }
      create_student_for_class: {
        Args: {
          class_uuid: string
          display_name_input: string
          pin_input?: string | null
        }
        Returns: {
          claim_code: string
          pin: string
          qr_token: string
          student_id: string
        }[]
      }
      generate_class_code: { Args: never; Returns: string }
      generate_student_claim_code: { Args: never; Returns: string }
      generate_qr_token: { Args: never; Returns: string }
      get_student_id: { Args: never; Returns: string }
      get_teacher_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lookup_student_by_qr: {
        Args: { token: string }
        Returns: {
          class_name: string
          display_name: string
          student_id: string
          user_id: string
        }[]
      }
      regenerate_student_qr: { Args: { student_uuid: string }; Returns: string }
      verify_student_pin: {
        Args: { pin_input: string; token: string }
        Returns: {
          class_code: string
          display_name: string
          student_id: string
          user_id: string | null
        }[]
      }
    }
    Enums: {
      app_role: "teacher" | "student"
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
      app_role: ["teacher", "student"],
    },
  },
} as const
