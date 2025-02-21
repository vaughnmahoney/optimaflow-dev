
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "./sidebar/Header";
import { StatusSection } from "./sidebar/StatusSection";
import { LocationDetails } from "./sidebar/LocationDetails";
import { ServiceDetails } from "./sidebar/ServiceDetails";
import { Notes } from "./sidebar/Notes";
import { ActionButtons } from "./sidebar/ActionButtons";
import { WorkOrder } from "./types/sidebar";

interface WorkOrderDetailsSidebarProps {
  workOrder: WorkOrder;
  onClose?: () => void;
  onStatusUpdate: (workOrderId: string, status: string) => void;
  onDownloadAll?: () => void;
}

export const WorkOrderDetailsSidebar = ({
  workOrder,
  onClose,
  onStatusUpdate,
  onDownloadAll
}: WorkOrderDetailsSidebarProps) => {
  if (!workOrder) return null;

  const handleStatusUpdate = (status: string) => {
    onStatusUpdate(workOrder.id, status);
  };

  return (
    <div className="w-[300px] border-r bg-background">
      <Header orderNo={workOrder.order_no} onClose={onClose} />
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-6">
          <StatusSection status={workOrder.qc_status} />
          <LocationDetails location={workOrder.location} address={workOrder.address} />
          <ServiceDetails workOrder={workOrder} />
          <Notes workOrder={workOrder} />
          <ActionButtons onStatusUpdate={handleStatusUpdate} onDownloadAll={onDownloadAll} />
        </div>
      </ScrollArea>
    </div>
  );
};
