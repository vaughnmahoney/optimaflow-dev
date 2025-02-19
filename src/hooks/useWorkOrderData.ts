
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/components/workorders/types/sidebar";
import { Database } from "@/integrations/supabase/types";

// Define the expected shape of location data
interface LocationData {
  locationName?: string;
  name?: string;
  address?: string;
  locationNo?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

// Define the expected shape of completion data
interface CompletionData {
  data?: {
    startTime?: {
      localTime: string;
      unixTimestamp: number;
      utcTime: string;
    };
    endTime?: {
      localTime: string;
      unixTimestamp: number;
      utcTime: string;
    };
    status?: string;
    tracking_url?: string;
    form?: {
      note?: string;
      images?: Array<{
        type: string;
        url: string;
      }>;
      signature?: {
        type: string;
        url: string;
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
          technicians (name)
        `)
        .eq("id", workOrderId)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Parse JSON fields
      const locationData = data.location as LocationData || {};
      const completionData = data.completion_data as CompletionData || {};
      const customFields = data.service_details as Record<string, string> || {};

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
  });

  const { data: images, isLoading: isImagesLoading } = useQuery({
    queryKey: ["workOrderImages", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      
      // First get the image records
      const { data: imageRecords, error } = await supabase
        .from("work_order_images")
        .select("*")
        .eq("work_order_id", workOrderId);

      if (error) {
        console.error("Error fetching work order images:", error);
        throw error;
      }

      // Then get the public URL for each image
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

            if (!publicUrlData?.publicUrl) {
              console.warn(`Failed to generate public URL for image ${image.id}`);
              return { ...image, image_url: null };
            }

            return {
              ...image,
              image_url: publicUrlData.publicUrl
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
  });

  return {
    workOrder,
    images,
    isLoading: isWorkOrderLoading || isImagesLoading
  };
};
