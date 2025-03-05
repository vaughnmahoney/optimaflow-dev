
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RawJsonViewer } from "./RawJsonViewer";
import { format } from "date-fns";

interface RawOrdersTableProps {
  orders: any[];
  isLoading: boolean;
}

export const RawOrdersTable = ({ orders, isLoading }: RawOrdersTableProps) => {
  if (isLoading) {
    return <div className="py-8 text-center">Loading orders...</div>;
  }

  if (!orders || orders.length === 0) {
    return <div className="py-8 text-center">No orders found</div>;
  }

  // Extract basic info to display in the table
  const getOrderNo = (order: any) => {
    return order.order_no || order.orderNo || 
           (order.data && order.data.orderNo) || 
           'N/A';
  };

  const getServiceDate = (order: any) => {
    const date = order.service_date || 
                 (order.data && order.data.date) ||
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
    return order.status || 
           (order.completionDetails && order.completionDetails.data && order.completionDetails.data.status) || 
           'N/A';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => (
            <TableRow key={index}>
              <TableCell>{getOrderNo(order)}</TableCell>
              <TableCell>{getServiceDate(order)}</TableCell>
              <TableCell>{getDriverName(order)}</TableCell>
              <TableCell>{getStatus(order)}</TableCell>
              <TableCell>
                <RawJsonViewer data={order} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
