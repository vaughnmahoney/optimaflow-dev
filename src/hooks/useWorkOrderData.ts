
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/components/workorders/types/sidebar";
import { Database } from "@/integrations/supabase/types";

// Define the expected shape of location data
interface LocationData {
  name?: string;
  locationName?: string;
  address?: string;
  locationNo?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
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
    status?: string;
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

export const useWorkOrderData = (workOrderId: string | null) => {
  const { data: workOrder, isLoading: isWorkOrderLoading } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          technicians (
            name
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
          address: locationData.address
        },
        completion_data: {
          data: {
            ...completionData.data,
            tracking_url: completionData.data?.tracking_url,
            form: {
              note: completionData.data?.form?.note,
              images: completionData.data?.form?.images || [],
              signature: completionData.data?.form?.signature
            }
          }
        },
        service_date: data.service_date,
        driver: data.technicians ? {
          name: data.technicians.name,
          externalId: data.external_id,
          serial: data.service_name
        } : undefined,
        status: data.optimoroute_status || data.status || 'pending',
        service_notes: data.notes,
        description: data.description,
        custom_fields: {
          field1: customFields.field1,
          field2: customFields.field2,
          field3: customFields.field3,
          field4: customFields.field4,
          field5: customFields.field5
        },
        priority: data.priority
      };

      return mappedData;
    },
    enabled: !!workOrderId,
    staleTime: 1000 * 60 * 5 // Consider data stale after 5 minutes
  });

  const { data: images = [], isLoading: isImagesLoading } = useQuery({
    queryKey: ["workOrderImages", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      
      const { data: imageRecords, error } = await supabase
        .from("work_order_images")
        .select("*")
        .eq("work_order_id", workOrderId);

      if (error) {
        console.error("Error fetching work order images:", error);
        throw error;
      }

      const imagesWithUrls = await Promise.all(
        imageRecords.map(async (image) => {
          if (!image.storage_path) {
            console.warn(`Missing storage path for image ${image.id}`);
            return { ...image, image_url: null };
          }

          try {
            const { data: publicUrlData } = supabase.storage
              .from('work-order-images')
              .getPublicUrl(image.storage_path);

            return {
              ...image,
              image_url: publicUrlData?.publicUrl || null
            };
          } catch (error) {
            console.error(`Error generating public URL for image ${image.id}:`, error);
            return { ...image, image_url: null };
          }
        })
      );

      return imagesWithUrls.filter(image => image.image_url !== null);
    },
    enabled: !!workOrderId,
    staleTime: 1000 * 60 * 5 // Consider data stale after 5 minutes
  });

  return {
    workOrder,
    images,
    isLoading: isWorkOrderLoading || isImagesLoading
  };
};
