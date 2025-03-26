
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

interface DeleteUserDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUserDeleted: () => void;
}

export function DeleteUserDialog({ 
  user, 
  isOpen, 
  onClose, 
  onUserDeleted 
}: DeleteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteUser } = useUserManagement();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!isOpen) return; // Safeguard against calls when dialog is closed
    setIsSubmitting(true);
    
    try {
      await deleteUser(user.id);
      
      // Only proceed if we're still mounted and the dialog is still open
      toast({
        title: "User deleted",
        description: `User ${user.username} has been deleted successfully.`,
      });
      
      // First notify about successful deletion
      onUserDeleted();
      
      // Then close the dialog
      onClose();
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error("Failed to delete user:", error);
      setIsSubmitting(false); // Reset submitting state on error
    }
  };

  // Separate handler for cancel to avoid accidental submission
  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isSubmitting ? undefined : handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete user <strong>{user.username}</strong> ({user.full_name})?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
