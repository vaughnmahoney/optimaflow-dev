
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, CreateUserData, UpdateUserRoleData, UpdateUserStatusData } from "@/types/user";

// Fetch users with pagination and filtering
export const useUsers = (page = 1, pageSize = 10, search = "", showInactive = false) => {
  return useQuery({
    queryKey: ["users", page, pageSize, search, showInactive],
    queryFn: async () => {
      const startIndex = (page - 1) * pageSize;
      
      // Get total count with filters
      let countQuery = supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });
        
      // Apply search filter if provided
      if (search) {
        countQuery = countQuery.ilike("full_name", `%${search}%`);
      }
      
      // Apply active status filter
      if (!showInactive) {
        countQuery = countQuery.eq("is_active", true);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      // Get users for current page with same filters
      let query = supabase
        .from("user_profiles")
        .select("id, full_name, role, created_at, is_active");
        
      // Apply same filters as count query
      if (search) {
        query = query.ilike("full_name", `%${search}%`);
      }
      
      if (!showInactive) {
        query = query.eq("is_active", true);
      }
      
      const { data, error } = await query
        .range(startIndex, startIndex + pageSize - 1)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      // Get user emails from auth function
      const userIds = data.map(user => user.id);
      
      if (userIds.length > 0) {
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          "get-user-emails",
          {
            body: { user_ids: userIds }
          }
        );
        
        if (emailError) throw emailError;
        
        // Map emails to users
        const userMap = (emailData as any[]).reduce((acc, item) => {
          acc[item.id] = item.email;
          return acc;
        }, {} as Record<string, string>);
        
        // Combine data
        const usersWithEmails = data.map(user => ({
          ...user,
          email: userMap[user.id] || "Unknown",
          user_role: user.role // Map role to user_role for backward compatibility
        }));
        
        return {
          users: usersWithEmails as User[],
          totalCount: count || 0
        };
      }
      
      return {
        users: data.map(user => ({
          ...user,
          email: "Unknown",
          user_role: user.role // Map role to user_role for backward compatibility
        })) as User[],
        totalCount: count || 0
      };
    }
  });
};

// Create user
export const useUserCreation = () => {
  const queryClient = useQueryClient();
  
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const { data, error } = await supabase.rpc('create_user', {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        role: userData.user_role
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });
  
  return {
    createUser: createUserMutation.mutateAsync
  };
};

// Update user role
export const useUserRoleUpdate = () => {
  const queryClient = useQueryClient();
  
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: UpdateUserRoleData) => {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({ role })
        .eq("id", id);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });
  
  return {
    updateUserRole: updateRoleMutation.mutateAsync
  };
};

// Update user active status
export const useUserStatusUpdate = () => {
  const queryClient = useQueryClient();
  
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: UpdateUserStatusData) => {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({ is_active })
        .eq("id", id);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });
  
  return {
    updateUserStatus: updateStatusMutation.mutateAsync
  };
};

// Combined hook for UserList component
export const useUserList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState({ search: "", showInactive: false });
  
  const { data, isLoading, error, refetch } = useUsers(
    page, 
    pageSize, 
    filter.search, 
    filter.showInactive
  );
  
  const { updateUserRole } = useUserRoleUpdate();
  const { updateUserStatus } = useUserStatusUpdate();
  
  const pagination = {
    page,
    pageSize,
    pageCount: data ? Math.ceil(data.totalCount / pageSize) : 0,
    total: data?.totalCount || 0
  };
  
  return {
    users: data?.users || [],
    isLoading,
    error,
    pagination,
    filter,
    setFilter,
    setPage,
    setPageSize,
    updateUserRole: async (userId: string, newRole: string) => {
      return updateUserRole({ id: userId, role: newRole as UserRole });
    },
    updateUserStatus: async (userId: string, isActive: boolean) => {
      return updateUserStatus({ id: userId, is_active: isActive });
    },
    refetch
  };
};
