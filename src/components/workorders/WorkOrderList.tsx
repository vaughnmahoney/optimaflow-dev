
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

interface WorkOrder {
  id: string;
  service_date: string;
  status: string;
  customer: { name: string };
  technician: { name: string };
  service_type: { name: string } | null;
}

interface WorkOrderListProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
}

export const WorkOrderList = ({ workOrders, isLoading }: WorkOrderListProps) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                No work orders found
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell>
                  {format(new Date(workOrder.service_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{workOrder.customer.name}</TableCell>
                <TableCell>{workOrder.technician.name}</TableCell>
                <TableCell>
                  {workOrder.service_type?.name || "Not specified"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={workOrder.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getVariant = () => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "qc_review":
        return "info";
      case "billing_ready":
        return "primary";
      case "billed":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Badge variant={getVariant()}>
      {status.replace("_", " ").toUpperCase()}
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
