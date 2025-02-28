
import { Json } from "@/integrations/supabase/types";

export interface WorkOrderLocation {
  name?: string;
  locationName?: string;
  address?: string;
  locationNo?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  valid?: boolean;
}

export interface WorkOrderDriver {
  name: string;
  id: string;
}

export interface WorkOrderSearchResponseData {
  id: string;
  date: string;
  notes: string;
  location: WorkOrderLocation;
  type: string;
}

export interface WorkOrderSearchResponse {
  id: string;
  data: WorkOrderSearchResponseData;
  scheduleInformation: WorkOrderScheduleInformation;
}

export interface WorkOrderScheduleInformation {
  arrivalTimeDt?: string;
  distance?: number;
  driverName?: string;
  driverSerial?: string;
  scheduledAt?: string;
  scheduledAtDt?: string;
  stopNumber?: number;
  travelTime?: number;
}

export interface WorkOrderFormData {
  note?: string;
  images?: Array<{ url: string }>;
  signature?: {
    url?: string;
  };
  driver_name?: string;
}

export interface WorkOrderTimeData {
  utcTime: string;
  localTime: string;
  unixTimestamp: number;
}

export interface WorkOrderCompletionData {
  endTime: WorkOrderTimeData;
  startTime: WorkOrderTimeData;
  form: WorkOrderFormData;
  status: string;
  tracking_url?: string;
}

export interface WorkOrderCompletionOrder {
  data: WorkOrderCompletionData;
  orderNo: string;
  success: boolean;
}

export interface WorkOrderCompletionResponse {
  orders: WorkOrderCompletionOrder[];
  success: boolean;
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
  duration?: string;
  lds?: string;
  location?: WorkOrderLocation;
  driver?: WorkOrderDriver;
  has_images?: boolean;
  signature_url?: string;
  search_response?: WorkOrderSearchResponse;
  completion_response?: WorkOrderCompletionResponse;
}

export interface WorkOrderListProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onOptimoRouteSearch: (value: string) => void;
  onStatusFilterChange: (value: string | null) => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  searchQuery: string;
  statusFilter: string | null;
  statusCounts: {
    approved: number;
    pending_review: number;
    flagged: number;
    all?: number;
  };
}
