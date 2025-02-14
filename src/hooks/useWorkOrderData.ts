
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      return data;
    },
    enabled: !!workOrderId,
  });

  const { data: images, isLoading: isImagesLoading } = useQuery({
    queryKey: ["workOrderImages", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      
      const { data, error } = await supabase
        .from("work_order_images")
        .select("*")
        .eq("work_order_id", workOrderId);

      if (error) throw error;
      return data;
    },
    enabled: !!workOrderId,
  });

  return {
    workOrder,
    images,
    isLoading: isWorkOrderLoading || isImagesLoading
  };
};
