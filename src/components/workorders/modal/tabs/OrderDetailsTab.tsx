
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrderDetails } from "../components/OrderDetails";
import { WorkOrder } from "../../types";

interface OrderDetailsTabProps {
  workOrder: WorkOrder;
}

export const OrderDetailsTab = ({
  workOrder
}: OrderDetailsTabProps) => {
  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <OrderDetails workOrder={workOrder} />
      </div>
    </ScrollArea>
  );
};
