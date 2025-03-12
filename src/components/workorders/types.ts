
import { ReactNode } from "react";

// Define types for sorting
export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'order_no' | 'service_date' | 'driver' | 'location' | 'status' | null;

// Define pagination types
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// Define filter types
export interface WorkOrderFilters {
  status: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  driver: string | null;
  location: string | null;
  orderNo: string | null;
  searchQuery?: string; // Keeping for backward compatibility but will deprecate
}

export interface ColumnFilterProps {
  column: string;
  value: any;
  onChange: (value: any) => void;
  onClear: () => void;
}

export interface Location {
  locationId?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  name?: string;
  locationName?: string;
}

export interface Driver {
  id?: string;
  name?: string;
}

export interface WorkOrderSearchResponse {
  success: boolean;
  data: {
    id: string;
    order_no: string;
    date: string;
    timeWindow: string;
    notes: string;
    location: Location;
    customField1?: string; // Additional notes
    customField3?: string; // Material quantity
    customField5?: string; // LDS information
    customer?: {
      name: string;
      phone: string;
      email: string;
    };
  };
  scheduleInformation?: {
    status: string;
    driverId: string;
    driverName: string;
    sequenceNum: number;
    plannedArrival: string;
    plannedDeparture: string;
  };
}

export interface WorkOrderCompletionResponse {
  success: boolean;
  orders: Array<{
    id: string;
    data: {
      form: {
        images: Array<{
          url: string;
          type: string;
          name: string;
        }>;
        signature?: {
          url: string;
          name: string;
        };
        note?: string;
      };
      status?: string;
      startTime?: {
        localTime: string;
      };
      endTime?: {
        localTime: string;
      };
      tracking_url?: string;
    };
  }>;
}

export interface WorkOrder {
  id: string;
  order_no: string;
  status: string;
  timestamp: string;
  service_date?: string;
  service_notes?: string;
  tech_notes?: string;
  notes?: string;
  qc_notes?: string;
  resolution_notes?: string;
  resolved_at?: string;
  resolver_id?: string;
  location?: Location;
  driver?: Driver;
  duration?: string;
  lds?: string;
  has_images?: boolean;
  signature_url?: string;
  search_response?: WorkOrderSearchResponse;
  completion_response?: WorkOrderCompletionResponse;
  tracking_url?: string;
  completion_status?: string;
  completionDetails?: {
    data?: {
      status?: string;
      form?: {
        images?: Array<any>;
        note?: string;
      };
    };
  };
}

export interface WorkOrderListProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  filters: WorkOrderFilters;
  onFiltersChange: (filters: WorkOrderFilters) => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  onSearchChange?: (value: string) => void;
  onOptimoRouteSearch: (value: string) => void;
  statusCounts?: {
    approved: number;
    pending_review: number;
    flagged: number;
    resolved: number;
    rejected: number;
    all?: number;
  };
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onColumnFilterChange: (column: string, value: any) => void;
  clearColumnFilter: (column: string) => void;
  clearAllFilters: () => void;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
}

export interface StatusFilterProps {
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
}

// Required to be exported but the data is handled within the debug component
export interface DebugDisplayProps {
  searchResponse?: any;
  transformedData?: any;
}
