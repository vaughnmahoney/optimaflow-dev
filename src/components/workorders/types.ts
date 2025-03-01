
import { ReactNode } from "react";

// Define types for sorting
export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'order_no' | 'service_date' | 'driver' | 'location' | 'status' | null;

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
  location?: Location;
  driver?: Driver;
  duration?: string;
  lds?: string;
  has_images?: boolean;
  signature_url?: string;
  search_response?: WorkOrderSearchResponse;
  completion_response?: WorkOrderCompletionResponse;
}

export interface WorkOrderListProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOptimoRouteSearch: (value: string) => void;
  statusCounts?: {
    approved: number;
    pending_review: number;
    flagged: number;
    all?: number;
  };
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
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
