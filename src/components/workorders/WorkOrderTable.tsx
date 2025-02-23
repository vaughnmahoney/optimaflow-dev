
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
    if (!order.location) return 'N/A';
    return order.location.address || order.location.name || 'N/A';
  };

  return (
    <div className="rounded-xl border bg-white/10 backdrop-blur-xl shadow-xl transition-all duration-300">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-lg font-semibold text-gray-200">Order #</TableHead>
            <TableHead className="text-lg font-semibold text-gray-200">Service Date</TableHead>
            <TableHead className="text-lg font-semibold text-gray-200">Location</TableHead>
            <TableHead className="text-lg font-semibold text-gray-200">Notes</TableHead>
            <TableHead className="text-lg font-semibold text-gray-200">Status</TableHead>
            <TableHead className="text-lg font-semibold text-gray-200">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-gray-400">
                No work orders found. Import orders from OptimoRoute to get started.
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((workOrder) => (
              <TableRow 
                key={workOrder.id}
                className="bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-lg my-2"
              >
                <TableCell className="font-medium text-gray-200">{workOrder.order_no || 'N/A'}</TableCell>
                <TableCell className="text-gray-200">
                  {workOrder.service_date ? format(new Date(workOrder.service_date), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell className="max-w-xs truncate text-gray-200">
                  {getLocationAddress(workOrder)}
                </TableCell>
                <TableCell className="max-w-xs truncate text-gray-200">
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
                      className="hover:scale-110 transition-transform duration-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Approve"
                      className="text-green-400 hover:text-green-300 hover:scale-110 transition-all duration-200"
                      onClick={() => onStatusUpdate(workOrder.id, "approved")}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Flag for Review"
                      className="text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-200"
                      onClick={() => onStatusUpdate(workOrder.id, "flagged")}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Delete Order"
                      className="text-gray-400 hover:text-red-300 hover:scale-110 transition-all duration-200"
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
