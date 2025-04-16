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
      billing_history: {
        Row: {
          action: string
          change_details: Json | null
          created_at: string | null
          details: Json | null
          id: string
          invoice_id: string
          performed_by: string
        }
        Insert: {
          action: string
          change_details?: Json | null
          created_at?: string | null
          details?: Json | null
          id?: string
          invoice_id: string
          performed_by: string
        }
        Update: {
          action?: string
          change_details?: Json | null
          created_at?: string | null
          details?: Json | null
          id?: string
          invoice_id?: string
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
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
      invoices: {
        Row: {
          amount: number
          billing_date: string
          created_at: string | null
          customer_id: string
          due_date: string
          id: string
          notes: string | null
          quickbooks_id: string | null
          status: string
          store_id: string | null
          updated_at: string | null
          work_order_id: string
        }
        Insert: {
          amount: number
          billing_date: string
          created_at?: string | null
          customer_id: string
          due_date: string
          id?: string
          notes?: string | null
          quickbooks_id?: string | null
          status?: string
          store_id?: string | null
          updated_at?: string | null
          work_order_id: string
        }
        Update: {
          amount?: number
          billing_date?: string
          created_at?: string | null
          customer_id?: string
          due_date?: string
          id?: string
          notes?: string | null
          quickbooks_id?: string | null
          status?: string
          store_id?: string | null
          updated_at?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "qc_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          base_rate: number
          conditions: Json | null
          created_at: string | null
          customer_id: string | null
          id: string
          region: string | null
          service_type: string
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          base_rate: number
          conditions?: Json | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          region?: string | null
          service_type: string
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          base_rate?: number
          conditions?: Json | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          region?: string | null
          service_type?: string
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rules_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          created_at: string | null
          default_rate: number | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_rate?: number | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_rate?: number | null
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
      work_order_images: {
        Row: {
          created_at: string | null
          id: string
          storage_path: string
          uploaded_at: string | null
          work_order_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          storage_path: string
          uploaded_at?: string | null
          work_order_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          storage_path?: string
          uploaded_at?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_images_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "qc_dashboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_images_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          completion_response: Json | null
          created_at: string | null
          id: string
          order_no: string | null
          qc_notes: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolver_id: string | null
          search_response: Json | null
          status: string | null
          timestamp: string | null
          updated_at: string | null
        }
        Insert: {
          completion_response?: Json | null
          created_at?: string | null
          id?: string
          order_no?: string | null
          qc_notes?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolver_id?: string | null
          search_response?: Json | null
          status?: string | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Update: {
          completion_response?: Json | null
          created_at?: string | null
          id?: string
          order_no?: string | null
          qc_notes?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolver_id?: string | null
          search_response?: Json | null
          status?: string | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      work_orders_backup: {
        Row: {
          billing_status: string | null
          completion_data: Json | null
          completion_notes: string | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          end_time: string | null
          external_id: string | null
          flag_reason: string | null
          id: string | null
          location: Json | null
          notes: string | null
          optimoroute_id: string | null
          optimoroute_order_number: string | null
          optimoroute_status: string | null
          priority: string | null
          qc_notes: string | null
          qc_status: string | null
          service_date: string | null
          service_details: Json | null
          service_name: string | null
          service_type_id: string | null
          start_time: string | null
          status: string | null
          technician_id: string | null
          time_on_site: unknown | null
          timestamps: Json | null
          updated_at: string | null
        }
        Insert: {
          billing_status?: string | null
          completion_data?: Json | null
          completion_notes?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          end_time?: string | null
          external_id?: string | null
          flag_reason?: string | null
          id?: string | null
          location?: Json | null
          notes?: string | null
          optimoroute_id?: string | null
          optimoroute_order_number?: string | null
          optimoroute_status?: string | null
          priority?: string | null
          qc_notes?: string | null
          qc_status?: string | null
          service_date?: string | null
          service_details?: Json | null
          service_name?: string | null
          service_type_id?: string | null
          start_time?: string | null
          status?: string | null
          technician_id?: string | null
          time_on_site?: unknown | null
          timestamps?: Json | null
          updated_at?: string | null
        }
        Update: {
          billing_status?: string | null
          completion_data?: Json | null
          completion_notes?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          end_time?: string | null
          external_id?: string | null
          flag_reason?: string | null
          id?: string | null
          location?: Json | null
          notes?: string | null
          optimoroute_id?: string | null
          optimoroute_order_number?: string | null
          optimoroute_status?: string | null
          priority?: string | null
          qc_notes?: string | null
          qc_status?: string | null
          service_date?: string | null
          service_details?: Json | null
          service_name?: string | null
          service_type_id?: string | null
          start_time?: string | null
          status?: string | null
          technician_id?: string | null
          time_on_site?: unknown | null
          timestamps?: Json | null
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
