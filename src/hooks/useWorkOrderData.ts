
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderSearchResponse, WorkOrderCompletionResponse } from "@/components/workorders/types";
import { toast } from "sonner";

export const useWorkOrderData = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: workOrders = [], isLoading, refetch } = useQuery({
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
          service_date: searchResponse?.data?.date,
          service_notes: searchResponse?.data?.notes,
          tech_notes: completionResponse?.orders?.[0]?.data?.form?.note,
          location: searchResponse?.data?.location,
          has_images: Boolean(completionResponse?.orders?.[0]?.data?.form?.images?.length),
          signature_url: completionResponse?.orders?.[0]?.data?.form?.signature?.url,
          search_response: searchResponse,
          completion_response: completionResponse
        };
      });
    }
  });

  const searchWorkOrder = (query: string) => {
    setSearchQuery(query);
  };

  const searchOptimoRoute = async (orderNo: string) => {
    if (!orderNo.trim()) {
      toast.error("Please enter an order number");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('search-optimoroute', {
        body: { searchQuery: orderNo.trim() }
      });

      if (error) throw error;

      if (data.success && data.workOrderId) {
        toast.success('Order imported successfully');
        // Refetch work orders to show the newly imported one
        refetch();
      } else {
        toast.error(data.error || 'Failed to import order');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import order');
    }
  };

  const updateWorkOrderStatus = async (workOrderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', workOrderId);

      if (error) throw error;

      toast.success(`Status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    }
  };

  const openImageViewer = (workOrderId: string) => {
    // Implementation would depend on how the image viewer is rendered
    console.log(`Opening images for work order: ${workOrderId}`);
  };

  const deleteWorkOrder = async (workOrderId: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', workOrderId);

      if (error) throw error;

      toast.success('Work order deleted');
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete work order');
    }
  };

  return {
    data: workOrders,
    isLoading,
    statusFilter,
    setStatusFilter,
    searchWorkOrder,
    searchOptimoRoute,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder
  };
};
