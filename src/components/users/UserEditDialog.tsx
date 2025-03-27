
import { useState, useEffect } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle } from "lucide-react";

interface User {
  id: string;
  username: string;
  full_name: string;
  role: "admin" | "lead";
}

interface UserEditDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function UserEditDialog({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdated 
}: UserEditDialogProps) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "lead">("lead");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const { updateUser } = useUserManagement();

  // Reset form when user prop changes or dialog opens
  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.full_name);
      setRole(user.role);
      setErrors({});
      setServerError(null);
      setIsSubmitting(false);
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
    
    if (!user || !validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      await updateUser(user.id, {
        fullName: fullName.trim(),
        role,
      });
      
      // First close the dialog
      onClose();
      
      // Then notify parent about the update (after dialog is closed)
      onUserUpdated();
    } catch (error) {
      console.error("Failed to update user:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setServerError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User: {user.username}</DialogTitle>
          <DialogDescription>
            Make changes to the user's profile information below.
          </DialogDescription>
        </DialogHeader>
        
        {serverError && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Error updating user</p>
              <p>{serverError}</p>
            </div>
          </div>
        )}
        
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
              onClick={handleClose}
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
