
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types for our requests and responses
interface UserCreateData {
  username: string;
  password: string;
  fullName: string;
  role: "admin" | "lead";
}

interface UserListFilters {
  role?: "admin" | "lead";
  isActive?: boolean;
  search?: string;
}

interface UserUpdateData {
  userId: string;
  fullName?: string;
  role?: "admin" | "lead";
  isActive?: boolean;
}

interface UserDeleteData {
  userId: string;
}

type RequestData = {
  action: "create" | "list" | "update" | "delete";
  userData?: UserCreateData;
  page?: number;
  pageSize?: number;
  filters?: UserListFilters;
  userId?: string;
  updates?: Partial<Omit<UserUpdateData, "userId">>;
};

interface ResponseData {
  success: boolean;
  data?: any;
  error?: string;
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create Supabase client with the user's token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createErrorResponse("Missing authorization header", 401);
    }

    // Extract token and create authenticated client
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get current user and verify if admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Check if user is an admin by querying the user_profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      console.error("Error fetching user profile:", profileError);
      return createErrorResponse("User profile not found", 404);
    }

    if (userProfile.role !== "admin") {
      return createErrorResponse("Admin access required", 403);
    }

    // Parse request body
    const requestData: RequestData = await req.json();
    const { action } = requestData;

    // Process based on action type
    switch (action) {
      case "create":
        return handleCreateUser(supabaseAdmin, requestData);
      case "list":
        return handleListUsers(supabaseAdmin, requestData);
      case "update":
        return handleUpdateUser(supabaseAdmin, requestData);
      case "delete":
        return handleDeleteUser(supabaseAdmin, requestData);
      default:
        return createErrorResponse("Invalid action", 400);
    }
  } catch (error) {
    console.error("Error in user-management function:", error);
    return createErrorResponse(`Internal server error: ${error.message}`, 500);
  }
});

// Helper function to create error responses
function createErrorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Helper function to create success responses
function createSuccessResponse(data: any, additionalData: object = {}): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...additionalData,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Handle user creation
async function handleCreateUser(supabase: any, requestData: RequestData): Promise<Response> {
  const { userData } = requestData;

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
        is_active: true,
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
    console.error("Error in handleCreateUser:", error);
    return createErrorResponse(`Error creating user: ${error.message}`);
  }
}

// Handle listing users
async function handleListUsers(supabase: any, requestData: RequestData): Promise<Response> {
  const {
    page = 1,
    pageSize = 10,
    filters = {},
  } = requestData;

  try {
    // Start building the query
    let query = supabase
      .from("user_profiles")
      .select("id, full_name, role, is_active, created_at, updated_at", { count: "exact" });

    // Apply filters
    if (filters.role) {
      query = query.eq("role", filters.role);
    }

    if (filters.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
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
    console.error("Error in handleListUsers:", error);
    return createErrorResponse(`Error listing users: ${error.message}`);
  }
}

// Handle updating a user
async function handleUpdateUser(supabase: any, requestData: RequestData): Promise<Response> {
  const { userId, updates } = requestData;

  if (!userId || !updates) {
    return createErrorResponse("Missing userId or updates");
  }

  try {
    const updateData: any = {};
    let needsAuthUpdate = false;

    // Prepare user_profiles update data
    if (updates.fullName !== undefined) {
      updateData.full_name = updates.fullName;
    }

    if (updates.role !== undefined) {
      updateData.role = updates.role;
    }

    if (updates.isActive !== undefined) {
      updateData.is_active = updates.isActive;
      needsAuthUpdate = true;
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

    // Update auth.users if needed (for inactive status)
    if (needsAuthUpdate) {
      await supabase.auth.admin.updateUserById(userId, {
        ban_duration: updates.isActive ? "none" : "87600h", // If inactive, ban for 10 years (effectively permanent)
      });
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
    console.error("Error in handleUpdateUser:", error);
    return createErrorResponse(`Error updating user: ${error.message}`);
  }
}

// Handle deleting/deactivating a user
async function handleDeleteUser(supabase: any, requestData: RequestData): Promise<Response> {
  const { userId } = requestData;

  if (!userId) {
    return createErrorResponse("Missing userId");
  }

  try {
    // We don't actually delete users, just deactivate them
    const { data: updatedProfile, error: profileError } = await supabase
      .from("user_profiles")
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single();

    if (profileError) {
      return createErrorResponse(`Error deactivating user: ${profileError.message}`);
    }

    // Also ban the user in auth.users
    await supabase.auth.admin.updateUserById(userId, {
      ban_duration: "87600h", // Ban for 10 years (effectively permanent)
    });

    return createSuccessResponse({
      message: "User successfully deactivated",
      userId
    });
  } catch (error) {
    console.error("Error in handleDeleteUser:", error);
    return createErrorResponse(`Error deactivating user: ${error.message}`);
  }
}
