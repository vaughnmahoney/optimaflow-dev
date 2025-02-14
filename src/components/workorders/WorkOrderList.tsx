
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageViewDialog } from "./ImageViewDialog";
import { WorkOrderTable } from "./WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useState, useEffect } from "react";
import { WorkOrderListProps } from "./types";

export const WorkOrderList = ({ 
  workOrders, 
  isLoading,
  onSearchChange,
  onStatusFilterChange,
  onStatusUpdate,
  searchQuery,
  statusFilter
}: WorkOrderListProps) => {
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenWorkOrder = (event: CustomEvent<string>) => {
      setSelectedWorkOrderId(event.detail);
    };

    window.addEventListener('openWorkOrder', handleOpenWorkOrder as EventListener);
    return () => {
      window.removeEventListener('openWorkOrder', handleOpenWorkOrder as EventListener);
    };
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => onStatusFilterChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <WorkOrderTable 
        workOrders={workOrders}
        onStatusUpdate={onStatusUpdate}
        onImageView={setSelectedWorkOrderId}
      />

      <ImageViewDialog 
        workOrderId={selectedWorkOrderId} 
        onClose={() => setSelectedWorkOrderId(null)}
        onStatusUpdate={onStatusUpdate}
        workOrders={workOrders}
      />
    </div>
  );
};
