
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../types";

interface NotesTabProps {
  workOrder: WorkOrder;
}

export const NotesTab = ({ workOrder }: NotesTabProps) => {
  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        <Card className="p-4">
          <h3 className="font-medium mb-2">Notes</h3>
          <p className="text-sm whitespace-pre-wrap">
            {workOrder.notes || 'No notes available'}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Service Notes</h3>
          <p className="text-sm whitespace-pre-wrap">
            {workOrder.service_notes || 'No service notes available'}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Tech Notes</h3>
          <p className="text-sm whitespace-pre-wrap">
            {workOrder.tech_notes || 'No tech notes available'}
          </p>
        </Card>
      </div>
    </ScrollArea>
  );
};
