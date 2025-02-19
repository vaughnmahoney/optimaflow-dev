import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/components/workorders/types/sidebar";
import { Database } from "@/integrations/supabase/types";

// OptimoRoute specific status types
type OptimoRouteStatus = 
  | 'pending'
  | 'assigned'
  | 'started'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Define the expected shape of location data
interface LocationData {
  locationName?: string;
  name?: string;
  address?: string;
  locationNo?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  // Adding OptimoRoute specific fields
  serviceTime?: number;
  priority?: number;
  timeWindows?: Array<{
    startTime: string;
    endTime: string;
  }>;
}

// Define time data structure
interface TimeData {
  localTime: string;
  unixTimestamp: number;
  utcTime: string;
  timezone?: string;
}

// Define the expected shape of completion data
interface CompletionData {
  data?: {
    startTime?: TimeData;
    endTime?: TimeData;
    scheduledAtDt?: TimeData;
    completedAtDt?: TimeData;
    status?: OptimoRouteStatus;
    tracking_url?: string;
    form?: {
      note?: string;
      images?: Array<{
        type: string;
        url: string;
        timestamp?: string;
        latitude?: number;
        longitude?: number;
      }>;
      signature?: {
        type: string;
        url: string;
        timestamp?: string;
      };
    };
  };
}

// Error type for OptimoRoute specific errors
interface OptimoRouteError {
  code: string;
  message: string;
  details?: any;
}

// Custom error handler
const handleOptimoRouteError = (error: any): OptimoRouteError => {
  if (error.status === 429) {
    return {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      details: error
    };
  }
  if (error.status === 401) {
    return {
      code: 'UNAUTHORIZED',
      message: 'Invalid API key or unauthorized access.',
      details: error
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unknown error occurred',
    details: error
  };
};

export const useWorkOrderData = (workOrderId: string | null) => {
  const { data: workOrder, isLoading: isWorkOrderLoading, error, retry } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      
      try {
        const { data, error } = await supabase
          .from("work_orders")
          .select(`
            *,
            technicians (
              name,
              external_id,
              phone,
              email,
              vehicle_id
            )
          `)
          .eq("id", workOrderId)
          .single();

        if (error) throw error;

        if (!data) return null;

        // Parse JSON fields with type safety
        const locationData = data.location as LocationData || {};
        const completionData = data.completion_data as CompletionData || {};
        const customFields = data.service_details as Record<string, string> || {};

        // Calculate time on site if available
        const timeOnSite = completionData.data?.startTime && completionData.data?.endTime
          ? (new Date(completionData.data.endTime.localTime).getTime() - 
             new Date(completionData.data.startTime.localTime).getTime()) / 1000 / 60
          : undefined;

        // Map the database fields to match our WorkOrder type
        const mappedData: WorkOrder = {
          id: data.id,
          order_no: data.optimoroute_order_number || data.external_id || 'N/A',
          location: {
            name: locationData.locationName || locationData.name,
            locationNo: locationData.locationNo,
            notes: locationData.notes,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            address: locationData.address,
            serviceTime: locationData.serviceTime,
            priority: locationData.priority,
            timeWindows: locationData.timeWindows
          },
          completion_data: {
            data: {
              ...completionData.data,
              timeOnSite,
              tracking_url: completionData.data?.tracking_url,
              form: {
                note: completionData.data?.form?.note,
                images: completionData.data?.form?.images?.map(img => ({
                  ...img,
                  timestamp: img.timestamp || new Date().toISOString()
                })) || [],
                signature: completionData.data?.form?.signature
              }
            }
          },
          service_date: data.service_date,
          driver: data.technicians ? {
            name: data.technicians.name,
            externalId: data.technicians.external_id,
            phone: data.technicians.phone,
            email: data.technicians.email,
            vehicleId: data.technicians.vehicle_id
          } : undefined,
          status: data.optimoroute_status as OptimoRouteStatus || 'pending',
          service_notes: data.notes,
          description: data.description,
          custom_fields: customFields
        };

        return mappedData;
      } catch (error) {
        throw handleOptimoRouteError(error);
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  return {
    workOrder,
    isWorkOrderLoading,
    error: error ? handleOptimoRouteError(error) : null,
    retry
  };
};