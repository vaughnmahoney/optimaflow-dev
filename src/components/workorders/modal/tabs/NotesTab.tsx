
import { Button } from "@/components/ui/button";
import { WorkOrder } from "../../types";
import { Edit, MessageSquare } from "lucide-react";

interface NotesTabProps {
  workOrder: WorkOrder;
}

export const NotesTab = ({ workOrder }: NotesTabProps) => {
  const qcNotes = workOrder.qc_notes || '';
  const resolutionNotes = workOrder.resolution_notes || '';
  
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
            QC Notes
          </h3>
          <Button variant="outline" size="sm" className="h-8">
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit QC Notes
          </Button>
        </div>
        <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800 min-h-[100px]">
          {qcNotes ? (
            <p className="whitespace-pre-line">{qcNotes}</p>
          ) : (
            <p className="text-gray-400 italic">No QC notes available</p>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-green-500" />
            Resolution Notes
          </h3>
          <Button variant="outline" size="sm" className="h-8">
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit Resolution Notes
          </Button>
        </div>
        <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800 min-h-[100px]">
          {resolutionNotes ? (
            <p className="whitespace-pre-line">{resolutionNotes}</p>
          ) : (
            <p className="text-gray-400 italic">No resolution notes available</p>
          )}
        </div>
      </div>
    </div>
  );
};
