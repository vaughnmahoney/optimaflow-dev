export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface CompletionResponse {
  orders: {
    order_id: string;
    data: {
      form: WorkOrderFormData;
    };
  }[]
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

export interface WorkOrderFormData {
  images?: string[];
  driver_name?: string;
}
