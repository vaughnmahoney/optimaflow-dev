
import { WorkOrder } from "./types";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusUpdate: (workOrderId: string, status: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
}

export const WorkOrderTable = ({ 
  workOrders,
  onStatusUpdate,
  onImageView,
  onDelete 
}: WorkOrderTableProps) => {
  if (workOrders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No work orders found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Order #</th>
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-left py-3 px-4">Location</th>
            <th className="text-left py-3 px-4">Notes</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-right py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="py-3 px-4">{order.order_no}</td>
              <td className="py-3 px-4">
                {order.service_date ? format(new Date(order.service_date), 'MMM d, yyyy') : 'N/A'}
              </td>
              <td className="py-3 px-4">
                <div>
                  {order.location?.name || order.location?.locationName || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {order.location?.address || 'No address'}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="max-w-xs truncate">
                  {order.service_notes || 'No notes'}
                </div>
              </td>
              <td className="py-3 px-4">
                <StatusBadge 
                  status={order.status} 
                  workOrderId={order.id}
                  onStatusUpdate={onStatusUpdate}
                />
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-end gap-2">
                  {order.has_images && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onImageView(order.id)}
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(order.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
