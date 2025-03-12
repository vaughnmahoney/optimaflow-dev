
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkOrder } from "../../types";
import { QcNotesSheet } from "../components/QcNotesSheet";
import { ResolutionNotesSheet } from "../components/ResolutionNotesSheet";
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
  const isFlagged = workOrder.status === "flagged";
  
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
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {/* Tech Notes */}
        <Card className="overflow-hidden border-l-4 border-l-blue-400">
          <div className="bg-gradient-to-r from-blue-50 to-transparent p-3 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <h3 className="font-medium text-blue-700">Tech Notes</h3>
            </div>
          </div>
          <div className="p-4">
            {completionData?.form?.note ? (
              <p className="text-sm whitespace-pre-wrap text-gray-700">
                {completionData.form.note}
              </p>
            ) : (
              <EmptyNoteState type="tech" />
            )}
          </div>
        </Card>

        {/* Service Notes */}
        <Card className="overflow-hidden border-l-4 border-l-green-400">
          <div className="bg-gradient-to-r from-green-50 to-transparent p-3 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-green-500" />
              <h3 className="font-medium text-green-700">Service Notes</h3>
            </div>
          </div>
          <div className="p-4">
            {workOrder.service_notes ? (
              <p className="text-sm whitespace-pre-wrap text-gray-700">
                {workOrder.service_notes}
              </p>
            ) : (
              <EmptyNoteState type="service" />
            )}
          </div>
        </Card>
        
        {/* Additional Notes */}
        <Card className="overflow-hidden border-l-4 border-l-amber-400">
          <div className="bg-gradient-to-r from-amber-50 to-transparent p-3 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-500" />
              <h3 className="font-medium text-amber-700">Additional Notes</h3>
            </div>
          </div>
          <div className="p-4">
            {workOrder.notes ? (
              <p className="text-sm whitespace-pre-wrap text-gray-700">
                {workOrder.notes}
              </p>
            ) : (
              <EmptyNoteState type="additional" />
            )}
          </div>
        </Card>
        
        {/* QC Notes */}
        <Card className="overflow-hidden border-l-4 border-l-purple-400">
          <div className="bg-gradient-to-r from-purple-50 to-transparent p-3 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-purple-500" />
              <h3 className="font-medium text-purple-700">QC Notes</h3>
            </div>
            <QcNotesSheet workOrder={workOrder} />
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
        
        {/* Resolution Notes - only shown for flagged orders */}
        {isFlagged && (
          <Card className="overflow-hidden border-l-4 border-l-red-400">
            <div className="bg-gradient-to-r from-red-50 to-transparent p-3 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <PenSquare className="h-4 w-4 text-red-500" />
                <h3 className="font-medium text-red-700">Resolution Notes</h3>
              </div>
              <ResolutionNotesSheet workOrder={workOrder} />
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
        )}
      </div>
    </ScrollArea>
  );
};
