
import { useState, useEffect } from "react";
import { WorkOrder } from "@/components/workorders/types";
import { toast } from "sonner";

/**
 * Hook to manage status changes for bulk order adapter
 */
export const useAdapterStatusManager = (workOrders: WorkOrder[]) => {
  // Status counts state with resolved and rejected properties
  const [statusCounts, setStatusCounts] = useState({
    approved: 0,
    pending_review: 0,
    flagged: 0,
    resolved: 0,
    rejected: 0,
    all: 0
  });

  // Update status counts when work orders change
  useEffect(() => {
    if (workOrders.length > 0) {
      // Calculate status counts
      const counts = workOrders.reduce((acc, order) => {
        const status = order.status || "pending_review";
        if (status === "approved") acc.approved++;
        else if (status === "flagged" || status === "flagged_followup") acc.flagged++;
        else if (status === "resolved") acc.resolved++;
        else if (status === "rejected") acc.rejected++;
        else if (status === "pending_review") acc.pending_review++;
        return acc;
      }, { approved: 0, pending_review: 0, flagged: 0, resolved: 0, rejected: 0, all: workOrders.length });
      
      setStatusCounts(counts);
    } else {
      setStatusCounts({ approved: 0, pending_review: 0, flagged: 0, resolved: 0, rejected: 0, all: 0 });
    }
  }, [workOrders]);

  // Update work order status
  const updateWorkOrderStatus = (
    setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>,
    workOrderId: string, 
    newStatus: string
  ) => {
    // Update in local state since this is just for the bulk processing view
    setWorkOrders(prev => 
      prev.map(wo => wo.id === workOrderId 
        ? { ...wo, status: newStatus } 
        : wo
      )
    );
    
    toast.success(`Status updated to ${newStatus}`);
    
    // Also update status counts
    setStatusCounts(prev => {
      const newCounts = { ...prev };
      
      // Find the order to update
      const order = workOrders.find(wo => wo.id === workOrderId);
      if (order) {
        // Decrement old status count
        const oldStatus = order.status || "pending_review";
        if (oldStatus === "approved") newCounts.approved--;
        else if (oldStatus === "flagged" || oldStatus === "flagged_followup") newCounts.flagged--;
        else if (oldStatus === "resolved") newCounts.resolved--;
        else if (oldStatus === "rejected") newCounts.rejected--;
        else if (oldStatus === "pending_review") newCounts.pending_review--;
        
        // Increment new status count
        if (newStatus === "approved") newCounts.approved++;
        else if (newStatus === "flagged" || newStatus === "flagged_followup") newCounts.flagged++;
        else if (newStatus === "resolved") newCounts.resolved++;
        else if (newStatus === "rejected") newCounts.rejected++;
        else if (newStatus === "pending_review") newCounts.pending_review++;
      }
      
      return newCounts;
    });
  };
  
  // Delete a work order from the list
  const deleteWorkOrder = (
    setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>,
    workOrderId: string
  ) => {
    // Find the order to delete before we remove it
    const orderToDelete = workOrders.find(wo => wo.id === workOrderId);
    
    // Just remove from local state
    setWorkOrders(prev => prev.filter(wo => wo.id !== workOrderId));
    toast.success("Work order removed from view");
    
    // Update status counts if we found the order
    if (orderToDelete) {
      setStatusCounts(prev => {
        const newCounts = { ...prev };
        const status = orderToDelete.status || "pending_review";
        if (status === "approved") newCounts.approved--;
        else if (status === "flagged" || status === "flagged_followup") newCounts.flagged--;
        else if (status === "resolved") newCounts.resolved--;
        else if (status === "rejected") newCounts.rejected--;
        else if (status === "pending_review") newCounts.pending_review--;
        newCounts.all--;
        return newCounts;
      });
    }
  };

  return {
    statusCounts,
    updateWorkOrderStatus,
    deleteWorkOrder
  };
};
