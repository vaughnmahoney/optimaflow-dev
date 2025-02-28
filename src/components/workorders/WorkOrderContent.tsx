
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderList } from "./WorkOrderList";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkOrder, WorkOrderSearchResponse, WorkOrderCompletionResponse, WorkOrderListProps } from "./types";
import { ImageViewModal } from "./modal/ImageViewModal";

interface WorkOrderContentProps extends WorkOrderListProps {}

export const WorkOrderContent = ({ 
  workOrders,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  onStatusUpdate,
  onImageView,
  onDelete,
  searchQuery,
  onSearchChange,
  onOptimoRouteSearch
}: WorkOrderContentProps) => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const queryClient = useQueryClient();
  
  const handleImageView = (workOrderId: string) => {
    const index = workOrders.findIndex(wo => wo.id === workOrderId);
    const workOrder = workOrders[index];
    setSelectedWorkOrder(workOrder);
    setSelectedIndex(index);
  };

  const handleOrderNavigation = (newIndex: number) => {
    setSelectedWorkOrder(workOrders[newIndex]);
    setSelectedIndex(newIndex);
  };

  return (
    <>
      <WorkOrderList 
        workOrders={workOrders} 
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onOptimoRouteSearch={onOptimoRouteSearch}
        onStatusFilterChange={onStatusFilterChange}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onStatusUpdate={onStatusUpdate}
        onImageView={handleImageView}
        onDelete={onDelete}
      />
      
      <ImageViewModal
        workOrder={selectedWorkOrder}
        workOrders={workOrders}
        currentIndex={selectedIndex}
        isOpen={!!selectedWorkOrder}
        onClose={() => setSelectedWorkOrder(null)}
        onStatusUpdate={onStatusUpdate}
        onNavigate={handleOrderNavigation}
      />
    </>
  );
};
