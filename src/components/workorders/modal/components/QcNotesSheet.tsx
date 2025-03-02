
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrder } from "../../types";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { StickyNote } from "lucide-react";

interface QcNotesSheetProps {
  workOrder: WorkOrder;
}

export const QcNotesSheet = ({ workOrder }: QcNotesSheetProps) => {
  const [qcNotes, setQcNotes] = useState(workOrder.qc_notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const { updateWorkOrderQcNotes } = useWorkOrderMutations();
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <StickyNote className="h-4 w-4" />
          QC Notes
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
