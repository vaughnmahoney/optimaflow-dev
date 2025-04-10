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
      attendance_records: {
        Row: {
          date: string
          id: string
          note: string | null
          status: string
          submitted_at: string | null
          supervisor_id: string
          technician_id: string
          updated_at: string | null
        }
        Insert: {
          date?: string
          id?: string
          note?: string | null
          status: string
          submitted_at?: string | null
          supervisor_id: string
          technician_id: string
          updated_at?: string | null
        }
        Update: {
          date?: string
          id?: string
          note?: string | null
          status?: string
          submitted_at?: string | null
          supervisor_id?: string
          technician_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      auto_import_logs: {
        Row: {
          created_at: string | null
          execution_time: string
          id: string
          result: Json
        }
        Insert: {
          created_at?: string | null
          execution_time?: string
          id?: string
          result: Json
        }
        Update: {
          created_at?: string | null
          execution_time?: string
          id?: string
          result?: Json
        }
        Relationships: []
      }
      custMast: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          cust_group: string
          cust_name: string
          default_service_frequency: string | null
          id: number
          last_service_date: string | null
          notes: string | null
          org_id: string
          pricing_tier: string | null
          region: string | null
          service_type: string | null
          state: string | null
          store_id: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          cust_group: string
          cust_name: string
          default_service_frequency?: string | null
          id?: number
          last_service_date?: string | null
          notes?: string | null
          org_id: string
          pricing_tier?: string | null
          region?: string | null
          service_type?: string | null
          state?: string | null
          store_id?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          cust_group?: string
          cust_name?: string
          default_service_frequency?: string | null
          id?: number
          last_service_date?: string | null
          notes?: string | null
          org_id?: string
          pricing_tier?: string | null
          region?: string | null
          service_type?: string | null
          state?: string | null
          store_id?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      group_attendance_review: {
        Row: {
          created_at: string | null
          date: string
          group_id: string
          id: string
          is_reviewed: boolean | null
          is_submitted: boolean | null
          reviewed_at: string | null
          reviewed_by: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          group_id: string
          id?: string
          is_reviewed?: boolean | null
          is_submitted?: boolean | null
          reviewed_at?: string | null
          reviewed_by: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          group_id?: string
          id?: string
          is_reviewed?: boolean | null
          is_submitted?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_attendance_review_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          address: string | null
          cust_group: string | null
          cust_name: string | null
          end_time: string | null
          fetched_at: string | null
          id: number
          job_duration: unknown | null
          latitude: number | null
          lds: string | null
          longitude: number | null
          notes: string | null
          optimoroute_status: string | null
          order_no: string
          org_id: string
          region: string | null
          scheduled_time: string | null
          start_time: string | null
          status: string | null
          tech_name: string | null
        }
        Insert: {
          address?: string | null
          cust_group?: string | null
          cust_name?: string | null
          end_time?: string | null
          fetched_at?: string | null
          id?: number
          job_duration?: unknown | null
          latitude?: number | null
          lds?: string | null
          longitude?: number | null
          notes?: string | null
          optimoroute_status?: string | null
          order_no: string
          org_id: string
          region?: string | null
          scheduled_time?: string | null
          start_time?: string | null
          status?: string | null
          tech_name?: string | null
        }
        Update: {
          address?: string | null
          cust_group?: string | null
          cust_name?: string | null
          end_time?: string | null
          fetched_at?: string | null
          id?: number
          job_duration?: unknown | null
          latitude?: number | null
          lds?: string | null
          longitude?: number | null
          notes?: string | null
          optimoroute_status?: string | null
          order_no?: string
          org_id?: string
          region?: string | null
          scheduled_time?: string | null
          start_time?: string | null
          status?: string | null
          tech_name?: string | null
        }
        Relationships: []
      }
      techMast: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          id: number
          notes: string | null
          phone: string | null
          region: string | null
          status: string | null
          storage_location: string | null
          tech_name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          id?: number
          notes?: string | null
          phone?: string | null
          region?: string | null
          status?: string | null
          storage_location?: string | null
          tech_name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          id?: number
          notes?: string | null
          phone?: string | null
          region?: string | null
          status?: string | null
          storage_location?: string | null
          tech_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      technicians: {
        Row: {
          created_at: string | null
          email: string | null
          group_id: string | null
          id: string
          name: string
          phone: string | null
          supervisor_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          name: string
          phone?: string | null
          supervisor_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          supervisor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_user: string | null
          completion_response: Json | null
          created_at: string | null
          driver_name: string | null
          end_time: string | null
          flagged_at: string | null
          flagged_by: string | null
          flagged_user: string | null
          id: string
          last_action_at: string | null
          last_action_by: string | null
          last_action_user: string | null
          location_name: string | null
          optimoroute_status: string | null
          order_no: string | null
          qc_notes: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejected_user: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          resolved_user: string | null
          resolver_id: string | null
          search_response: Json | null
          service_date: string | null
          status: string | null
          timestamp: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_user?: string | null
          completion_response?: Json | null
          created_at?: string | null
          driver_name?: string | null
          end_time?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          flagged_user?: string | null
          id?: string
          last_action_at?: string | null
          last_action_by?: string | null
          last_action_user?: string | null
          location_name?: string | null
          optimoroute_status?: string | null
          order_no?: string | null
          qc_notes?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_user?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_user?: string | null
          resolver_id?: string | null
          search_response?: Json | null
          service_date?: string | null
          status?: string | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_user?: string | null
          completion_response?: Json | null
          created_at?: string | null
          driver_name?: string | null
          end_time?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          flagged_user?: string | null
          id?: string
          last_action_at?: string | null
          last_action_by?: string | null
          last_action_user?: string | null
          location_name?: string | null
          optimoroute_status?: string | null
          order_no?: string | null
          qc_notes?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_user?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_user?: string | null
          resolver_id?: string | null
          search_response?: Json | null
          service_date?: string | null
          status?: string | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      group_attendance_counts: {
        Row: {
          completed_count: number | null
          date: string | null
          group_id: string | null
          total_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_dashboard_view: {
        Row: {
          has_images: boolean | null
          id: string | null
          location: Json | null
          order_no: string | null
          service_date: string | null
          service_notes: string | null
          status: string | null
          timestamp: string | null
        }
        Insert: {
          has_images?: never
          id?: string | null
          location?: never
          order_no?: string | null
          service_date?: never
          service_notes?: never
          status?: string | null
          timestamp?: string | null
        }
        Update: {
          has_images?: never
          id?: string | null
          location?: never
          order_no?: string | null
          service_date?: never
          service_notes?: never
          status?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      safe_json_extract_text: {
        Args: { json_data: Json; path: string }
        Returns: string
      }
      safe_json_extract_timestamp: {
        Args: { json_data: Json; path: string }
        Returns: string
      }
      submit_attendance_to_history: {
        Args: { submission_date: string }
        Returns: undefined
      }
      system_user: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      user_role: "admin" | "lead"
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
    Enums: {
      user_role: ["admin", "lead"],
    },
  },
} as const
