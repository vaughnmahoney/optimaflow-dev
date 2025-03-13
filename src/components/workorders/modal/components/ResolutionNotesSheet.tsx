
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrder } from "../../types";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="custom" 
          size="sm" 
          className={`relative gap-1 px-2 py-1 h-7 rounded-md ${
            hasNotes 
              ? "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200" 
              : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
          }`}
        >
          {hasNotes ? <PenLine className="h-3.5 w-3.5" /> : <StickyNote className="h-3.5 w-3.5" />}
          <span className="text-xs font-medium">{hasNotes ? "Edit Resolution Notes" : "Add Resolution Notes"}</span>
          {hasNotes && (
            <Badge 
              variant="info" 
              className="w-2 h-2 p-0 absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-blue-500"
            />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto px-6 py-6">
        <DialogHeader className="pb-2 border-b mb-4">
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <StickyNote className="h-5 w-5 text-blue-500" />
            Resolution Notes
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Textarea 
            placeholder="Add notes about resolution decision..."
            className="min-h-[250px] mb-4 border-blue-200 focus-visible:border-blue-400 focus-visible:ring-0"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSaveResolutionNotes} 
            disabled={isSaving}
            className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
