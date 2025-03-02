
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { toast } from "sonner";
import { WorkOrder } from "../../types";
import { QcNotesSheet } from "../components/QcNotesSheet";

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

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6 py-[4px] px-0">
        <Card className="p-4 py-[16px]">
          <h3 className="font-medium mb-2">Tech Notes</h3>
          <p className="text-sm whitespace-pre-wrap">
            {completionData?.form?.note || 'No tech notes available'}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Service Notes</h3>
          <p className="text-sm whitespace-pre-wrap">
            {workOrder.service_notes || 'No service notes available'}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Additional Notes</h3>
          <p className="text-sm whitespace-pre-wrap">
            {workOrder.notes || 'No additional notes available'}
          </p>
        </Card>
        
        {/* QC Notes section */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">QC Notes</h3>
            <QcNotesSheet workOrder={workOrder} />
          </div>
          <p className="text-sm whitespace-pre-wrap">
            {workOrder.qc_notes || 'No QC notes available'}
          </p>
        </Card>
        
        {/* Resolution Notes section - only shown for flagged orders */}
        {isFlagged && (
          <Card className="p-4">
            <h3 className="font-medium mb-2">Resolution Notes</h3>
            <Textarea
              placeholder="Add notes about resolution decision..."
              className="w-full min-h-[100px] mb-3"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
            <Button 
              onClick={handleSaveResolutionNotes}
              disabled={isSaving || !resolutionNotes.trim()}
              className="w-full"
            >
              {isSaving ? "Saving..." : "Save Resolution Notes"}
            </Button>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};
