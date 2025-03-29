import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createErrorResponse } from "../_shared/cors.ts";
import { validateAdminAccess } from "./auth.ts";
import { 
  createUser, 
  listUsers, 
  updateUser, 
  deleteUser,
  UserCreateData,
  UserListFilters
} from "./userService.ts";

// Types for our request data
type RequestData = {
  action: "create" | "list" | "update" | "delete";
  userData?: UserCreateData;
  page?: number;
  pageSize?: number;
  filters?: UserListFilters;
  userId?: string;
  updates?: any;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No content for OPTIONS request
      headers: corsHeaders,
    });
  }

  try {
    // Authorize the request and validate admin access
    const authResult = await validateAdminAccess(req.headers.get("Authorization"));
    
    if (authResult.error) {
      return new Response(
        JSON.stringify({ success: false, error: authResult.error.statusText }),
        { 
          status: authResult.error.status, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          }
        }
      );
    }
    
    const { supabaseAdmin } = authResult;

    // Parse request body
    const requestData: RequestData = await req.json();
    const { action } = requestData;

    let response;
    // Process based on action type
    switch (action) {
      case "create":
        response = await createUser(supabaseAdmin, requestData.userData!);
        break;
      case "list":
        response = await listUsers(supabaseAdmin, requestData.page, requestData.pageSize, requestData.filters);
        break;
      case "update":
        response = await updateUser(supabaseAdmin, requestData.userId!, requestData.updates);
        break;
      case "delete":
        response = await deleteUser(supabaseAdmin, requestData.userId!);
        break;
      default:
        response = createErrorResponse("Invalid action", 400);
        break;
    }

    // Ensure CORS headers are applied to every response
    if (response.headers) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    
    return response;
  } catch (error) {
    console.error("Error in user-management function:", error);
    return createErrorResponse(`Internal server error: ${error.message}`, 500);
  }
});
