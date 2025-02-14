
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Flag, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { WorkOrder } from "./types";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
}

export const WorkOrderTable = ({ 
  workOrders, 
  onStatusUpdate,
  onImageView 
}: WorkOrderTableProps) => {
  const formatTimeOnSite = (timeOnSite: unknown | null): string => {
    if (!timeOnSite) return "N/A";
    return String(timeOnSite);
  };

  return (
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
                  {formatTimeOnSite(workOrder.time_on_site)}
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
                        onClick={() => onImageView(workOrder.id)}
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
  );
};
