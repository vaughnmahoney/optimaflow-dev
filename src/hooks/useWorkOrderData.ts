
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
        order_no: data.optimoroute_order_number || data.order_id || 'N/A',
        location: data.location || {},
        completion_data: data.completion_data || {},
        service_date: data.service_date || data.created_at,
        driver: data.technicians ? { name: data.technicians.name } : undefined,
        status: data.optimoroute_status || data.status
      } as WorkOrder : null;
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
