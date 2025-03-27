
import { useState, useCallback } from "react";
import { UserList } from "@/components/users/UserList";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UserManagementContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // Use useCallback to prevent unnecessary re-renders
  const handleUserCreated = useCallback(() => {
    // Show success toast first
    toast({
      title: "User created successfully",
      description: "The new user has been added to the system",
    });
    
    // Then trigger refresh using requestAnimationFrame to avoid potential UI glitches
    requestAnimationFrame(() => {
      setRefreshTrigger(prev => prev + 1);
    });
  }, [toast]);

  // Handle user updated event with useCallback
  const handleUserUpdated = useCallback(() => {
    // Show success toast first
    toast({
      title: "User updated successfully",
      description: "The user information has been updated",
    });
    
    // Then trigger refresh using requestAnimationFrame to avoid potential UI glitches
    requestAnimationFrame(() => {
      setRefreshTrigger(prev => prev + 1);
    });
  }, [toast]);

  // Handle user deleted event with useCallback
  const handleUserDeleted = useCallback(() => {
    // Show success toast first
    toast({
      title: "User deleted successfully",
      description: "The user has been removed from the system",
    });
    
    // Then trigger refresh using requestAnimationFrame to avoid potential UI glitches
    requestAnimationFrame(() => {
      setRefreshTrigger(prev => prev + 1);
    });
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their access permissions
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <CreateUserDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
        onUserCreated={handleUserCreated}
      />

      <UserList 
        refreshTrigger={refreshTrigger} 
        onUserUpdated={handleUserUpdated}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
}
