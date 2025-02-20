
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderList } from "./WorkOrderList";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkOrder } from "./types";

export const WorkOrderContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const { data: workOrders, isLoading, error, refetch } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      
      return data.map((order): WorkOrder => ({
        id: order.id,
        order_no: order.order_no || 'N/A',
        status: order.status || 'pending_review',
        timestamp: order.timestamp || new Date().toISOString(),
        service_date: order.search_response?.date,
        service_notes: order.search_response?.notes,
        location: order.search_response?.location,
        has_images: Boolean(order.completion_response?.photos?.length),
        search_response: order.search_response,
        completion_response: order.completion_response
      }));
    },
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });

  // Set up auto-refresh
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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredWorkOrders = useCallback(() => {
    if (!workOrders) return [];
    
    return workOrders.filter(order => {
      const matchesSearch = !searchQuery || 
        order.order_no?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [workOrders, searchQuery, statusFilter]);

  if (error) {
    console.error("Error loading work orders:", error);
    return <div>Error loading work orders. Please try again.</div>;
  }

  return (
    <WorkOrderList 
      workOrders={filteredWorkOrders()} 
      isLoading={isLoading}
      onSearchChange={handleSearch}
      onStatusFilterChange={setStatusFilter}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      onStatusUpdate={handleStatusChange}
    />
  );
};
