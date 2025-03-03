
# OptimaFlow API Integration Documentation

## 1. Overview

OptimaFlow integrates with OptimoRoute to manage HVAC service work orders through the following flow:

1. Technicians complete work orders in OptimoRoute
2. OptimaFlow fetches completed work orders via Edge Functions
3. Data is stored in Supabase and displayed in the QC dashboard
4. QC reviewers can approve/flag orders and manage their lifecycle

### Critical Data Flow Points
- Work order creation/updates via OptimoRoute API
- Image and signature storage
- Status management (pending_review → approved/flagged)
- Real-time updates and data synchronization

## 2. API Data Retrieval

### Edge Function Configuration
```typescript
// Constants for all OptimoRoute API calls
const baseUrl = 'https://api.optimoroute.com/v1'
const endpoints = {
  search: '/search_orders',
  completion: '/get_completion_details'
}
```

### Two-Step Fetching Process
Due to OptimoRoute API design, we use a two-step process to get complete work order data:

1. First, call `search_orders` to get basic order information and IDs by date range
2. Then, call `get_completion_details` with the retrieved order numbers to get images, signatures, etc.

Our `get-orders-with-completion` Edge Function handles this workflow automatically.

### Search Orders Response Structure
```json
{
  "id": "85514ce8ac8b12ece36fdda246efc04e",
  "data": {
    "id": "85514ce8ac8b12ece36fdda246efc04e",
    "date": "2025-02-17",
    "type": "T",
    "notes": "HATCH MECH IS BINDING FRM ROOF...",
    "orderNo": "1313975",
    "location": {
      "notes": "ILCWI2",
      "valid": true,
      "address": "1357 CAPITOL DRIVE, PEWAUKEE, WI, 53072",
      "latitude": 43.0861351,
      "longitude": -88.2313184,
      "locationNo": "48779",
      "locationName": "MENARDS #3143 PEWA"
    }
  },
  "scheduleInformation": {
    "distance": 44239,
    "driverName": "MW - Joe Shimeck",
    "stopNumber": 7,
    "travelTime": 729,
    "scheduledAt": "01:06",
    "driverSerial": "96"
  }
}
```

### Pagination with after_tag
The OptimoRoute API returns a maximum of 500 results per request. To retrieve more, pagination must be implemented using the `after_tag` parameter:

```json
{
  "success": true,
  "orders": [
    // Order data...
  ],
  "after_tag": "gAAAAABjGMzYTPcM2QlRwp69tNXXU7asLhGUXJ0SfZZfieAbi37z73cmyfhaoSHWiT8sJX2HnvLjvDTrK3l9TySz0vfWEkuzx6OYOkS4Qc37smFa2Q0t7WE="
}
```

**Important**: The API returns `after_tag` (snake_case) not `afterTag` (camelCase). When implementing pagination:
1. Extract the `after_tag` value from the response
2. Pass it as `after_tag` in the next request
3. Repeat until no more `after_tag` is returned in the response

### Completion Details Response Structure
```json
{
  "orders": [{
    "data": {
      "form": {
        "note": "Service Complete...",
        "images": [
          { "url": "..." }
        ],
        "signature": {
          "url": "..."
        }
      },
      "status": "success",
      "endTime": {
        "utcTime": "2025-02-22T23:16:53",
        "localTime": "2025-02-22T17:16:53",
        "unixTimestamp": 1740266213
      },
      "startTime": {
        "utcTime": "2025-02-22T22:18:54",
        "localTime": "2025-02-22T16:18:54",
        "unixTimestamp": 1740262734
      },
      "tracking_url": "https://order.is/zbehxt6p"
    },
    "orderNo": "1325219",
    "success": true
  }],
  "success": true
}
```

## 3. Edge Functions

### `bulk-get-orders`
This function calls the `search_orders` endpoint to retrieve basic order information by date range.

Request Body:
```json
{
  "startDate": "2025-02-01",
  "endDate": "2025-02-28"
}
```

### `get-orders-with-completion`
This function implements the two-step workflow:
1. First calls `search_orders` to get orders in the specified date range
2. Then calls `get_completion_details` with those order numbers
3. Combines both responses into a unified data structure

Request Body:
```json
{
  "startDate": "2025-02-01",
  "endDate": "2025-02-28", 
  "enablePagination": true,
  "afterTag": "gAAAAABjGMzYTPcM2QlRwp69tNXXU7asLhGUXJ0SfZZfieAbi37z73cmyfhaoSHWiT8s..." // Optional, for pagination
}
```

Response:
```json
{
  "success": true,
  "orders": [
    // Order data with completion details merged
  ],
  "totalCount": 25,
  "after_tag": "gAAAAABjGMzYTPcM2QlRwp69tNXXU7asLhGUXJ0SfZZfieAbi37z73cmyfhaoSHWiT8s...", // For pagination
  "searchResponse": { ... },
  "completionResponse": { ... }
}
```

## 4. Database Storage (Supabase)

### Work Orders Table Schema
```sql
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no TEXT,
    status TEXT DEFAULT 'pending',
    timestamp TIMESTAMPTZ DEFAULT now(),
    completion_response JSONB,
    search_response JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);
```

### Data Mapping Rules

| API Field | Supabase Field | Source | Notes |
|-----------|----------------|--------|-------|
| orderNo | order_no | Both | Primary identifier |
| data.status | status | completion_response | Enum: pending_review, approved, flagged |
| data.form.images | completion_response | get_completion_details | JSONB array of image URLs |
| data.location | search_response | search_orders | Location details |
| data.date | search_response | search_orders | Service date |
| scheduleInformation | search_response | search_orders | Driver and scheduling info |

### Image and Signature Storage
- Images from `completion_response` are accessible via URLs
- All images are stored in OptimoRoute's storage
- Signatures are treated similarly to images

### Work Order Statuses
```typescript
type WorkOrderStatus = 'pending' | 'pending_review' | 'approved' | 'flagged';

const STATUS_FLOW = {
  pending: ['pending_review'],
  pending_review: ['approved', 'flagged'],
  approved: ['flagged'],
  flagged: ['approved']
};
```

## 5. Frontend Display Logic

### Work Order List Component
```typescript
// Key data mapping in WorkOrderContent.tsx
const mappedWorkOrder = {
  id: order.id,
  order_no: order.order_no || 'N/A',
  status: order.status || 'pending_review',
  timestamp: order.timestamp,
  service_date: searchResponse?.data?.date,
  service_notes: searchResponse?.data?.notes,
  location: searchResponse?.data?.location,
  driver: {
    name: searchResponse?.scheduleInformation?.driverName,
    id: searchResponse?.scheduleInformation?.driverSerial
  },
  has_images: Boolean(completionResponse?.orders?.[0]?.data?.form?.images?.length)
};
```

### Status Badge Mapping
```typescript
const getVariant = (status: string) => {
  switch (status) {
    case "approved": return "success";
    case "pending_review": return "warning";
    case "flagged": return "destructive";
    default: return "default";
  }
};
```

## 6. Common Issues & Solutions

### Data Retrieval Issues
1. **Missing Images**
   - Check completion_response->orders[0]->data->form->images array
   - Verify OptimoRoute upload success
   - Ensure image URLs are still valid

2. **Invalid Timestamps**
   - Always use UTC for storage
   - Convert to local time only for display
   - Use date-fns for consistent formatting

### Status Update Flow
1. User clicks status action
2. Update Supabase work_orders table
3. Refresh work order list
4. Show success/error toast
5. Update image modal if open

## 7. Best Practices for Edits

### DO NOT:
- Modify the structure of completion_response or search_response JSONB
- Change existing status enum values
- Alter the work order timestamp handling

### ALWAYS:
- Check console logs for data structure
- Verify type definitions match actual data
- Use optional chaining for nested objects
- Add proper error handling for API calls

### Keyboard Shortcuts
```typescript
// Modal Navigation
'ArrowLeft' - Previous image
'ArrowRight' - Next image
'Alt + ArrowLeft' - Previous work order
'Alt + ArrowRight' - Next work order
'Ctrl/Cmd + A' - Approve work order
'Ctrl/Cmd + F' - Flag work order
'Escape' - Close modal
```

### Error Handling Best Practices
- Log all API errors with relevant context
- Include order number in error messages
- Handle network timeouts gracefully
- Implement retry logic for image loading

### Type Validation
```typescript
interface WorkOrder {
  id: string;
  order_no: string;
  status: string;
  timestamp: string;
  service_date?: string;
  service_notes?: string;
  location?: WorkOrderLocation;
  has_images?: boolean;
  completion_response?: CompletionResponse;
  search_response?: SearchResponse;
}
```

## 8. Required Validations

### Before Deployment:
1. Verify OptimoRoute API responses match expected structure
2. Confirm all required fields are present in work_orders table
3. Test status updates and image display
4. Validate timestamp handling across timezones

### Monitoring:
- Watch Edge Function logs for API errors
- Monitor work order processing times
- Track failed status updates
- Log image loading failures

## 9. OptimoRoute API Rate Limits

### Limits
- Maximum 10 requests per second
- 10,000 requests per day per endpoint
- 5MB maximum payload size
- Maximum 500 orders per request (use pagination with `after_tag` for more)

### Error Codes
```typescript
const API_ERROR_CODES = {
  400: 'Invalid request parameters',
  401: 'Authentication failed',
  403: 'API key lacks permission',
  404: 'Order not found',
  429: 'Rate limit exceeded',
  500: 'OptimoRoute server error'
};
```

### Retry Strategy
- Implement exponential backoff
- Maximum 3 retry attempts
- Handle rate limits with queuing

## 10. Performance Considerations

### Edge Function Optimization
- Cache frequent lookups
- Batch API requests when possible
- Monitor execution times

### Frontend Performance
- Lazy load images
- Implement virtual scrolling for large lists
- Cache completed work order data

### Real-time Updates
- Poll for updates every 15 minutes
- Implement manual refresh option
- Show loading states during updates

---

**Note**: This document should be referenced before any modifications to the API integration flow. All changes should be validated against the existing data structures and tested thoroughly before deployment.
