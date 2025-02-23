
export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  locationName?: string;  // Added for backward compatibility
}

export interface WorkOrderFormData {
  images?: Array<{ url: string }>;  // Updated to match the expected type
  driver_name?: string;
  note?: string;
  notes?: string;  // Added for backward compatibility
  signature?: string;
  startTime?: string;
  endTime?: string;
  tracking_url?: string;
  timestamp?: string;  // Added for backward compatibility
  form?: {
    signature?: string;
    startTime?: string;
    endTime?: string;
    tracking_url?: string;
  };
}

export interface WorkOrder {
  id: string;
  order_no: string;
  service_date: string;
  location_id: string;
  service_notes: string;
  status: string;
  location?: Location;
  completion_response?: CompletionResponse;
  tech_notes?: string;
  driver?: string;
  duration?: string;
  lds?: string;
  signature_url?: string;
  notes?: string;  // Added for backward compatibility
  date?: string;   // Added for backward compatibility
  timestamp?: string;  // Added for backward compatibility
}

export interface CompletionResponse {
  orders: {
    order_id: string;
    data: {
      form: WorkOrderFormData;
      startTime?: string;
      endTime?: string;
      tracking_url?: string;
    };
  }[];
}

export interface WorkOrderSearchResponse {
  data: WorkOrder[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WorkOrderListProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  onSearchChange: (searchQuery: string) => void;
  onOptimoRouteSearch: (orderNumber: string) => void;
  onStatusFilterChange: (status: string | null) => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  searchQuery: string;
  statusFilter: string | null;
}
