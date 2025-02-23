
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderSearchResponse, WorkOrderCompletionResponse } from "@/components/workorders/types";

export const useWorkOrderData = () => {
  return useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;

      return data.map((order): WorkOrder => {
        const searchResponse = order.search_response as unknown as WorkOrderSearchResponse;
        const completionResponse = order.completion_response as unknown as WorkOrderCompletionResponse;
        
        return {
          id: order.id,
          order_no: order.order_no || 'N/A',
          status: order.status || 'pending_review',
          timestamp: order.timestamp || new Date().toISOString(),
          service_date: searchResponse?.orders?.[0]?.data?.date,
          service_notes: searchResponse?.orders?.[0]?.data?.notes,
          tech_notes: completionResponse?.orders?.[0]?.data?.form?.note,
          location: searchResponse?.orders?.[0]?.data?.location,
          has_images: Boolean(completionResponse?.orders?.[0]?.data?.form?.images?.length),
          signature_url: completionResponse?.orders?.[0]?.data?.form?.signature?.url,
          search_response: searchResponse,
          completion_response: completionResponse
        };
      });
    }
  });
};
