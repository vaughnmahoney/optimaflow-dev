
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SafetyNotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  initialNotes?: string;
  onNotesSaved: (notes: string) => void;
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

  const handleSave = async () => {
    if (!workOrderId) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ safety_notes: notes })
        .eq('id', workOrderId);
        
      if (error) throw error;
      
      toast.success(notes ? "Safety notes saved" : "Safety notes removed");
      onNotesSaved(notes);
      onClose();
    } catch (error: any) {
      console.error("Error saving safety notes:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Safety Notes</DialogTitle>
          <DialogDescription>
            Add or edit safety notes for this location. These notes will be visible to all technicians who service this location.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea 
            placeholder="Enter safety information here..." 
            className="min-h-[200px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Notes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
