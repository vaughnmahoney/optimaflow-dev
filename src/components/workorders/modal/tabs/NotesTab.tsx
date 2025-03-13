
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../types";
import { FileText } from "lucide-react";

interface NotesTabProps {
  workOrder: WorkOrder;
}

export const NotesTab = ({ workOrder }: NotesTabProps) => {
  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-4">
        <Card className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm text-gray-700">Notes</h3>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {workOrder.notes || 'No notes available'}
          </p>
        </Card>

        <Card className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium text-sm text-gray-700">Service Notes</h3>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {workOrder.service_notes || 'No service notes available'}
          </p>
        </Card>

        <Card className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-green-500" />
            <h3 className="font-medium text-sm text-gray-700">Tech Notes</h3>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {workOrder.tech_notes || 'No tech notes available'}
          </p>
        </Card>

        <Card className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-orange-500" />
            <h3 className="font-medium text-sm text-gray-700">QC Notes</h3>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {workOrder.qc_notes || 'No QC notes available'}
          </p>
        </Card>

        <Card className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-purple-500" />
            <h3 className="font-medium text-sm text-gray-700">Resolution Notes</h3>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {workOrder.resolution_notes || 'No resolution notes available'}
          </p>
        </Card>
      </div>
    </ScrollArea>
  );
};
