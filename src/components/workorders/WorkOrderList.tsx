
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Flag, CheckCircle } from "lucide-react";
import { ImageViewDialog } from "./ImageViewDialog";
import { useState, useEffect } from "react";

interface WorkOrder {
  id: string;
  service_date: string;
  qc_status: string;
  customer_name: string;
  technician_name: string;
  service_notes: string | null;
  time_on_site: string | null;
  has_images: boolean;
  priority: string;
  billing_status: string;
  order_id: string | null;
}

interface WorkOrderListProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string | null) => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  searchQuery: string;
  statusFilter: string | null;
}

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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Date</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service Notes</TableHead>
              <TableHead>Time on Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-gray-500">
                  No work orders found
                </TableCell>
              </TableRow>
            ) : (
              workOrders.map((workOrder) => (
                <TableRow key={workOrder.id}>
                  <TableCell>
                    {format(new Date(workOrder.service_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{workOrder.technician_name}</TableCell>
                  <TableCell>{workOrder.customer_name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {workOrder.service_notes || "No notes"}
                  </TableCell>
                  <TableCell>
                    {workOrder.time_on_site || "N/A"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={workOrder.qc_status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {workOrder.has_images && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="View Photos"
                          onClick={() => setSelectedWorkOrderId(workOrder.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Approve"
                        className="text-green-600"
                        onClick={() => onStatusUpdate(workOrder.id, "approved")}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Flag for Review"
                        className="text-red-600"
                        onClick={() => onStatusUpdate(workOrder.id, "flagged")}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ImageViewDialog 
        workOrderId={selectedWorkOrderId} 
        onClose={() => setSelectedWorkOrderId(null)}
        onStatusUpdate={onStatusUpdate}
        workOrders={workOrders}
      />
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getVariant = () => {
    switch (status) {
      case "approved":
        return "success";
      case "pending_review":
        return "warning";
      case "flagged":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Badge variant={getVariant()}>
      {status.replace(/_/g, " ").toUpperCase()}
    </Badge>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
);
