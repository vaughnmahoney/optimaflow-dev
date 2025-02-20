
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderList } from "./WorkOrderList";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkOrder, WorkOrderSearchResponse, WorkOrderCompletionResponse } from "./types";
import { ImageViewModal } from "./ImageViewModal";

export const WorkOrderContent = () => {
  const [filterQuery, setFilterQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  
  const { data: workOrders, isLoading, error, refetch } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      
      return data.map((order): WorkOrder => {
        const searchResponse = order.search_response as WorkOrderSearchResponse | undefined;
        const completionResponse = order.completion_response as WorkOrderCompletionResponse | undefined;

        return {
          id: order.id,
          order_no: order.order_no || 'N/A',
          status: order.status || 'pending_review',
          timestamp: order.timestamp || new Date().toISOString(),
          service_date: searchResponse?.date,
          service_notes: searchResponse?.notes,
          location: searchResponse?.location || {
            name: searchResponse?.location?.name,
            address: searchResponse?.location?.address,
          },
          has_images: Boolean(completionResponse?.photos?.length),
          search_response: searchResponse,
          completion_response: completionResponse
        };
      });
    },
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleStatusChange = async (workOrderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("work_orders")
      .update({ status: newStatus })
      .eq("id", workOrderId);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    toast.success("Status updated successfully");
    refetch();
  };

  // Local filtering handler
  const handleFilter = useCallback((query: string) => {
    setFilterQuery(query.toLowerCase());
  }, []);

  // OptimoRoute search handler
  const handleOptimoRouteSearch = useCallback(async (query: string) => {
    // The API search will be handled entirely in the OptimoRouteSearchBar component
    console.log('OptimoRoute search initiated:', query);
  }, []);

  const handleImageView = (workOrderId: string) => {
    const workOrder = workOrders?.find(wo => wo.id === workOrderId) || null;
    setSelectedWorkOrder(workOrder);
  };

  const handleDelete = async (workOrderId: string) => {
    const { error } = await supabase
      .from("work_orders")
      .delete()
      .eq("id", workOrderId);

    if (error) {
      toast.error("Failed to delete work order");
      return;
    }

    toast.success("Work order deleted successfully");
    refetch();
  };

  const filteredWorkOrders = useCallback(() => {
    if (!workOrders) return [];
    
    return workOrders.filter(order => {
      const matchesSearch = !filterQuery || 
        order.order_no?.toLowerCase().includes(filterQuery) ||
        order.service_notes?.toLowerCase().includes(filterQuery) ||
        order.location?.address?.toLowerCase().includes(filterQuery) ||
        order.location?.name?.toLowerCase().includes(filterQuery);
        
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [workOrders, filterQuery, statusFilter]);

  if (error) {
    console.error("Error loading work orders:", error);
    return <div>Error loading work orders. Please try again.</div>;
  }

  return (
    <>
      <WorkOrderList 
        workOrders={filteredWorkOrders()} 
        isLoading={isLoading}
        onSearchChange={handleFilter}
        onOptimoRouteSearch={handleOptimoRouteSearch}
        onStatusFilterChange={setStatusFilter}
        searchQuery={filterQuery}
        statusFilter={statusFilter}
        onStatusUpdate={handleStatusChange}
        onImageView={handleImageView}
        onDelete={handleDelete}
      />
      
      <ImageViewModal
        workOrder={selectedWorkOrder}
        isOpen={!!selectedWorkOrder}
        onClose={() => setSelectedWorkOrder(null)}
        onStatusUpdate={handleStatusChange}
      />
    </>
  );
};
