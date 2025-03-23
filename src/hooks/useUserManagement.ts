
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  full_name: string;
  role: "admin" | "lead";
  is_active: boolean;
  created_at: string;
}

interface UserFilters {
  role?: "admin" | "lead";
  isActive?: boolean;
  search?: string;
}

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async (
    page = 1,
    pageSize = 10,
    filters: UserFilters = {}
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No authenticated session");
      }

      const response = await supabase.functions.invoke("user-management", {
        body: {
          action: "list",
          page,
          pageSize,
          filters,
        },
      });

      // Check if response or response.data is null or undefined
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      // Check if success property exists before accessing it
      if (response.data && response.data.success === false) {
        throw new Error(response.data.error || "Failed to fetch users");
      }

      setUsers(response.data.data || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error fetching users",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (userData: {
    username: string;
    password: string;
    fullName: string;
    role: "admin" | "lead";
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke("user-management", {
        body: {
          action: "create",
          userData,
        },
      });

      // Check if response or response.data is null or undefined
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      // Check if success property exists before accessing it
      if (response.data && response.data.success === false) {
        throw new Error(response.data.error || "Failed to create user");
      }

      return response.data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error creating user",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (
    userId: string,
    updates: {
      fullName?: string;
      role?: "admin" | "lead";
      isActive?: boolean;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke("user-management", {
        body: {
          action: "update",
          userId,
          updates,
        },
      });

      // Check if response or response.data is null or undefined
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      // Check if success property exists before accessing it
      if (response.data && response.data.success === false) {
        throw new Error(response.data.error || "Failed to update user");
      }

      return response.data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error updating user",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateUser = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke("user-management", {
        body: {
          action: "delete",
          userId,
        },
      });

      // Check if response or response.data is null or undefined
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      // Check if success property exists before accessing it
      if (response.data && response.data.success === false) {
        throw new Error(response.data.error || "Failed to deactivate user");
      }

      return response.data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error deactivating user",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    totalCount,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deactivateUser,
  };
}
