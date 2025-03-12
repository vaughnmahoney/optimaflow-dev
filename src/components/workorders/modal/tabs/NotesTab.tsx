
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
  const searchData = workOrder.search_response?.data;
  
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
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-5 space-y-6">
          {/* Tech Notes Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
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
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
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
          
          {/* Additional Notes Section - Now with correct mapping */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800 text-lg">Additional Notes</h3>
            </div>
            
            <div className="pl-7">
              {searchData?.customField1 ? (
                <p className="text-sm whitespace-pre-wrap text-gray-700">
                  {searchData.customField1}
                </p>
              ) : (
                <EmptyNoteState type="additional" />
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* QC Notes - Updated with clean style */}
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <StickyNote className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-800 text-lg">QC Notes</h3>
          </div>
          
          <div className="pl-7">
            {workOrder.qc_notes ? (
              <p className="text-sm whitespace-pre-wrap text-gray-700">
                {workOrder.qc_notes}
              </p>
            ) : (
              <EmptyNoteState type="QC" />
            )}
          </div>
        </div>
      </Card>
      
      {/* Resolution Notes - Updated with clean style */}
      <Card className="overflow-hidden border shadow-sm bg-white">
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <PenSquare className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-800 text-lg">Resolution Notes</h3>
          </div>
          
          <div className="pl-7">
            {workOrder.resolution_notes ? (
              <p className="text-sm whitespace-pre-wrap text-gray-700">
                {workOrder.resolution_notes}
              </p>
            ) : (
              <EmptyNoteState type="resolution" />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
