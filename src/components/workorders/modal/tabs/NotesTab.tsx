
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkOrder } from "../../types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NotesTabProps {
  workOrder: WorkOrder;
  onSaveQcNotes?: (workOrderId: string, notes: string) => Promise<void>;
}

export const NotesTab = ({
  workOrder,
  onSaveQcNotes
}: NotesTabProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  const [qcNotes, setQcNotes] = useState(workOrder.qc_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setQcNotes(workOrder.qc_notes || '');
  }, [workOrder.id, workOrder.qc_notes]);

  const handleSaveNotes = async () => {
    if (!onSaveQcNotes) return;
    
    setIsSaving(true);
    try {
      await onSaveQcNotes(workOrder.id, qcNotes);
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
        {/* QC Notes Input Section */}
        <Card className="p-4">
          <div className="space-y-3">
            <Label htmlFor="qc-notes" className="font-medium">QC Notes</Label>
            <Textarea 
              id="qc-notes"
              placeholder="Add QC review notes here..."
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
              className="min-h-[100px]"
            />
            {onSaveQcNotes && (
              <Button 
                onClick={handleSaveNotes} 
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? "Saving..." : "Save Notes"}
              </Button>
            )}
          </div>
        </Card>

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
      </div>
    </ScrollArea>
  );
};
