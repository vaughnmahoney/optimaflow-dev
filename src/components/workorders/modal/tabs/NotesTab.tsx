
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../types";
import { 
  MessageSquare, 
  Wrench, 
  ClipboardList, 
  StickyNote, 
  PenSquare, 
  FileText,
  Package
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
    <div className="flex items-center justify-center p-3 bg-gray-50 rounded-md border border-gray-100">
      <div className="text-center">
        <FileText className="h-5 w-5 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No {type} notes available</p>
      </div>
    </div>
  );

  // Extract material quantity
  const materialQuantity = searchData?.customField3 || "N/A";

  return (
    <div className="space-y-5 pt-2 px-4">
      {/* Materials Section */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2">
              <Package className="h-5 w-5 text-gray-400" />
              <h3 className="font-medium text-gray-800 text-base">Materials</h3>
            </div>
            
            <div className="pl-7 grid grid-cols-[100px_1fr] gap-y-2">
              <span className="text-sm text-gray-600">Quantity:</span>
              <span className="text-sm text-gray-700">{materialQuantity}</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tech Notes Section */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <h3 className="font-medium text-gray-800 text-base">Tech Notes</h3>
            </div>
            
            <div className="pl-7">
              {completionData?.form?.note ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {completionData.form.note}
                </p>
              ) : (
                <EmptyNoteState type="tech" />
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Service Notes Section */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2">
              <Wrench className="h-5 w-5 text-gray-400" />
              <h3 className="font-medium text-gray-800 text-base">Service Notes</h3>
            </div>
            
            <div className="pl-7">
              {workOrder.service_notes ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {workOrder.service_notes}
                </p>
              ) : (
                <EmptyNoteState type="service" />
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Additional Notes Section */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2">
              <ClipboardList className="h-5 w-5 text-gray-400" />
              <h3 className="font-medium text-gray-800 text-base">Additional Notes</h3>
            </div>
            
            <div className="pl-7">
              {searchData?.customField1 ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {searchData.customField1}
                </p>
              ) : (
                <EmptyNoteState type="additional" />
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* QC Notes Section */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2">
              <StickyNote className="h-5 w-5 text-gray-400" />
              <h3 className="font-medium text-gray-800 text-base">QC Notes</h3>
            </div>
            
            <div className="pl-7">
              {workOrder.qc_notes ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {workOrder.qc_notes}
                </p>
              ) : (
                <EmptyNoteState type="QC" />
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Resolution Notes Section */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm mb-4">
        <div className="p-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2">
              <PenSquare className="h-5 w-5 text-gray-400" />
              <h3 className="font-medium text-gray-800 text-base">Resolution Notes</h3>
            </div>
            
            <div className="pl-7">
              {workOrder.resolution_notes ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {workOrder.resolution_notes}
                </p>
              ) : (
                <EmptyNoteState type="resolution" />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
