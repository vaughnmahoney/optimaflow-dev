
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  WorkOrder, 
  WorkOrderSearchResponse, 
  WorkOrderCompletionResponse,
  SortField,
  SortDirection
} from "@/components/workorders/types";
import { toast } from "sonner";

export const useWorkOrderData = () => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const queryClient = useQueryClient();

  const { data: workOrders = [], isLoading, refetch } = useQuery({
    queryKey: ["workOrders", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("work_orders")
        .select("*")
        .order("timestamp", { ascending: false });
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((order): WorkOrder => {
        const searchResponse = order.search_response as unknown as WorkOrderSearchResponse;
        const completionResponse = order.completion_response as unknown as WorkOrderCompletionResponse;
        
        // Create driver object from searchResponse if available
        const driver = searchResponse?.scheduleInformation?.driverName 
          ? { 
              id: searchResponse.scheduleInformation.driverId,
              name: searchResponse.scheduleInformation.driverName 
            } 
          : undefined;
        
        return {
          id: order.id,
          order_no: order.order_no || 'N/A',
          status: order.status || 'pending_review',
          timestamp: order.timestamp || new Date().toISOString(),
          service_date: searchResponse?.data?.date,
          service_notes: searchResponse?.data?.notes,
          tech_notes: completionResponse?.orders?.[0]?.data?.form?.note,
          // If notes exists in database use it, otherwise set to empty string
          notes: order.notes || '',
          location: searchResponse?.data?.location,
          driver: driver,
          // If duration exists in database use it, otherwise set to empty string
          duration: order.duration || '',
          // If lds exists in database use it, otherwise set to empty string
          lds: order.lds || '',
          has_images: Boolean(completionResponse?.orders?.[0]?.data?.form?.images?.length),
          signature_url: completionResponse?.orders?.[0]?.data?.form?.signature?.url,
          search_response: searchResponse,
          completion_response: completionResponse
        };
      });
    }
  });

  // Calculate status counts from the work orders data
  const statusCounts = useMemo(() => {
    const counts = {
      approved: 0,
      pending_review: 0,
      flagged: 0,
      all: 0
    };
    
    // Query all work orders to get accurate counts
    const fetchStatusCounts = async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("status");
      
      if (!error && data) {
        data.forEach(order => {
          const status = order.status || 'pending_review';
          if (counts[status] !== undefined) {
            counts[status]++;
          }
          counts.all = (counts.all || 0) + 1;
        });
      }
      
      return counts;
    };
    
    // Initialize counts from current workOrders array
    if (workOrders) {
      workOrders.forEach(order => {
        if (order.status && counts[order.status] !== undefined) {
          counts[order.status]++;
        }
      });
    }
    
    // Fetch accurate counts if we're filtering
    if (statusFilter) {
      fetchStatusCounts().then(newCounts => {
        Object.keys(counts).forEach(key => {
          counts[key] = newCounts[key] || 0;
        });
      });
    }
    
    return counts;
  }, [workOrders, statusFilter]);

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
        // Update the badge count as well
        queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
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
      
      // Immediately refetch work orders and the badge count
      refetch();
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
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
      // Also update the badge count
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete work order');
    }
  };

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
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
    deleteWorkOrder,
    statusCounts,
    sortField,
    sortDirection,
    setSort: handleSort
  };
};
