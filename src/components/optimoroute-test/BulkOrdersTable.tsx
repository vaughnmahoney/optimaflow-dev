
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { BulkOrder } from '@/hooks/useBulkOrdersFetch';
import { Eye } from 'lucide-react';

interface BulkOrdersTableProps {
  orders: BulkOrder[];
}

export const BulkOrdersTable = ({ orders }: BulkOrdersTableProps) => {
  return (
    <Card>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">Results: {orders.length} Orders</h2>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNo}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell>
                    {order.location?.locationName || order.location?.address || "N/A"}
                  </TableCell>
                  <TableCell>{order.status || "N/A"}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4 mr-1" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};
