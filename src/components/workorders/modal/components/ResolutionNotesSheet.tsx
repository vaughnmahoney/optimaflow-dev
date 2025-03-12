
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrder } from "../../types";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { PenLine, StickyNote, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResolutionNotesSheetProps {
  workOrder: WorkOrder;
}

export const ResolutionNotesSheet = ({ workOrder }: ResolutionNotesSheetProps) => {
  const [resolutionNotes, setResolutionNotes] = useState(workOrder.resolution_notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const { updateWorkOrderResolutionNotes } = useWorkOrderMutations();
  const [isOpen, setIsOpen] = useState(false);
  
  // Reset notes when the workOrder changes
  useEffect(() => {
    setResolutionNotes(workOrder.resolution_notes || "");
  }, [workOrder.id, workOrder.resolution_notes]);

  const handleSaveResolutionNotes = async () => {
    setIsSaving(true);
    try {
      await updateWorkOrderResolutionNotes(workOrder.id, resolutionNotes);
      toast.success("Resolution notes saved successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving resolution notes:", error);
      toast.error("Failed to save resolution notes");
    } finally {
      setIsSaving(false);
    }
  };

  // Check if there are existing notes
  const hasNotes = workOrder.resolution_notes && workOrder.resolution_notes.trim().length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="custom" 
          size="sm" 
          className={`relative gap-1 px-2 py-1 h-7 rounded-md ${
            hasNotes 
              ? "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200" 
              : "bg-white text-red-600 border border-red-200 hover:bg-red-50"
          }`}
        >
          {hasNotes ? <PenLine className="h-3.5 w-3.5" /> : <StickyNote className="h-3.5 w-3.5" />}
          <span className="text-xs font-medium">{hasNotes ? "Edit Notes" : "Add Notes"}</span>
          {hasNotes && (
            <Badge 
              variant="info" 
              className="w-2 h-2 p-0 absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500"
            />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-w-md mx-auto rounded-t-lg h-[450px]">
        <SheetHeader className="pb-2 border-b mb-4">
          <SheetTitle className="flex items-center gap-2 text-red-700">
            <StickyNote className="h-5 w-5 text-red-500" />
            Resolution Notes
          </SheetTitle>
        </SheetHeader>
        <div className="py-2">
          <Textarea 
            placeholder="Add notes about resolution decision..."
            className="min-h-[250px] mb-4 border-red-200 focus-visible:border-red-400 focus-visible:ring-0"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
        </div>
        <SheetFooter>
          <Button 
            onClick={handleSaveResolutionNotes} 
            disabled={isSaving}
            className="w-full gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
