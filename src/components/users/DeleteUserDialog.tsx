
import { useState } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

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
  const [serverError, setServerError] = useState<string | null>(null);
  const { deleteUser } = useUserManagement();

  const handleDelete = async () => {
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      await deleteUser(user.id);
      
      // Close first
      onClose();
      
      // Then notify parent of success (similar to CreateUserDialog pattern)
      onUserDeleted();
    } catch (error) {
      console.error("Failed to delete user:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setServerError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setServerError(null);
      onClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete user <strong>{user.username}</strong> ({user.full_name})?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {serverError && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Error deleting user</p>
              <p>{serverError}</p>
            </div>
          </div>
        )}
        
        <DialogFooter className="pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
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
