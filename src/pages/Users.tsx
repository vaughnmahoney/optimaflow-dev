
import React from "react";
import { Layout } from "@/components/Layout";
import { UsersList } from "@/components/users/UsersList";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import { useUserManagement } from "@/hooks/useUserManagement";
import type { CreateUserParams } from "@/types/users";

const Users = () => {
  const { 
    users, 
    isLoadingUsers, 
    createUser, 
    isCreatingUser, 
    createDefaultAdmin,
    isCreatingDefaultAdmin,
    isCreateUserOpen,
    setIsCreateUserOpen 
  } = useUserManagement();

  const handleCreateUser = (userData: CreateUserParams) => {
    createUser(userData);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <UsersList 
          users={users} 
          isLoading={isLoadingUsers} 
          onCreateUser={() => setIsCreateUserOpen(true)}
          onCreateDefaultAdmin={() => createDefaultAdmin()}
        />
        
        <CreateUserForm 
          open={isCreateUserOpen} 
          onOpenChange={setIsCreateUserOpen}
          onSubmit={handleCreateUser}
          isSubmitting={isCreatingUser || isCreatingDefaultAdmin}
        />
      </div>
    </Layout>
  );
};

export default Users;
