
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RawJsonViewer } from "./RawJsonViewer";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/workorders/StatusBadge";

interface RawOrdersTableProps {
  orders: any[];
  isLoading: boolean;
  originalCount?: number; // Add optional prop for original count
}

export const RawOrdersTable = ({ orders, isLoading, originalCount }: RawOrdersTableProps) => {
  if (isLoading) {
    return <div className="py-8 text-center">Loading orders...</div>;
  }

  if (!orders || orders.length === 0) {
    return <div className="py-8 text-center">No orders found</div>;
  }

  // Extract basic info to display in the table
  const getOrderNo = (order: any) => {
    return order.data?.orderNo || 
           order.orderNo || 
           (order.completionDetails && order.completionDetails.orderNo) ||
           'N/A';
  };

  const getServiceDate = (order: any) => {
    const date = order.data?.date ||
                 order.service_date || 
                 (order.searchResponse && order.searchResponse.data && order.searchResponse.data.date) ||
                 null;
    
    if (date) {
      try {
        return format(new Date(date), "MMM d, yyyy");
      } catch (e) {
        return date;
      }
    }
    return 'N/A';
  };

  const getDriverName = (order: any) => {
    if (order.driver && typeof order.driver === 'object' && order.driver.name) {
      return order.driver.name;
    }
    
    if (order.scheduleInformation && order.scheduleInformation.driverName) {
      return order.scheduleInformation.driverName;
    }
    
    if (order.searchResponse && order.searchResponse.scheduleInformation && 
        order.searchResponse.scheduleInformation.driverName) {
      return order.searchResponse.scheduleInformation.driverName;
    }
    
    return 'N/A';
  };

  // Get the completion status from OptimoRoute - Updated to match WorkOrderRow implementation
  const getCompletionStatus = (order: any) => {
    return order.completion_status || 
           (order.completionDetails?.data?.status) ||
           (order.completion_response?.orders?.[0]?.data?.status) ||
           (order.searchResponse?.scheduleInformation?.status) ||
           (order.search_response?.scheduleInformation?.status);
  };

  // Get the QC status (internal review status)
  const getQcStatus = (order: any) => {
    // Default to pending_review for newly imported orders
    return order.status || "pending_review";
  };

  const hasImages = (order: any) => {
    return !!(order.completionDetails?.data?.form?.images?.length > 0);
  };

  return (
    <div className="space-y-4">
      {/* Show order count and deduplication stats */}
      <div className="text-sm bg-slate-50 p-3 rounded border">
        <div className="flex justify-between items-center">
          <span className="font-medium">
            Displaying <span className="text-green-600 font-bold">{orders.length}</span> orders
          </span>
          
          {/* Show deduplication stats if originalCount is provided */}
          {originalCount !== undefined && originalCount !== orders.length && (
            <div className="text-muted-foreground">
              <span className="font-medium">Deduplication applied:</span> {orders.length} unique orders from {originalCount} total entries.
              <span className="ml-2 text-green-600">
                ({originalCount - orders.length} duplicates removed)
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Images</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => {
              const completionStatus = getCompletionStatus(order);
              const qcStatus = getQcStatus(order);
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{getOrderNo(order)}</TableCell>
                  <TableCell>{getServiceDate(order)}</TableCell>
                  <TableCell>{getDriverName(order)}</TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={qcStatus}
                      completionStatus={completionStatus}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {hasImages(order) ? (
                      <Badge variant="outline" className="bg-slate-100">
                        {order.completionDetails?.data?.form?.images?.length || 0}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <RawJsonViewer data={order} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
