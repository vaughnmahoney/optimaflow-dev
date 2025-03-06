
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RawJsonViewer } from "./RawJsonViewer";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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

  const getStatus = (order: any) => {
    // Look for status in different possible locations
    const status = order.status || 
                  order.completion_status ||
                  (order.completionDetails && order.completionDetails.data && order.completionDetails.data.status) || 
                  (order.extracted && order.extracted.completionStatus) ||
                  'N/A';
    
    return status;
  };

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
              const status = getStatus(order);
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{getOrderNo(order)}</TableCell>
                  <TableCell>{getServiceDate(order)}</TableCell>
                  <TableCell>{getDriverName(order)}</TableCell>
                  <TableCell>{getStatusBadge(status)}</TableCell>
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
