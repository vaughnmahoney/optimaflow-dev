
import { Json } from "@/integrations/supabase/types";

export interface WorkOrder {
  id: string;
  optimoroute_id?: string;
  optimoroute_order_number?: string | null;
  optimoroute_status?: string | null;
  service_date: string;
  qc_status?: string | null;
  description?: string | null;
  location?: Json | null;
  time_on_site?: unknown | null;
  service_name?: string | null;
  customer_name?: string | null;
  technician_name?: string | null;
  billing_status?: string | null;
  has_images?: boolean;
  priority?: string | null;
  service_notes?: string | null;
  qc_notes?: string | null;
  order_id?: string | null;
}

export interface WorkOrderListProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string | null) => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  searchQuery: string;
  statusFilter: string | null;
}
