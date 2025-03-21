
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types for user management
type UserRole = "admin" | "qc_reviewer" | "supervisor" | "billing_admin";

interface User {
  id: string;
  email: string;
  full_name: string;
  user_role: UserRole;
  created_at: string;
  last_sign_in_at: string | null;
  is_active: boolean;
}

interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  user_role: UserRole;
}

interface UpdateUserRoleData {
  id: string;
  role: UserRole;
}

interface UpdateUserStatusData {
  id: string;
  is_active: boolean;
}

// Fetch users with pagination
export const useUsers = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["users", page, pageSize],
    queryFn: async () => {
      const startIndex = (page - 1) * pageSize;
      
      // Get total count
      const { count, error: countError } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });
      
      if (countError) throw countError;
      
      // Get users for current page
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, full_name, user_role, created_at, is_active")
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
          email: userMap[user.id] || "Unknown"
        }));
        
        return {
          users: usersWithEmails as User[],
          totalCount: count || 0
        };
      }
      
      return {
        users: data as User[],
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
        user_role: userData.user_role as "admin" | "qc_reviewer" | "supervisor" | "billing_admin"
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
        .update({ user_role: role })
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
