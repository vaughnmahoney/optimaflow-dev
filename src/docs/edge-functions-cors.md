
# Edge Functions CORS Configuration Guide

## Problem
We encountered an issue where our edge functions were not accessible from the frontend application due to CORS (Cross-Origin Resource Sharing) errors. The specific error was:

```
Access to fetch at 'https://eijdqiyvuhregbydndnb.supabase.co/functions/v1/user-management' from origin 'https://preview-domain.lovable.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
```

This occurred because:
1. The edge function was missing proper CORS headers configuration
2. There was an import error where `createErrorResponse` and `createSuccessResponse` functions were not being exported from the shared CORS helper file

## Root Cause Analysis
The issue had two main components:

### 1. Missing Exports in Shared CORS File
The `supabase/functions/_shared/cors.ts` file was defining `corsHeaders` but not exporting the helper functions that other edge functions were attempting to import:
- `createErrorResponse`
- `createSuccessResponse`

### 2. Improper CORS Configuration
The edge functions were not properly handling preflight OPTIONS requests, which are critical for CORS to work correctly with complex requests (like those with custom headers or content types).

## Solution

We implemented the following changes:

### 1. Updated the Shared CORS Helper File
We added the missing helper functions to `supabase/functions/_shared/cors.ts`:

```typescript
// Define CORS headers for all edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create consistent error responses
export const createErrorResponse = (message: string, status: number = 400) => {
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

// Helper function to create consistent success responses
export const createSuccessResponse = (data: any, meta: any = {}) => {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...meta
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
```

### 2. Updated Import Statements
We made sure all edge functions were importing the CORS helpers correctly:

```typescript
import { corsHeaders, createErrorResponse, createSuccessResponse } from "../_shared/cors.ts";
```

### 3. Handling OPTIONS Requests
We ensured all edge functions properly handle OPTIONS requests with code like this:

```typescript
// Handle CORS preflight requests
if (req.method === "OPTIONS") {
  return new Response(null, {
    headers: corsHeaders,
  });
}
```

## Best Practices for Edge Functions

To avoid similar issues in the future, always follow these guidelines:

1. **Always Include CORS Headers**
   - Set `Access-Control-Allow-Origin` to either a specific origin or `'*'` for development
   - Include necessary headers in `Access-Control-Allow-Headers`
   - Export these headers from a shared file to maintain consistency

2. **Handle OPTIONS Requests**
   - Always include an OPTIONS handler at the top of your edge function
   - Return a 200 response with appropriate CORS headers

3. **Use Consistent Response Formatting**
   - Use helper functions like `createSuccessResponse` and `createErrorResponse` for standardization
   - Include appropriate status codes and content types

4. **Check Imports Before Deployment**
   - Verify that all imported functions are actually exported from their source files
   - Use TypeScript to catch these errors during development

5. **Testing Edge Functions**
   - Test edge functions directly with tools like cURL or Postman before integrating with the frontend
   - Include OPTIONS requests in your tests to verify CORS configuration

## Troubleshooting Guide

If you encounter CORS issues with edge functions:

1. **Check Network Tab**
   - Look for failed preflight (OPTIONS) requests
   - Check if the response contains the correct CORS headers

2. **Verify Edge Function Logs**
   - Check for any errors in the edge function execution
   - Look for import errors or runtime exceptions

3. **Test Direct API Calls**
   - Use cURL or Postman to call the edge function directly
   - Check the response headers for CORS configuration

4. **Common CORS Errors**
   - Missing `Access-Control-Allow-Origin` header
   - Missing response to OPTIONS request
   - Incorrect `Access-Control-Allow-Headers` configuration
   - Missing Content-Type header in responses

By following these guidelines and troubleshooting steps, we can avoid CORS issues in our edge functions and ensure smooth integration between our frontend and backend services.
