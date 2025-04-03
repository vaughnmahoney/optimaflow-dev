
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrder } from "../../types";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { StickyNote, Save, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QcNotesSheetProps {
  workOrder: WorkOrder;
}

export const QcNotesSheet = ({ workOrder }: QcNotesSheetProps) => {
  const [qcNotes, setQcNotes] = useState(workOrder.qc_notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const { updateWorkOrderQcNotes } = useWorkOrderMutations();
  const [isOpen, setIsOpen] = useState(false);
  
  // Reset qcNotes when the workOrder changes
  useEffect(() => {
    setQcNotes(workOrder.qc_notes || "");
  }, [workOrder.id, workOrder.qc_notes]);

  const handleSaveQcNotes = async () => {
    setIsSaving(true);
    try {
      await updateWorkOrderQcNotes(workOrder.id, qcNotes);
      toast.success("QC notes saved successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving QC notes:", error);
      toast.error("Failed to save QC notes");
    } finally {
      setIsSaving(false);
    }
  };

  // Check if there are existing notes
  const hasNotes = workOrder.qc_notes && workOrder.qc_notes.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`relative gap-1 px-2 py-1 h-7 rounded-md ${
            hasNotes 
              ? "bg-gray-100 border border-gray-200 hover:bg-gray-200" 
              : "bg-white border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {hasNotes ? <PenLine className="h-3.5 w-3.5 text-gray-700" /> : <StickyNote className="h-3.5 w-3.5 text-gray-600" />}
          <span className="text-xs font-medium text-gray-700">{hasNotes ? "Edit QC Notes" : "Add QC Notes"}</span>
          {hasNotes && (
            <Badge 
              variant="info" 
              className="w-2 h-2 p-0 absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-gray-500"
            />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto px-6 py-6">
        <DialogHeader className="pb-2 border-b mb-4">
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <StickyNote className="h-5 w-5 text-gray-500" />
            Quality Control Notes
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Textarea 
            placeholder="Add your QC notes here..."
            className="min-h-[250px] mb-4 border-gray-200 focus-visible:border-gray-300 focus-visible:ring-0"
            value={qcNotes}
            onChange={(e) => setQcNotes(e.target.value)}
            // Removed any autoFocus prop or autofocus HTML attribute
          />
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSaveQcNotes} 
            disabled={isSaving}
            className="w-full gap-2 bg-gray-800 hover:bg-gray-900 text-white"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
