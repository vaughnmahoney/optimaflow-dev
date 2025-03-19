
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, CreateUserParams, UserRole } from "@/types/users";

export const useUserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users...");
      
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("full_name");
      
      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      console.log("Fetched users:", data);
      return data as UserProfile[];
    },
  });

  // Create a new user
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserParams) => {
      console.log("Creating user with data:", userData);
      
      // First, create the user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });
      
      if (authError) {
        console.error("Error creating user in Auth:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("User creation failed - no user returned");
      }
      
      console.log("Created user in Auth:", authData.user);
      
      // Then create profile using the create_user function
      const { data: functionData, error: functionError } = await supabase
        .rpc("create_user", {
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
          role: userData.role
        });
      
      if (functionError) {
        console.error("Error creating user profile:", functionError);
        throw functionError;
      }
      
      console.log("Created user profile:", functionData);
      return authData.user.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "User created",
        description: "The user has been created successfully.",
      });
      setIsCreateUserOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update a user
  const updateUserMutation = useMutation({
    mutationFn: async (user: Partial<UserProfile> & { id: string }) => {
      console.log("Updating user:", user);
      
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          full_name: user.full_name,
          role: user.role,
          is_active: user.is_active,
        })
        .eq("id", user.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating user:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "User updated",
        description: "The user has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create default admin if no admin exists
  const createDefaultAdminMutation = useMutation({
    mutationFn: async () => {
      console.log("Creating default admin user...");
      
      // Create the admin user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: "admin@example.com",
        password: "demo123",
      });
      
      if (authError) {
        console.error("Error creating admin in Auth:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Admin creation failed - no user returned");
      }
      
      console.log("Created admin in Auth:", authData.user);
      
      // Then create admin profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: authData.user.id,
          full_name: "Admin User",
          role: "admin" as UserRole,
          is_active: true
        })
        .select()
        .single();
      
      if (profileError) {
        console.error("Error creating admin profile:", profileError);
        throw profileError;
      }
      
      console.log("Created admin profile:", profileData);
      return authData.user.id;
    },
    onSuccess: () => {
      toast({
        title: "Admin created",
        description: "The default admin account has been created successfully with email: admin@example.com and password: demo123",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    users,
    isLoadingUsers,
    createUser: createUserMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    updateUser: updateUserMutation.mutate,
    isUpdatingUser: updateUserMutation.isPending,
    createDefaultAdmin: createDefaultAdminMutation.mutate,
    isCreatingDefaultAdmin: createDefaultAdminMutation.isPending,
    isCreateUserOpen,
    setIsCreateUserOpen,
  };
};
