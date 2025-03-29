import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";
import { corsHeaders, createErrorResponse } from "../_shared/cors.ts";

// Validates the user's authorization and ensures they are an admin
export async function validateAdminAccess(authHeader: string | null) {
  if (!authHeader) {
    return { 
      error: createErrorResponse("Missing authorization header", 401),
      supabase: null,
      user: null,
      supabaseAdmin: null
    };
  }

  // Create admin client for operations that require elevated privileges
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Extract token and create authenticated client
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    return {
      error: createErrorResponse("Unauthorized", 401),
      supabase: null,
      user: null,
      supabaseAdmin: null
    };
  }

  // Check if user is an admin
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !userProfile) {
    console.error("Error fetching user profile:", profileError);
    return {
      error: createErrorResponse("User profile not found", 404),
      supabase: null,
      user: null,
      supabaseAdmin: null
    };
  }

  if (userProfile.role !== "admin") {
    return {
      error: createErrorResponse("Admin access required", 403),
      supabase: null,
      user: null,
      supabaseAdmin: null
    };
  }

  return {
    error: null,
    supabase,
    user,
    supabaseAdmin
  };
}
