
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../types";
import { MessageSquare, FileText, Clipboard, StickyNote } from "lucide-react";

interface NotesTabProps {
  workOrder: WorkOrder;
}

export const NotesTab = ({ workOrder }: NotesTabProps) => {
  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        <Card className="p-4 bg-gray-50 border-gray-200">
          <h3 className="font-medium mb-2 text-gray-800 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-blue-500" />
            Notes
          </h3>
          <p className="text-sm whitespace-pre-wrap text-gray-700">
            {workOrder.notes || 'No notes available'}
          </p>
        </Card>

        <Card className="p-4 bg-gray-50 border-gray-200">
          <h3 className="font-medium mb-2 text-gray-800 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
            Service Notes
          </h3>
          <p className="text-sm whitespace-pre-wrap text-gray-700">
            {workOrder.service_notes || 'No service notes available'}
          </p>
        </Card>

        <Card className="p-4 bg-gray-50 border-gray-200">
          <h3 className="font-medium mb-2 text-gray-800 flex items-center">
            <Clipboard className="h-4 w-4 mr-2 text-amber-500" />
            Tech Notes
          </h3>
          <p className="text-sm whitespace-pre-wrap text-gray-700">
            {workOrder.tech_notes || 'No tech notes available'}
          </p>
        </Card>
        
        <Card className="p-4 bg-gray-50 border-gray-200">
          <h3 className="font-medium mb-2 text-gray-800 flex items-center">
            <StickyNote className="h-4 w-4 mr-2 text-red-500" />
            QC Notes
          </h3>
          <p className="text-sm whitespace-pre-wrap text-gray-700">
            {workOrder.qc_notes || 'No QC notes available'}
          </p>
        </Card>
        
        <Card className="p-4 bg-gray-50 border-gray-200">
          <h3 className="font-medium mb-2 text-gray-800 flex items-center">
            <StickyNote className="h-4 w-4 mr-2 text-blue-500" />
            Resolution Notes
          </h3>
          <p className="text-sm whitespace-pre-wrap text-gray-700">
            {workOrder.resolution_notes || 'No resolution notes available'}
          </p>
        </Card>
      </div>
    </ScrollArea>
  );
};
