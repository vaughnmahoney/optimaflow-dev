
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/components/workorders/types/sidebar";
import { Database } from "@/integrations/supabase/types";

// Define the expected shape of location data
interface LocationData {
  name?: string;
  address?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

// Define the expected shape of completion data from the database
interface DBCompletionData {
  status?: string;
  photos?: Array<{
    url: string;
    type: string;
    timestamp?: string;
  }>;
  signatures?: Array<{
    url: string;
    type: string;
    timestamp?: string;
  }>;
  customFields?: Record<string, string>;
}

// Define the expected shape of service details
interface ServiceDetails {
  groundUnits?: string;
  deliveryDate?: string;
  field3?: string;
  field4?: string;
  field5?: string;
}

export const useWorkOrderData = (workOrderId: string | null) => {
  const { data: workOrder, isLoading: isWorkOrderLoading } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      
      console.log('Fetching work order:', workOrderId);
      
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

      if (error) {
        console.error('Error fetching work order:', error);
        throw error;
      }

      if (!data) {
        console.log('No data found for work order:', workOrderId);
        return null;
      }

      console.log('Raw work order data:', data);

      // Parse JSON fields with type safety
      const locationData = data.location as LocationData || {};
      const completionData = data.completion_data as DBCompletionData || {};
      const serviceDetails = data.service_details as ServiceDetails || {};

      console.log('Parsed fields:', {
        locationData,
        completionData,
        serviceDetails
      });

      // Map the database fields to match our WorkOrder type
      const mappedData: WorkOrder = {
        id: data.id,
        order_no: data.optimoroute_order_number || data.external_id || 'N/A',
        location: {
          name: locationData.name,
          address: locationData.address,
          latitude: locationData.coordinates?.latitude,
          longitude: locationData.coordinates?.longitude
        },
        completion_data: {
          data: {
            status: completionData.status,
            form: {
              images: completionData.photos?.map(photo => ({
                type: photo.type,
                url: photo.url
              })) || [],
              signature: completionData.signatures?.[0],
              note: completionData.customFields?.notes
            }
          }
        },
        service_date: data.service_date,
        driver: data.technicians?.name ? {
          name: data.technicians.name,
          externalId: data.technician_id
        } : undefined,
        status: data.optimoroute_status || data.status || 'pending',
        service_notes: data.notes,
        description: data.description,
        custom_fields: {
          field1: serviceDetails.groundUnits || '',
          field2: serviceDetails.deliveryDate || '',
          field3: serviceDetails.field3 || '',
          field4: serviceDetails.field4 || '',
          field5: serviceDetails.field5 || ''
        },
        priority: data.priority
      };

      console.log('Mapped work order data:', mappedData);

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
