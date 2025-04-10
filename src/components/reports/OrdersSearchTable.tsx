
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface OrdersSearchTableProps {
  orders: any[];
  isLoading: boolean;
}

export const OrdersSearchTable = ({ orders, isLoading }: OrdersSearchTableProps) => {
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

  // Helper function to extract location name
  const getLocationName = (order: any) => {
    if (order.data && order.data.location) {
      return order.data.location.locationName || 'Unknown Location';
    }
    return 'Unknown Location';
  };

  // Helper function to extract order status
  const getOrderStatus = (order: any) => {
    // If scheduleInformation is null, order is unscheduled
    if (order.scheduleInformation === null) {
      return 'unscheduled';
    }
    return order.status || 'unknown';
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Driver</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{order.data?.orderNo || 'N/A'}</TableCell>
              <TableCell>{formatDate(order.data?.date)}</TableCell>
              <TableCell>{getLocationName(order)}</TableCell>
              <TableCell>
                <StatusBadge status={getOrderStatus(order)} />
              </TableCell>
              <TableCell>
                {order.scheduleInformation?.driverName || 'Not Assigned'}
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

// Simple status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  
  switch (status.toLowerCase()) {
    case 'success':
      variant = "default";
      break;
    case 'scheduled':
      variant = "secondary";
      break;
    case 'unscheduled':
      variant = "outline";
      break;
    case 'failed':
    case 'rejected':
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};
