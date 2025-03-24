
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createErrorResponse } from "../_shared/cors.ts";
import { validateAdminAccess } from "./auth.ts";
import { 
  createUser, 
  listUsers, 
  updateUser, 
  deactivateUser,
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
      headers: corsHeaders,
    });
  }

  try {
    // Authorize the request and validate admin access
    const authResult = await validateAdminAccess(req.headers.get("Authorization"));
    
    if (authResult.error) {
      return authResult.error;
    }
    
    const { supabaseAdmin } = authResult;

    // Parse request body
    const requestData: RequestData = await req.json();
    const { action } = requestData;

    // Process based on action type
    switch (action) {
      case "create":
        return createUser(supabaseAdmin, requestData.userData!);
      case "list":
        return listUsers(supabaseAdmin, requestData.page, requestData.pageSize, requestData.filters);
      case "update":
        return updateUser(supabaseAdmin, requestData.userId!, requestData.updates);
      case "delete":
        return deactivateUser(supabaseAdmin, requestData.userId!);
      default:
        return createErrorResponse("Invalid action", 400);
    }
  } catch (error) {
    console.error("Error in user-management function:", error);
    return createErrorResponse(`Internal server error: ${error.message}`, 500);
  }
});
