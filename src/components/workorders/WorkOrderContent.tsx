
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderList } from "./WorkOrderList";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export const WorkOrderContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const { data: workOrders, isLoading, error, refetch } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qc_dashboard_view")
        .select("*")
        .order("service_date", { ascending: false });

      if (error) throw error;
      return data;
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
      .update({ qc_status: newStatus })
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
        order.technician_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.order_id?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = !statusFilter || order.qc_status === statusFilter;
      
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
