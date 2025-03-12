
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { toast } from "sonner";
import { WorkOrder } from "../../types";
import { QcNotesSheet } from "../components/QcNotesSheet";
import { 
  MessageSquare, 
  Wrench, 
  ClipboardList, 
  StickyNote, 
  PenSquare, 
  FileText 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NotesTabProps {
  workOrder: WorkOrder;
}

export const NotesTab = ({
  workOrder
}: NotesTabProps) => {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { updateWorkOrderResolutionNotes } = useWorkOrderMutations();
  const completionData = workOrder.completion_response?.orders[0]?.data;
  const isFlagged = workOrder.status === "flagged";
  
  // Load existing resolution notes if available
  useEffect(() => {
    if (workOrder.resolution_notes) {
      setResolutionNotes(workOrder.resolution_notes);
    }
  }, [workOrder.resolution_notes]);
  
  // Save resolution notes
  const handleSaveResolutionNotes = async () => {
    if (!resolutionNotes.trim()) return;
    
    setIsSaving(true);
    try {
      await updateWorkOrderResolutionNotes(workOrder.id, resolutionNotes);
      toast.success("Resolution notes saved");
    } catch (error) {
      console.error("Error saving resolution notes:", error);
      toast.error("Failed to save resolution notes");
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="p-6 space-y-5">
        {/* Tech Notes */}
        <Card className="overflow-hidden border-l-4 border-l-blue-400">
          <div className="bg-gradient-to-r from-blue-50 to-transparent p-3 flex items-center gap-2 border-b">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium text-blue-700">Tech Notes</h3>
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
          <div className="bg-gradient-to-r from-green-50 to-transparent p-3 flex items-center gap-2 border-b">
            <Wrench className="h-4 w-4 text-green-500" />
            <h3 className="font-medium text-green-700">Service Notes</h3>
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
          <div className="bg-gradient-to-r from-amber-50 to-transparent p-3 flex items-center gap-2 border-b">
            <ClipboardList className="h-4 w-4 text-amber-500" />
            <h3 className="font-medium text-amber-700">Additional Notes</h3>
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
            <div className="bg-gradient-to-r from-red-50 to-transparent p-3 flex items-center gap-2 border-b">
              <PenSquare className="h-4 w-4 text-red-500" />
              <h3 className="font-medium text-red-700">Resolution Notes</h3>
            </div>
            <div className="p-4 space-y-3">
              <Textarea
                placeholder="Add notes about resolution decision..."
                className="w-full min-h-[100px] border-gray-200 focus:border-red-300 bg-white/50"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
              <Button 
                onClick={handleSaveResolutionNotes}
                disabled={isSaving || !resolutionNotes.trim()}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                {isSaving ? "Saving..." : "Save Resolution Notes"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};
