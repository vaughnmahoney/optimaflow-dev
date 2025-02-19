
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/components/workorders/types/sidebar";

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

      // Map the database fields to match our WorkOrder type
      const mappedData: WorkOrder = {
        ...data,
        id: data.id,
        order_no: data.optimoroute_order_number || data.external_id || 'N/A',
        location: {
          ...data.location,
          name: data.location?.locationName || data.location?.name,
          locationNo: data.location?.locationNo,
          notes: data.location?.notes,
          latitude: data.location?.latitude,
          longitude: data.location?.longitude
        },
        completion_data: {
          data: {
            ...data.completion_data?.data,
            tracking_url: data.completion_data?.data?.tracking_url,
            form: {
              ...data.completion_data?.data?.form,
              images: data.completion_data?.data?.form?.images || [],
              signature: data.completion_data?.data?.form?.signature
            }
          }
        },
        service_date: data.service_date,
        driver: data.technicians ? {
          name: data.technicians.name,
          externalId: data.driverExternalId,
          serial: data.driverSerial
        } : undefined,
        status: data.optimoroute_status || data.status || 'pending',
        custom_fields: {
          field1: data.customField1,
          field2: data.customField2,
          field3: data.customField3,
          field4: data.customField4,
          field5: data.customField5
        }
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

            console.log(`Generated URL for image ${image.id}:`, publicUrlData.publicUrl);

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
