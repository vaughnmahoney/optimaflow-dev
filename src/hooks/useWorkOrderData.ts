
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

      // Map the database fields to match our WorkOrder type
      return data ? {
        ...data,
        order_no: data.optimoroute_order_number || data.external_id || 'N/A',
        location: data.location || {},
        completion_data: data.completion_data || {},
        service_date: data.service_date,
        driver: data.technicians ? { name: data.technicians.name } : undefined,
        status: data.optimoroute_status || data.status || 'pending'
      } as WorkOrder : null;
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

          const { data } = supabase
            .storage
            .from('work-order-images')
            .getPublicUrl(image.storage_path);

          console.log(`Generated URL for image ${image.id}:`, data.publicUrl);

          return {
            ...image,
            image_url: data.publicUrl
          };
        })
      );

      return imagesWithUrls;
    },
    enabled: !!workOrderId,
  });

  return {
    workOrder,
    images,
    isLoading: isWorkOrderLoading || isImagesLoading
  };
};
