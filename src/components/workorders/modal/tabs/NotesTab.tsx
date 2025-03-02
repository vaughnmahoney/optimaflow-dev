
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "../../types";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { toast } from "sonner";

interface NotesTabProps {
  workOrder: WorkOrder;
}

export const NotesTab = ({
  workOrder
}: NotesTabProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  const [qcNotes, setQcNotes] = useState(workOrder.qc_notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const { updateWorkOrderQcNotes } = useWorkOrderMutations();

  const handleSaveQcNotes = async () => {
    setIsSaving(true);
    try {
      await updateWorkOrderQcNotes(workOrder.id, qcNotes);
      toast.success("QC notes saved successfully");
    } catch (error) {
      console.error("Error saving QC notes:", error);
      toast.error("Failed to save QC notes");
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

        <Card className="p-4">
          <h3 className="font-medium mb-2">QC Notes</h3>
          <Textarea 
            placeholder="Add QC notes here..."
            className="min-h-[100px] mb-2"
            value={qcNotes}
            onChange={(e) => setQcNotes(e.target.value)}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveQcNotes} 
              disabled={isSaving}
              size="sm"
            >
              {isSaving ? "Saving..." : "Save Notes"}
            </Button>
          </div>
        </Card>
      </div>
    </ScrollArea>
  );
};
