
export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface WorkOrderFormData {
  images?: string[];
  driver_name?: string;
  note?: string;
  signature?: string;
  startTime?: string;
  endTime?: string;
  tracking_url?: string;
  form?: {
    signature?: string;
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
}

export interface CompletionResponse {
  orders: {
    order_id: string;
    data: {
      form: WorkOrderFormData;
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
