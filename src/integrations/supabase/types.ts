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
      ai_diagnoses: {
        Row: {
          ai_diagnosis_id: string
          confidence_score: number
          diagnosis: string
          llm_generated_patient_history: string | null
          priority_rank: number
          scan_id: string
        }
        Insert: {
          ai_diagnosis_id?: string
          confidence_score: number
          diagnosis: string
          llm_generated_patient_history?: string | null
          priority_rank: number
          scan_id: string
        }
        Update: {
          ai_diagnosis_id?: string
          confidence_score?: number
          diagnosis?: string
          llm_generated_patient_history?: string | null
          priority_rank?: number
          scan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_diagnoses_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["scan_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          log_id: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          action: string
          details?: Json | null
          log_id?: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          action?: string
          details?: Json | null
          log_id?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cases: {
        Row: {
          case_id: string
          case_status: string
          created_at: string | null
          diagnosis_confirmed_by: string | null
          initial_diagnosis: string | null
          notes: string | null
          patient_id: string
          updated_at: string | null
        }
        Insert: {
          case_id?: string
          case_status: string
          created_at?: string | null
          diagnosis_confirmed_by?: string | null
          initial_diagnosis?: string | null
          notes?: string | null
          patient_id: string
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          case_status?: string
          created_at?: string | null
          diagnosis_confirmed_by?: string | null
          initial_diagnosis?: string | null
          notes?: string | null
          patient_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_diagnosis_confirmed_by_fkey"
            columns: ["diagnosis_confirmed_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctor_id"]
          },
          {
            foreignKeyName: "cases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      doctor_diagnoses: {
        Row: {
          ai_diagnosis_id: string | null
          ai_image_analysis_rating: number
          created_at: string | null
          created_by: string
          doctor_diagnosis_id: string
          doctor_id: string
          feedback_comments: string | null
          final_doctor_diagnosis: string
          llm_narrative_rating: number
          scan_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ai_diagnosis_id?: string | null
          ai_image_analysis_rating: number
          created_at?: string | null
          created_by: string
          doctor_diagnosis_id?: string
          doctor_id: string
          feedback_comments?: string | null
          final_doctor_diagnosis: string
          llm_narrative_rating: number
          scan_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ai_diagnosis_id?: string | null
          ai_image_analysis_rating?: number
          created_at?: string | null
          created_by?: string
          doctor_diagnosis_id?: string
          doctor_id?: string
          feedback_comments?: string | null
          final_doctor_diagnosis?: string
          llm_narrative_rating?: number
          scan_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_diagnoses_ai_diagnosis_id_fkey"
            columns: ["ai_diagnosis_id"]
            isOneToOne: false
            referencedRelation: "ai_diagnoses"
            referencedColumns: ["ai_diagnosis_id"]
          },
          {
            foreignKeyName: "doctor_diagnoses_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctor_id"]
          },
          {
            foreignKeyName: "doctor_diagnoses_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["scan_id"]
          },
        ]
      }
      doctors: {
        Row: {
          created_at: string | null
          doctor_id: string
          email: string
          hospital_affiliation: string | null
          name: string
          phone_number: string
          photo_url: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          doctor_id?: string
          email: string
          hospital_affiliation?: string | null
          name: string
          phone_number: string
          photo_url?: string | null
          role: string
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          email?: string
          hospital_affiliation?: string | null
          name?: string
          phone_number?: string
          photo_url?: string | null
          role?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          date_of_birth: string
          gender: string | null
          medical_history: string | null
          name: string
          national_id: string
          patient_id: string
          phone_number: string
        }
        Insert: {
          date_of_birth: string
          gender?: string | null
          medical_history?: string | null
          name: string
          national_id: string
          patient_id?: string
          phone_number: string
        }
        Update: {
          date_of_birth?: string
          gender?: string | null
          medical_history?: string | null
          name?: string
          national_id?: string
          patient_id?: string
          phone_number?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          case_id: string
          clinical_notes: string | null
          image_storage_path: string
          patient_id: string
          scan_date: string | null
          scan_id: string
          scan_type: string | null
        }
        Insert: {
          case_id: string
          clinical_notes?: string | null
          image_storage_path: string
          patient_id: string
          scan_date?: string | null
          scan_id?: string
          scan_type?: string | null
        }
        Update: {
          case_id?: string
          clinical_notes?: string | null
          image_storage_path?: string
          patient_id?: string
          scan_date?: string | null
          scan_id?: string
          scan_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "scans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_doctor_cases_and_patients: {
        Args: { email: string }
        Returns: {
          case_id: string
          created_at: string
          updated_at: string
          case_status: string
          notes: string
          initial_diagnosis: string
          diagnosis_confirmed_by: string
          patient_id: string
          patient_name: string
          date_of_birth: string
          medical_history: string
          gender: string
          patient_phone_number: string
          national_id: string
          scan_id: string
          ai_diagnosis_id: string
          ai_diagnosis: string
          ai_confidence_score: number
          ai_priority_rank: number
          llm_generated_patient_history: string
        }[]
      }
      get_filtered_table_metadata: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          column_name: string
          data_type: string
          foreign_key: string
        }[]
      }
      get_patient_infod: {
        Args: { patient_id: string }
        Returns: {
          image_storage_path: string
          medical_history: string
          initial_diagnosis: string
        }[]
      }
      get_patient_scan_summary: {
        Args: { patient_uuid: string }
        Returns: {
          image_storage_path: string
          medical_history: string
          initial_diagnosis: string
        }[]
      }
      get_table_metadata: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          column_name: string
          data_type: string
          foreign_key: string
        }[]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
