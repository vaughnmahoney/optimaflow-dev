
import { Location } from './location';
import { ImageType } from './image';

/**
 * Types for API responses
 */
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
        images: ImageType[];
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
