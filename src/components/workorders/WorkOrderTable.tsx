
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
import { WorkOrder } from "./types";

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
    if (!order.location) return 'N/A';
    return order.location.address || order.location.name || 'N/A';
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/10">
            <TableHead className="text-sm font-semibold text-white/70">Order #</TableHead>
            <TableHead className="text-sm font-semibold text-white/70">Service Date</TableHead>
            <TableHead className="text-sm font-semibold text-white/70">Location</TableHead>
            <TableHead className="text-sm font-semibold text-white/70">Notes</TableHead>
            <TableHead className="text-sm font-semibold text-white/70">Status</TableHead>
            <TableHead className="text-sm font-semibold text-white/70">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-white/50">
                No work orders found. Import orders from OptimoRoute to get started.
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((workOrder) => (
              <TableRow 
                key={workOrder.id}
                className="border-b border-white/5 bg-white/5 hover:bg-white/10 transition-colors duration-200"
              >
                <TableCell className="font-medium text-white">{workOrder.order_no || 'N/A'}</TableCell>
                <TableCell className="text-white/70">
                  {workOrder.service_date ? format(new Date(workOrder.service_date), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell className="max-w-xs truncate text-white/70">
                  {getLocationAddress(workOrder)}
                </TableCell>
                <TableCell className="max-w-xs truncate text-white/70">
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
                      className="text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Approve"
                      onClick={() => onStatusUpdate(workOrder.id, "approved")}
                      className="text-green-400/70 hover:text-green-400 hover:bg-green-400/10 transition-colors duration-200"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Flag for Review"
                      onClick={() => onStatusUpdate(workOrder.id, "flagged")}
                      className="text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors duration-200"
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Delete Order"
                      onClick={() => onDelete(workOrder.id)}
                      className="text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors duration-200"
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
