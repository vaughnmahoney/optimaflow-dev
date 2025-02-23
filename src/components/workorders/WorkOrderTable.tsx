
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
    <div className="rounded-xl border bg-background shadow-lg animate-fade-in overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="py-4 text-base font-semibold text-foreground/90">Order #</TableHead>
            <TableHead className="py-4 text-base font-semibold text-foreground/90">Service Date</TableHead>
            <TableHead className="py-4 text-base font-semibold text-foreground/90">Location</TableHead>
            <TableHead className="py-4 text-base font-semibold text-foreground/90">Notes</TableHead>
            <TableHead className="py-4 text-base font-semibold text-foreground/90">Status</TableHead>
            <TableHead className="py-4 text-base font-semibold text-foreground/90">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-[400px]">
                <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                  <svg
                    className="h-12 w-12 opacity-20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 13h30M9 24h30M9 35h30"
                    />
                  </svg>
                  <div className="text-xl font-medium">No work orders found</div>
                  <div className="text-sm">Import orders from OptimoRoute to get started</div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((workOrder) => (
              <TableRow 
                key={workOrder.id}
                className="group transition-colors hover:bg-muted/50"
              >
                <TableCell className="py-4 text-base font-semibold">
                  {workOrder.order_no || 'N/A'}
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-base">
                    {workOrder.service_date ? format(new Date(workOrder.service_date), "MMM d, yyyy") : "N/A"}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs py-4">
                  <div className="truncate text-base">
                    {getLocationAddress(workOrder)}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs py-4">
                  <div className="truncate text-base">
                    {workOrder.service_notes || "No notes"}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <StatusBadge status={workOrder.status || 'pending_review'} />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center justify-start gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="View Proof of Service"
                      onClick={() => onImageView(workOrder.id)}
                      className="h-9 w-9 hover:bg-background hover:scale-105 transition-transform"
                    >
                      <Eye className="h-[18px] w-[18px]" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Approve"
                      className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50 hover:scale-105 transition-transform"
                      onClick={() => onStatusUpdate(workOrder.id, "approved")}
                    >
                      <CheckCircle className="h-[18px] w-[18px]" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Flag for Review"
                      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 hover:scale-105 transition-transform"
                      onClick={() => onStatusUpdate(workOrder.id, "flagged")}
                    >
                      <Flag className="h-[18px] w-[18px]" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Delete Order"
                      className="h-9 w-9 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:scale-105 transition-transform"
                      onClick={() => onDelete(workOrder.id)}
                    >
                      <Trash2 className="h-[18px] w-[18px]" />
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
