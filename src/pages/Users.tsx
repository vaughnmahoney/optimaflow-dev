
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { UserManagementContent } from "@/components/users/UserManagementContent";

const Users = () => {
  return (
    <Layout title="User Management">
      <UserManagementContent />
    </Layout>
  );
};

export default Users;
