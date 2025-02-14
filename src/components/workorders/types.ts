
import { Json } from "@/integrations/supabase/types";

export interface WorkOrder {
  id: string;
  optimoroute_id?: string;
  optimoroute_order_number?: string;
  optimoroute_status?: string;
  service_date: string;
  qc_status?: string;
  description?: string | null;
  location?: Json | null;
  time_on_site?: unknown | null;
  customer_id: string;
  technician_id: string;
  service_name?: string;
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
