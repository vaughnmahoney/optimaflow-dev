import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkOrder } from "../../types";
import { 
  MessageSquare, 
  Wrench, 
  ClipboardList, 
  StickyNote, 
  PenSquare, 
  FileText 
} from "lucide-react";

interface NotesTabProps {
  workOrder: WorkOrder;
}

export const NotesTab = ({
  workOrder
}: NotesTabProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  
  // Helper function to create an empty state for notes
  const EmptyNoteState = ({ type }: { type: string }) => (
    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md border border-gray-100">
      <div className="text-center">
        <FileText className="h-5 w-5 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No {type} notes available</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Combined Technician Notes */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-blue-50 to-white">
        <div className="p-5 space-y-6">
          {/* Tech Notes Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800 text-lg">Tech Notes</h3>
            </div>
            
            <div className="pl-7">
              {completionData?.form?.note ? (
                <p className="text-sm whitespace-pre-wrap text-gray-700">
                  {completionData.form.note}
                </p>
              ) : (
                <EmptyNoteState type="tech" />
              )}
            </div>
          </div>
          
          {/* Service Notes Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800 text-lg">Service Notes</h3>
            </div>
            
            <div className="pl-7">
              {workOrder.service_notes ? (
                <p className="text-sm whitespace-pre-wrap text-gray-700">
                  {workOrder.service_notes}
                </p>
              ) : (
                <EmptyNoteState type="service" />
              )}
            </div>
          </div>
          
          {/* Additional Notes Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800 text-lg">Additional Notes</h3>
            </div>
            
            <div className="pl-7">
              {workOrder.notes ? (
                <p className="text-sm whitespace-pre-wrap text-gray-700">
                  {workOrder.notes}
                </p>
              ) : (
                <EmptyNoteState type="additional" />
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* QC Notes - Keep separate with red accent */}
      <Card className="overflow-hidden border-l-4 border-l-red-400">
        <div className="bg-gradient-to-r from-red-50 to-transparent p-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-red-500" />
            <h3 className="font-medium text-red-700">QC Notes</h3>
          </div>
        </div>
        <div className="p-4">
          {workOrder.qc_notes ? (
            <p className="text-sm whitespace-pre-wrap text-gray-700">
              {workOrder.qc_notes}
            </p>
          ) : (
            <EmptyNoteState type="QC" />
          )}
        </div>
      </Card>
      
      {/* Resolution Notes - Keep separate with purple accent */}
      <Card className="overflow-hidden border-l-4 border-l-purple-400">
        <div className="bg-gradient-to-r from-purple-50 to-transparent p-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <PenSquare className="h-4 w-4 text-purple-500" />
            <h3 className="font-medium text-purple-700">Resolution Notes</h3>
          </div>
        </div>
        <div className="p-4">
          {workOrder.resolution_notes ? (
            <p className="text-sm whitespace-pre-wrap text-gray-700">
              {workOrder.resolution_notes}
            </p>
          ) : (
            <EmptyNoteState type="resolution" />
          )}
        </div>
      </Card>
    </div>
  );
};
