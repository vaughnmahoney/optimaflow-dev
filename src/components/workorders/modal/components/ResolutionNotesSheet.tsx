
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

interface ResolutionNotesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  initialNotes?: string;
}

export const ResolutionNotesSheet = ({ 
  isOpen, 
  onClose, 
  workOrderId, 
  initialNotes = "" 
}: ResolutionNotesSheetProps) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateWorkOrderResolutionNotes } = useNotesMutations();

  const handleSubmit = async () => {
    if (!workOrderId) return;
    
    setIsSubmitting(true);
    try {
      await updateWorkOrderResolutionNotes(workOrderId, notes);
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
