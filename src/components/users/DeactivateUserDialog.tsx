
import { useState } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  full_name: string;
}

interface DeactivateUserDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUserDeactivated: () => void;
}

export function DeactivateUserDialog({ 
  user, 
  isOpen, 
  onClose, 
  onUserDeactivated 
}: DeactivateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deactivateUser } = useUserManagement();
  const { toast } = useToast();

  const handleDeactivate = async () => {
    setIsSubmitting(true);
    
    try {
      await deactivateUser(user.id);
      onUserDeactivated();
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error("Failed to deactivate user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Deactivate User</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate user <strong>{user.username}</strong> ({user.full_name})?
            This user will no longer be able to access the system.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeactivate}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deactivating..." : "Deactivate User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
