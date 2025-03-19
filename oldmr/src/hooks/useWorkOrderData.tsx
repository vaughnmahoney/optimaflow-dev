import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/components/workorders/types";
import { toast } from "sonner";

export const useWorkOrderData = (searchQuery: string = "") => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("work_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setWorkOrders(data || []);
    } catch (error: any) {
      console.error("Error fetching work orders:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const searchWorkOrder = (searchTerm: string) => {
    fetchData();
  };

  const searchOptimoRoute = async (orderNumber: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-optimoroute', {
        body: { searchQuery: orderNumber }
      });

      if (error) throw error;

      if (data.success && data.workOrderId) {
        toast.success('OptimoRoute order found');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to find OptimoRoute order');
      }
    } catch (error) {
      console.error('OptimoRoute search error:', error);
      toast.error('Failed to search OptimoRoute');
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkOrderStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("work_orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setWorkOrders(
        workOrders.map((wo) =>
          wo.id === id ? { ...wo, status: newStatus } : wo
        )
      );
      toast.success("Work order status updated successfully!");
    } catch (error: any) {
      console.error("Error updating work order status:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const openImageViewer = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setSelectedImageUrl(null);
    setImageViewerOpen(false);
  };

  const deleteWorkOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from("work_orders")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setWorkOrders(workOrders.filter((wo) => wo.id !== id));
      toast.success("Work order deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting work order:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  return {
    workOrders,
    isLoading,
    statusFilter,
    setStatusFilter,
    imageViewerOpen,
    selectedImageUrl,
    searchWorkOrder,
    searchOptimoRoute,
    updateWorkOrderStatus,
    openImageViewer,
    closeImageViewer,
    deleteWorkOrder,
  };
};
