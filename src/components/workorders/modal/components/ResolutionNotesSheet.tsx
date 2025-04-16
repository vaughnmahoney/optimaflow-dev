
import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription, 
  SheetFooter
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNotesMutations } from "@/hooks/mutations/useNotesMutations";
import { WorkOrder } from "../../../types/workOrder";

interface ResolutionNotesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  initialNotes?: string;
  workOrder?: WorkOrder; // Add support for passing the full workOrder
}

export const ResolutionNotesSheet = ({ 
  isOpen, 
  onClose, 
  workOrderId, 
  workOrder,
  initialNotes = "" 
}: ResolutionNotesSheetProps) => {
  const [notes, setNotes] = useState(initialNotes || workOrder?.resolution_notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateWorkOrderResolutionNotes } = useNotesMutations();

  const handleSubmit = async () => {
    // Use workOrderId from props, falling back to workOrder.id if available
    const id = workOrderId || (workOrder ? workOrder.id : null);
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateWorkOrderResolutionNotes(id, notes);
      onClose();
    } catch (error) {
      console.error("Error saving resolution notes:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Resolution Notes</SheetTitle>
          <SheetDescription>
            Add resolution details for this flagged order.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <Textarea
            className="min-h-[200px]"
            placeholder="Explain how this issue was resolved..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <SheetFooter className="mt-6">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Resolution'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
