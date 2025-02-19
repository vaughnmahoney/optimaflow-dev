
import { Json } from "@/integrations/supabase/types";

export interface WorkOrder {
  id: string;
  order_no: string;
  status: string;
  timestamp: string;
  service_date?: string;
  service_notes?: string;
  location?: Json;
  has_images?: boolean;
  search_response?: Json;
  completion_response?: Json;
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
