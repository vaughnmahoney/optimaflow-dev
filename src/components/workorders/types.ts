
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
  checkInTime?: number;
}

export interface WorkOrderDriver {
  name: string;
  id: string;
}

export interface WorkOrderScheduleInformation {
  driverExternalId?: string;
  driverSerial?: string;
  driverName?: string;
  vehicleRegistration?: string | null;
  vehicleLabel?: string | null;
  stopNumber?: number;
  scheduledAt?: string;
  scheduledAtDt?: string;
  arrivalTimeDt?: string;
  travelTime?: number;
  distance?: number;
}

export interface WorkOrderSearchData {
  id: string;
  orderNo: string;
  date: string;
  type: string;
  notes: string;
  location: WorkOrderLocation;
}

export interface WorkOrderSearchResponseOrder {
  id: string;
  data: WorkOrderSearchData;
  scheduleInformation: WorkOrderScheduleInformation;
}

export interface WorkOrderSearchResponse {
  success: boolean;
  orders: WorkOrderSearchResponseOrder[];
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
}
