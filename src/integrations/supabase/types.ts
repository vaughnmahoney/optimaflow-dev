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
      customers: {
        Row: {
          billing_address: Json | null
          contact_info: Json | null
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
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
      stores: {
        Row: {
          address: Json | null
          contact_info: Json | null
          created_at: string | null
          customer_id: string
          id: string
          name: string
          store_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          customer_id: string
          id?: string
          name: string
          store_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          customer_id?: string
          id?: string
          name?: string
          store_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
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
          flagged_at: string | null
          flagged_by: string | null
          flagged_user: string | null
          id: string
          last_action_at: string | null
          last_action_by: string | null
          last_action_user: string | null
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
          flagged_at?: string | null
          flagged_by?: string | null
          flagged_user?: string | null
          id?: string
          last_action_at?: string | null
          last_action_by?: string | null
          last_action_user?: string | null
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
          flagged_at?: string | null
          flagged_by?: string | null
          flagged_user?: string | null
          id?: string
          last_action_at?: string | null
          last_action_by?: string | null
          last_action_user?: string | null
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
      submit_attendance_to_history: {
        Args: {
          submission_date: string
        }
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
