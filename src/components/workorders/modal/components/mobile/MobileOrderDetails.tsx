
import { MobileStatusButton } from "./MobileStatusButton";
import { WorkOrder } from "../../../types";

interface MobileOrderDetailsProps {
  workOrder: WorkOrder;
  onStatusUpdate?: (workOrderId: string, newStatus: string) => void;
}

export const MobileOrderDetails = ({
  workOrder,
  onStatusUpdate
}: MobileOrderDetailsProps) => {
  // Extracting location and service date information
  const location = workOrder.location?.name || workOrder.search_response?.scheduleInformation?.locationName || 'Unknown Location';
  const serviceDate = workOrder.service_date || workOrder.search_response?.scheduleInformation?.serviceDate || 'Unknown Date';
  
  // If there's a completion response, get driver information
  const driver = workOrder.driver?.name || workOrder.search_response?.scheduleInformation?.driverName || 'No Driver Assigned';
  
  return (
    <div className="space-y-3 p-4">
      <div className="space-y-1">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium text-gray-500">Order #</h3>
          <span className="text-sm font-medium">{workOrder.order_no}</span>
        </div>
        <div className="flex justify-between">
          <h3 className="text-sm font-medium text-gray-500">Location</h3>
          <span className="text-sm font-medium">{location}</span>
        </div>
        <div className="flex justify-between">
          <h3 className="text-sm font-medium text-gray-500">Date</h3>
          <span className="text-sm font-medium">{serviceDate}</span>
        </div>
        <div className="flex justify-between">
          <h3 className="text-sm font-medium text-gray-500">Technician</h3>
          <span className="text-sm font-medium">{driver}</span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <MobileStatusButton 
            workOrderId={workOrder.id}
            currentStatus={workOrder.status || "pending_review"}
            onStatusUpdate={onStatusUpdate}
            workOrder={workOrder}
          />
        </div>
      </div>
    </div>
  );
};
