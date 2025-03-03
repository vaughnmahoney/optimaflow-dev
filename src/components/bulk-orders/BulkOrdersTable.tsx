
import { WorkOrder } from "@/components/workorders/types";
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from "@/components/ui/table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/workorders/StatusBadge";

interface BulkOrdersTableProps {
  orders: WorkOrder[];
  isLoading: boolean;
}

export const BulkOrdersTable = ({ orders, isLoading }: BulkOrdersTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-md border p-8">
        <div className="flex justify-center">
          <div className="animate-pulse text-muted-foreground">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-md border p-8">
        <div className="flex justify-center">
          <div className="text-muted-foreground">No orders found</div>
        </div>
      </div>
    );
  }

  const getLocationName = (order: WorkOrder): string => {
    if (!order.location) return 'N/A';
    
    if (typeof order.location === 'object' && order.location.name) {
      return order.location.name;
    }
    
    return 'N/A';
  };

  const getDriverName = (order: WorkOrder): string => {
    if (!order.driver) return 'No Driver';
    
    if (typeof order.driver === 'object' && order.driver.name) {
      return order.driver.name;
    }
    
    return 'No Driver';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Service Date</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Has Images</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.order_no}</TableCell>
              <TableCell>
                {order.service_date ? format(new Date(order.service_date), "MMM d, yyyy") : "N/A"}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {getDriverName(order)}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {getLocationName(order)}
              </TableCell>
              <TableCell>
                {order.has_images ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <Eye className="h-4 w-4" />
                  </Button>
                ) : (
                  "No"
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status="imported" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-4 text-sm text-muted-foreground">
        Showing {orders.length} orders
      </div>
    </div>
  );
};
