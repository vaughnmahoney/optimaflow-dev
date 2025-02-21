
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Flag, CheckCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { WorkOrder, WorkOrderSearchResponse } from "./types";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
}

export const WorkOrderTable = ({ 
  workOrders, 
  onStatusUpdate,
  onImageView,
  onDelete
}: WorkOrderTableProps) => {
  const getLocationAddress = (order: WorkOrder): string => {
    const searchResponse = order.search_response as WorkOrderSearchResponse;
    const location = searchResponse?.location;
    
    if (!location) return 'N/A';
    return location.address || location.name || 'N/A';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Service Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                No work orders found. Import orders from OptimoRoute to get started.
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell>{workOrder.order_no || 'N/A'}</TableCell>
                <TableCell>
                  {workOrder.service_date ? format(new Date(workOrder.service_date), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {getLocationAddress(workOrder)}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {workOrder.service_notes || "No notes"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={workOrder.status || 'pending_review'} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="View Proof of Service"
                      onClick={() => onImageView(workOrder.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Delete Order"
                      className="text-gray-600 hover:text-red-600"
                      onClick={() => onDelete(workOrder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
