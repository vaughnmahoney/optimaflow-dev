
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrder } from "../../types";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { StickyNote, CircleDot } from "lucide-react";
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant={hasNotes ? "secondary" : "outline"} 
          size="sm" 
          className={`gap-2 relative ${hasNotes ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800" : ""}`}
        >
          <StickyNote className="h-4 w-4" />
          QC Notes
          {hasNotes && (
            <Badge 
              variant="info" 
              className="w-2 h-2 p-0 absolute -top-1 -right-1 flex items-center justify-center rounded-full"
            />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-w-md mx-auto rounded-t-lg h-[400px]">
        <SheetHeader>
          <SheetTitle>Quality Control Notes</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <Textarea 
            placeholder="Add QC notes here..."
            className="min-h-[200px] mb-2"
            value={qcNotes}
            onChange={(e) => setQcNotes(e.target.value)}
          />
        </div>
        <SheetFooter>
          <Button 
            onClick={handleSaveQcNotes} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
