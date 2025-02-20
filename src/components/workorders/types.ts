
import { Json } from "@/integrations/supabase/types";

export interface WorkOrderLocation {
  name?: string;
  locationName?: string;
  address?: string;
  locationNo?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface WorkOrderSearchResponse {
  date?: string;
  notes?: string;
  location?: WorkOrderLocation;
}

export interface WorkOrderCompletionResponse {
  photos?: Array<{
    type: string;
    url: string;
  }>;
}

export interface WorkOrder {
  id: string;
  order_no: string;
  status: string;
  timestamp: string;
  service_date?: string;
  service_notes?: string;
  location?: WorkOrderLocation;
  has_images?: boolean;
  search_response?: WorkOrderSearchResponse;
  completion_response?: WorkOrderCompletionResponse;
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
