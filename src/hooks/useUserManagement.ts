
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserFilter {
  search: string;
  showInactive: boolean;
}

interface UserPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export const useUserManagement = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<UserFilter>({
    search: "",
    showInactive: false,
  });
  
  const [pagination, setPagination] = useState<UserPagination>({
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0,
  });

  const fetchUsers = async () => {
    const { from, to } = getPaginationRange();
    
    let query = supabase
      .from("user_profiles")
      .select("id, full_name, email, role, is_active, created_at", { count: "exact" });

    // Apply search filter if present
    if (filter.search) {
      query = query.or(`full_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%`);
    }

    // Apply active/inactive filter
    if (!filter.showInactive) {
      query = query.eq("is_active", true);
    }

    // Apply pagination
    query = query.range(from, to).order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get user emails from auth schema
    const userIds = data.map(user => user.id);
    let userEmails: Record<string, string> = {};
    
    if (userIds.length > 0) {
      try {
        // This is a simplified approach - in a real app you might need to use a function
        // that has the proper permissions to access auth.users
        const { data: authUsers } = await supabase
          .rpc('get_user_emails', { user_ids: userIds });
        
        if (authUsers) {
          userEmails = authUsers.reduce((acc: Record<string, string>, user: any) => {
            acc[user.id] = user.email;
            return acc;
          }, {});
        }
      } catch (error) {
        console.error("Error fetching user emails:", error);
      }
    }

    // Merge profile data with emails
    const usersWithEmail = data.map(user => ({
      ...user,
      email: userEmails[user.id] || 'No email available',
    }));

    // Update pagination data
    if (count !== null) {
      setPagination(prev => ({
        ...prev,
        total: count,
        pageCount: Math.ceil(count / pagination.pageSize),
      }));
    }

    return usersWithEmail;
  };

  const getPaginationRange = () => {
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    return { from, to };
  };

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users', filter, pagination.page, pagination.pageSize],
    queryFn: fetchUsers,
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({ role })
        .eq("id", userId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({ is_active: isActive })
        .eq("id", userId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Set current page
  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Set page size
  const setPageSize = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };

  const updateUserRole = (userId: string, role: string) => {
    return updateUserRoleMutation.mutateAsync({ userId, role });
  };

  const updateUserStatus = (userId: string, isActive: boolean) => {
    return updateUserStatusMutation.mutateAsync({ userId, isActive });
  };

  return {
    users: data,
    isLoading,
    error,
    updateUserRole,
    updateUserStatus,
    refetch,
    pagination,
    setPage,
    setPageSize,
    filter,
    setFilter,
  };
};
