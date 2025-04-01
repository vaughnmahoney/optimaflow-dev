
import { Location } from './location';
import { Driver } from './driver';
import { WorkOrderSearchResponse, WorkOrderCompletionResponse } from './api';

/**
 * Core work order data structure
 */
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
  
  // User tracking fields
  approved_by?: string;
  approved_user?: string;
  approved_at?: string;
  
  flagged_by?: string;
  flagged_user?: string;
  flagged_at?: string;
  
  resolved_by?: string;
  resolved_user?: string;
  resolved_at?: string;
  
  rejected_by?: string;
  rejected_user?: string;
  rejected_at?: string;
  
  last_action_by?: string;
  last_action_user?: string;
  last_action_at?: string;
  
  resolver_id?: string; // Legacy field
  
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
