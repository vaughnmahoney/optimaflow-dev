
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "@/components/user-management/UserList";
import { CreateUserForm } from "@/components/user-management/CreateUserForm";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const UserManagement = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          throw error;
        }
        
        setIsAdmin(data);
        
        if (!data) {
          toast.error("Access denied. Admin privileges required.");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Failed to verify admin privileges");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      checkAdminStatus();
    }
  }, [session, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have the required permissions to access this page.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="users">User List</TabsTrigger>
            <TabsTrigger value="create">Create User</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <UserList />
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4">
            <CreateUserForm />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserManagement;
