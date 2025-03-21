
import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { EditUserDialog } from "./EditUserDialog";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Search, UserCog, UserX } from "lucide-react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserPagination } from "./UserPagination";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const UserList = () => {
  const { 
    users, 
    isLoading, 
    error, 
    updateUserRole, 
    updateUserStatus,
    refetch,
    pagination,
    setPage,
    setPageSize,
    filter,
    setFilter
  } = useUserManagement();
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<any>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilter({...filter, search: searchTerm});
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    setFilter({...filter, showInactive});
  }, [showInactive]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("User role updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      await updateUserStatus(userId, isActive);
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      setConfirmDeactivate(null);
      refetch();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(`Failed to ${isActive ? 'activate' : 'deactivate'} user`);
    }
  };

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            Error loading users: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="mr-2"
            />
            Show inactive users
          </label>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell>
                    <Skeleton className="h-5 w-[250px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[80px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-9 w-[100px] ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.full_name || 'No name'}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="billing_admin">Billing Admin</SelectItem>
                        <SelectItem value="qc_reviewer">QC Reviewer</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "outline"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedUser(user)}
                        title="Edit User"
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={user.is_active ? "ghost" : "default"}
                        size="icon"
                        onClick={() => setConfirmDeactivate(user)}
                        title={user.is_active ? "Deactivate User" : "Activate User"}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <UserPagination
          currentPage={pagination.page}
          pageCount={pagination.pageCount}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={refetch}
        />
      )}

      <Dialog open={!!confirmDeactivate} onOpenChange={(open) => !open && setConfirmDeactivate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDeactivate?.is_active ? "Deactivate User" : "Activate User"}
            </DialogTitle>
            <DialogDescription>
              {confirmDeactivate?.is_active 
                ? "Are you sure you want to deactivate this user? They will no longer be able to log in."
                : "Are you sure you want to activate this user? They will be able to log in again."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant={confirmDeactivate?.is_active ? "destructive" : "default"}
              onClick={() => handleStatusToggle(
                confirmDeactivate.id, 
                !confirmDeactivate.is_active
              )}
            >
              {confirmDeactivate?.is_active ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
