
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderSearchResponse, WorkOrderCompletionResponse } from "@/components/workorders/types";

export const useWorkOrderData = (workOrderId: string | null) => {
  const { data: workOrder, isLoading: isWorkOrderLoading } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      
      console.log('Fetching work order:', workOrderId);
      
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .eq("id", workOrderId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching work order:', error);
        throw error;
      }

      if (!data) {
        console.log('No data found for work order:', workOrderId);
        return null;
      }

      console.log('Raw work order data:', data);

      // Map the database fields to match our WorkOrder type
      const mappedData: WorkOrder = {
        id: data.id,
        order_no: data.order_no || 'N/A',
        status: data.status || 'pending_review',
        timestamp: data.timestamp,
        service_date: data.search_response?.date,
        service_notes: data.search_response?.notes,
        location: data.search_response?.location,
        has_images: Boolean(data.completion_response?.photos?.length),
        search_response: data.search_response as WorkOrderSearchResponse,
        completion_response: data.completion_response as WorkOrderCompletionResponse
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
