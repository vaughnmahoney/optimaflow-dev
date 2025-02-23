
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
import { cn } from "@/lib/utils";

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
    <div className="rounded-xl border bg-card shadow-xl overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/60 bg-gradient-to-b from-muted/80 to-muted/60">
            <TableHead className="py-6 text-[15px] font-semibold tracking-tight text-foreground/90">
              Order #
            </TableHead>
            <TableHead className="py-6 text-[15px] font-semibold tracking-tight text-foreground/90">
              Service Date
            </TableHead>
            <TableHead className="py-6 text-[15px] font-semibold tracking-tight text-foreground/90">
              Location
            </TableHead>
            <TableHead className="py-6 text-[15px] font-semibold tracking-tight text-foreground/90">
              Notes
            </TableHead>
            <TableHead className="py-6 text-[15px] font-semibold tracking-tight text-foreground/90">
              Status
            </TableHead>
            <TableHead className="py-6 text-[15px] font-semibold tracking-tight text-foreground/90">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-[400px]">
                <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                  <svg
                    className="h-12 w-12 opacity-20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 48 48"
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
            workOrders.map((workOrder, index) => (
              <TableRow 
                key={workOrder.id}
                className={cn(
                  "transition-all duration-200 border-b border-border/40",
                  "hover:bg-muted/30 group",
                  index % 2 === 0 ? "bg-muted/[0.15]" : "bg-background"
                )}
              >
                <TableCell className="py-5 pl-6">
                  <span className="font-bold text-[15px] text-foreground/90">
                    {workOrder.order_no || 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="py-5 text-[14px] text-foreground/80">
                  {workOrder.service_date ? format(new Date(workOrder.service_date), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell className="max-w-xs py-5">
                  <div className="truncate text-[14px] text-foreground/80">{getLocationAddress(workOrder)}</div>
                </TableCell>
                <TableCell className="max-w-xs py-5">
                  <div className="truncate text-[14px] text-foreground/80">{workOrder.service_notes || "No notes"}</div>
                </TableCell>
                <TableCell className="py-5">
                  <StatusBadge status={workOrder.status || 'pending_review'} />
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex items-center gap-2 opacity-90 group-hover:opacity-100">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="View Proof of Service"
                      onClick={() => onImageView(workOrder.id)}
                      className="h-10 w-10 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
                    >
                      <Eye className="h-[18px] w-[18px]" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Approve"
                      className="h-10 w-10 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-green-50 hover:text-green-600 hover:shadow-md"
                      onClick={() => onStatusUpdate(workOrder.id, "approved")}
                    >
                      <CheckCircle className="h-[18px] w-[18px]" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Flag for Review"
                      className="h-10 w-10 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
                      onClick={() => onStatusUpdate(workOrder.id, "flagged")}
                    >
                      <Flag className="h-[18px] w-[18px]" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Delete Order"
                      className="h-10 w-10 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
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
