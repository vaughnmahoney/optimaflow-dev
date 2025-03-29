
import { createSuccessResponse, createErrorResponse } from "../_shared/cors.ts";

// Types for our user management operations
export interface UserCreateData {
  username: string;
  password: string;
  fullName: string;
  role: "admin" | "lead";
}

export interface UserListFilters {
  role?: "admin" | "lead";
  search?: string;
}

export interface UserUpdateData {
  userId: string;
  fullName?: string;
  role?: "admin" | "lead";
}

// Handle user creation
export async function createUser(supabase: any, userData: UserCreateData): Promise<Response> {
  if (!userData) {
    return createErrorResponse("Missing user data");
  }

  const { username, password, fullName, role } = userData;

  // Validate required fields
  if (!username || !password || !fullName || !role) {
    return createErrorResponse("Missing required fields");
  }

  // Validate role
  if (role !== "admin" && role !== "lead") {
    return createErrorResponse("Invalid role");
  }

  try {
    // Format username to email
    const email = `${username}@example.com`;

    // Create user in auth.users
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (createError) {
      return createErrorResponse(`Error creating user: ${createError.message}`);
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: newUser.user.id,
        full_name: fullName,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Attempt to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(newUser.user.id);
      return createErrorResponse(`Error creating user profile: ${profileError.message}`);
    }

    // Extract username from email
    const responseData = {
      ...profile,
      username
    };

    return createSuccessResponse(responseData);
  } catch (error) {
    console.error("Error in createUser:", error);
    return createErrorResponse(`Error creating user: ${error.message}`);
  }
}

// Handle listing users
export async function listUsers(
  supabase: any, 
  page: number = 1, 
  pageSize: number = 10, 
  filters: UserListFilters = {}
): Promise<Response> {
  try {
    // Start building the query
    let query = supabase
      .from("user_profiles")
      .select("id, full_name, role, created_at, updated_at", { count: "exact" });

    // Apply filters
    if (filters.role) {
      query = query.eq("role", filters.role);
    }

    if (filters.search) {
      query = query.ilike("full_name", `%${filters.search}%`);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute the query
    const { data: profiles, error, count } = await query;

    if (error) {
      return createErrorResponse(`Error listing users: ${error.message}`);
    }

    // Get auth user details (emails) for username extraction
    const userIds = profiles.map((profile: any) => profile.id);
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      return createErrorResponse(`Error fetching user details: ${authError.message}`);
    }

    // Create a map of userId to email
    const userEmailMap = new Map();
    authUsers.users.forEach((user: any) => {
      userEmailMap.set(user.id, user.email);
    });

    // Enhance profiles with username (from email)
    const enhancedProfiles = profiles.map((profile: any) => {
      const email = userEmailMap.get(profile.id) || "";
      const username = email.split("@")[0]; // Extract username part from email
      
      return {
        ...profile,
        username
      };
    });

    return createSuccessResponse(enhancedProfiles, {
      totalCount: count,
      page,
      pageSize
    });
  } catch (error) {
    console.error("Error in listUsers:", error);
    return createErrorResponse(`Error listing users: ${error.message}`);
  }
}

// Handle updating a user
export async function updateUser(supabase: any, userId: string, updates: any): Promise<Response> {
  if (!userId || !updates) {
    return createErrorResponse("Missing userId or updates");
  }

  try {
    const updateData: any = {};

    // Prepare user_profiles update data
    if (updates.fullName !== undefined) {
      updateData.full_name = updates.fullName;
    }

    if (updates.role !== undefined) {
      updateData.role = updates.role;
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update user_profiles table
    const { data: updatedProfile, error: profileError } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (profileError) {
      return createErrorResponse(`Error updating user profile: ${profileError.message}`);
    }

    // Get username from email
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const email = authUser?.user?.email || "";
    const username = email.split("@")[0];

    // Return updated profile with username
    return createSuccessResponse({
      ...updatedProfile,
      username
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    return createErrorResponse(`Error updating user: ${error.message}`);
  }
}

// Handle deleting a user completely
export async function deleteUser(supabase: any, userId: string): Promise<Response> {
  if (!userId) {
    return createErrorResponse("Missing userId");
  }

  try {
    // First delete the user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      return createErrorResponse(`Error deleting user profile: ${profileError.message}`);
    }

    // Then delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      return createErrorResponse(`Error deleting auth user: ${authError.message}`);
    }

    return createSuccessResponse({
      message: "User successfully deleted",
      userId
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return createErrorResponse(`Error deleting user: ${error.message}`);
  }
}
