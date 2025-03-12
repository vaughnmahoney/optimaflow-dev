
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrder } from "../../types";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="custom" 
          size="sm" 
          className={`relative gap-1 px-2 py-1 h-7 rounded-md ${
            hasNotes 
              ? "bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200" 
              : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
          }`}
        >
          {hasNotes ? <PenLine className="h-3.5 w-3.5" /> : <StickyNote className="h-3.5 w-3.5" />}
          <span className="text-xs font-medium">{hasNotes ? "Edit Notes" : "Add Notes"}</span>
          {hasNotes && (
            <Badge 
              variant="info" 
              className="w-2 h-2 p-0 absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-purple-500"
            />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-w-md mx-auto rounded-t-lg h-[450px]">
        <SheetHeader className="pb-2 border-b mb-4">
          <SheetTitle className="flex items-center gap-2 text-purple-700">
            <StickyNote className="h-5 w-5 text-purple-500" />
            Quality Control Notes
          </SheetTitle>
        </SheetHeader>
        <div className="py-2">
          <Textarea 
            placeholder="Add your QC notes here..."
            className="min-h-[250px] mb-4 border-purple-200 focus:border-purple-400"
            value={qcNotes}
            onChange={(e) => setQcNotes(e.target.value)}
          />
        </div>
        <SheetFooter>
          <Button 
            onClick={handleSaveQcNotes} 
            disabled={isSaving}
            className="w-full gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
