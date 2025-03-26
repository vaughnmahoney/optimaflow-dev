
import { useState, useEffect } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  full_name: string;
  role: "admin" | "lead";
}

interface EditUserDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function EditUserDialog({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdated 
}: EditUserDialogProps) {
  const [fullName, setFullName] = useState(user.full_name);
  const [role, setRole] = useState<"admin" | "lead">(user.role);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateUser } = useUserManagement();
  const { toast } = useToast();

  // Update form when user prop changes
  useEffect(() => {
    if (isOpen) {
      setFullName(user.full_name);
      setRole(user.role);
      setErrors({});
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOpen || !validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateUser(user.id, {
        fullName: fullName.trim(),
        role,
      });
      
      toast({
        title: "User updated",
        description: `User ${user.username} has been updated successfully.`,
      });
      
      // First notify about successful update
      onUserUpdated();
      
      // Then close the dialog
      onClose();
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error("Failed to update user:", error);
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
          <DialogTitle>Edit User: {user.username}</DialogTitle>
          <DialogDescription>
            Make changes to the user's profile information below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Role</Label>
            <RadioGroup 
              value={role} 
              onValueChange={(value) => setRole(value as "admin" | "lead")}
              className="flex gap-4"
              disabled={isSubmitting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="edit-admin" />
                <Label htmlFor="edit-admin" className="cursor-pointer">Admin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lead" id="edit-lead" />
                <Label htmlFor="edit-lead" className="cursor-pointer">Lead</Label>
              </div>
            </RadioGroup>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
