
import { useState, useRef, useEffect } from "react";
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
  const mounted = useRef(true);
  
  // Track component mount state
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleDelete = async () => {
    if (!isOpen) return;
    setIsSubmitting(true);
    
    try {
      await deleteUser(user.id);
      
      if (mounted.current) {
        toast({
          title: "User deleted",
          description: `User ${user.username} has been deleted successfully.`,
        });
        
        // First close dialog to prevent state updates during unmounting
        onClose();
        
        // Use setTimeout to break the current execution stack
        // This helps avoid React state update conflicts
        setTimeout(() => {
          if (mounted.current) {
            onUserDeleted();
          }
        }, 10);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      if (mounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  // Separate handler for cancel to avoid accidental submission
  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Control dialog opening more carefully
  // Only pass onOpenChange when dialog can be safely closed
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={isSubmitting ? undefined : handleCancel}
    >
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
