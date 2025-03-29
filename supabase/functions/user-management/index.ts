
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAdminAccess } from "./auth.ts";
import { 
  createUser, 
  listUsers, 
  updateUser, 
  deleteUser,
  UserCreateData,
  UserListFilters
} from "./userService.ts";

// CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a standard error response with CORS headers
const createErrorResponse = (message: string, status: number = 400) => {
  console.error(`Error response: ${message} (${status})`);
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

// Create a standard success response with CORS headers
const createSuccessResponse = (data: any, meta: any = null) => {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...meta && { meta }
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
};

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
  console.log("Request received:", req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for CORS preflight");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Authorize the request and validate admin access
    const authResult = await validateAdminAccess(req.headers.get("Authorization"));
    
    if (authResult.error) {
      console.error("Authorization error:", authResult.error);
      return authResult.error;
    }
    
    const { supabaseAdmin } = authResult;

    // Parse request body
    let requestData: RequestData;
    try {
      requestData = await req.json();
      console.log("Request data:", JSON.stringify(requestData));
    } catch (error) {
      console.error("Error parsing request body:", error);
      return createErrorResponse("Invalid JSON in request body", 400);
    }

    const { action } = requestData;
    console.log("Processing action:", action);

    // Process based on action type
    switch (action) {
      case "create":
        if (!requestData.userData) {
          return createErrorResponse("Missing userData for create action", 400);
        }
        return await createUser(supabaseAdmin, requestData.userData);
      case "list":
        return await listUsers(supabaseAdmin, requestData.page, requestData.pageSize, requestData.filters);
      case "update":
        if (!requestData.userId) {
          return createErrorResponse("Missing userId for update action", 400);
        }
        return await updateUser(supabaseAdmin, requestData.userId, requestData.updates);
      case "delete":
        if (!requestData.userId) {
          return createErrorResponse("Missing userId for delete action", 400);
        }
        return await deleteUser(supabaseAdmin, requestData.userId);
      default:
        return createErrorResponse("Invalid action", 400);
    }
  } catch (error) {
    console.error("Error in user-management function:", error);
    return createErrorResponse(`Internal server error: ${error.message}`, 500);
  }
});
