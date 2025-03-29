
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";

// CORS headers for responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a standard error response with CORS headers
const createErrorResponse = (message: string, status: number = 400) => {
  return new Response(
    JSON.stringify({
      success: false,
      error: message
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
};

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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      error: createErrorResponse("Missing Supabase environment variables", 500),
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

  try {
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
  } catch (err) {
    console.error("Error in validateAdminAccess:", err);
    return {
      error: createErrorResponse(`Server error during authentication: ${err.message}`, 500),
      supabase: null,
      user: null,
      supabaseAdmin: null
    };
  }
}
