
import { Json } from "@/integrations/supabase/types";

export interface WorkOrder {
  id: string;
  service_date: string;
  qc_status: string;
  customer_name: string;
  technician_name: string;
  service_notes: string | null;
  time_on_site: unknown | null;
  has_images: boolean;
  priority: string;
  billing_status: string;
  order_id: string | null;
  location: Json | null;
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
