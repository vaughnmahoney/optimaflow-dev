
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  full_name: string;
  role: "admin" | "lead";
  created_at: string;
}

interface UserFilters {
  role?: "admin" | "lead";
  search?: string;
}

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isMounted = useRef(true);

  // Track component mount state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Safe state update functions that check if component is mounted
  const safeSetUsers = (data: User[]) => {
    if (isMounted.current) setUsers(data);
  };

  const safeSetTotalCount = (count: number) => {
    if (isMounted.current) setTotalCount(count);
  };

  const safeSetIsLoading = (loading: boolean) => {
    if (isMounted.current) setIsLoading(loading);
  };

  const safeSetError = (err: string | null) => {
    if (isMounted.current) setError(err);
  };

  const fetchUsers = async (
    page = 1,
    pageSize = 10,
    filters: UserFilters = {}
  ) => {
    if (!isMounted.current) return;
    
    safeSetIsLoading(true);
    safeSetError(null);

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

      // Check if component is still mounted before processing response
      if (!isMounted.current) return;

      // Check if response or response.data is null or undefined
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      // Check if success property exists before accessing it
      if (response.data && response.data.success === false) {
        throw new Error(response.data.error || "Failed to fetch users");
      }

      safeSetUsers(response.data.data || []);
      safeSetTotalCount(response.data.totalCount || 0);
    } catch (err) {
      if (!isMounted.current) return;
      
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      safeSetError(errorMessage);
      toast({
        title: "Error fetching users",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (isMounted.current) {
        safeSetIsLoading(false);
      }
    }
  };

  const createUser = async (userData: {
    username: string;
    password: string;
    fullName: string;
    role: "admin" | "lead";
  }) => {
    if (!isMounted.current) return null;
    
    safeSetIsLoading(true);
    safeSetError(null);

    try {
      const response = await supabase.functions.invoke("user-management", {
        body: {
          action: "create",
          userData,
        },
      });

      if (!isMounted.current) return null;

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
      if (!isMounted.current) return null;
      
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      safeSetError(errorMessage);
      toast({
        title: "Error creating user",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      if (isMounted.current) {
        safeSetIsLoading(false);
      }
    }
  };

  const updateUser = async (
    userId: string,
    updates: {
      fullName?: string;
      role?: "admin" | "lead";
    }
  ) => {
    if (!isMounted.current) return null;
    
    safeSetIsLoading(true);
    safeSetError(null);

    try {
      const response = await supabase.functions.invoke("user-management", {
        body: {
          action: "update",
          userId,
          updates,
        },
      });

      if (!isMounted.current) return null;

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
      if (!isMounted.current) return null;
      
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      safeSetError(errorMessage);
      toast({
        title: "Error updating user",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      if (isMounted.current) {
        safeSetIsLoading(false);
      }
    }
  };

  const deleteUser = async (userId: string) => {
    if (!isMounted.current) return null;
    
    safeSetIsLoading(true);
    safeSetError(null);

    try {
      const response = await supabase.functions.invoke("user-management", {
        body: {
          action: "delete",
          userId,
        },
      });

      if (!isMounted.current) return null;

      // Check if response or response.data is null or undefined
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      // Check if success property exists before accessing it
      if (response.data && response.data.success === false) {
        throw new Error(response.data.error || "Failed to delete user");
      }

      return response.data.data;
    } catch (err) {
      if (!isMounted.current) return null;
      
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      safeSetError(errorMessage);
      toast({
        title: "Error deleting user",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      if (isMounted.current) {
        safeSetIsLoading(false);
      }
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
    deleteUser,
  };
}
