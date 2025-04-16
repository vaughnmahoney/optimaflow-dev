
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldAlert } from "lucide-react";
import { useNotesMutations } from "@/hooks/mutations/useNotesMutations";

interface SafetyNotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  initialNotes?: string;
  onNotesSaved?: () => void;
}

export const SafetyNotesDialog = ({
  isOpen,
  onClose,
  workOrderId,
  initialNotes = "",
  onNotesSaved
}: SafetyNotesDialogProps) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateWorkOrderSafetyNotes } = useNotesMutations();

  const handleSubmit = async () => {
    if (!workOrderId) return;
    
    setIsSubmitting(true);
    try {
      await updateWorkOrderSafetyNotes(workOrderId, notes);
      if (onNotesSaved) {
        onNotesSaved();
      }
      onClose();
    } catch (error) {
      console.error("Error saving safety notes:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-yellow-500" />
            Safety Notes
          </DialogTitle>
          <DialogDescription>
            Add safety information about this location for technicians to review before visits.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Textarea
            className="min-h-[150px]"
            placeholder="Enter safety notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Note: These notes will be visible to all technicians visiting this location.
          </p>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
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
              'Save Notes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
