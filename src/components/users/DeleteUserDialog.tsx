
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
    setIsSubmitting(true);
    
    try {
      await deleteUser(user.id);
      onUserDeleted();
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error("Failed to delete user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            onClick={onClose}
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
