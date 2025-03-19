
import React from "react";
import { UserPlus, Check, X, UserCheck, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { UserProfile, UserRole } from "@/types/users";

interface UsersListProps {
  users: UserProfile[] | undefined;
  isLoading: boolean;
  onCreateUser: () => void;
  onCreateDefaultAdmin: () => void;
}

export function UsersList({ users, isLoading, onCreateUser, onCreateDefaultAdmin }: UsersListProps) {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "supervisor":
        return "bg-blue-500";
      case "qc_reviewer":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <UserCog className="h-4 w-4 mr-1" />;
      case "supervisor":
        return <UserCheck className="h-4 w-4 mr-1" />;
      case "qc_reviewer":
        return <UserCheck className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const hasAdminUser = users?.some(user => user.role === "admin");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="flex gap-2">
          {!hasAdminUser && (
            <Button 
              variant="outline" 
              onClick={onCreateDefaultAdmin}
            >
              Create Default Admin
            </Button>
          )}
          <Button 
            onClick={onCreateUser}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="w-full flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !users?.length ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <h3 className="font-medium text-lg mb-2">No users found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first user.</p>
          <Button onClick={onCreateUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>
                    <Badge className={`flex items-center ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <span className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <X className="h-4 w-4 mr-1" />
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
