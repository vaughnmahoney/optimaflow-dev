
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
// search-optimoroute/index.ts
const baseUrl = 'https://api.optimoroute.com/v1'
const endpoints = {
  search: '/search_orders',
  completion: '/get_completion_details'
}
```

### Search Response Structure
```json
{
  "data": {
    "form": {
      "note": "Service Complete. Found compartment panel off RTU7...",
      "images": [
        { "url": "..." }
      ],
      "signature": {
        "url": "..."
      }
    },
    "status": "success",
    "endTime": {
      "utcTime": "2025-02-20T20:55:08",
      "localTime": "2025-02-20T14:55:08",
      "unixTimestamp": 1740084908
    },
    "startTime": {
      "utcTime": "2025-02-20T18:47:39",
      "localTime": "2025-02-20T12:47:39",
      "unixTimestamp": 1740077259
    },
    "tracking_url": "https://order.is/bmduhpzc"
  },
  "orderNo": "1313937",
  "success": true
}
```

### Location Data Structure
```json
{
  "notes": "ILCWI1",
  "valid": true,
  "address": "2315 BLUEMOUND ROAD, WAUKESHA, WI, 53186",
  "latitude": 43.0345143,
  "longitude": -88.1806101,
  "locationNo": "48895",
  "locationName": "MENARDS #3261 WAKA"
}
```

## 3. Database Storage (Supabase)

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

| OptimoRoute Field | Supabase Field | Notes |
|-------------------|----------------|-------|
| orderNo | order_no | Primary identifier |
| data.status | status | Enum: pending_review, approved, flagged |
| data.form.images | completion_response->data->form->images | JSONB array |
| data.location | search_response->data->location | JSONB object |

## 4. Frontend Display Logic

### Work Order List Component
```typescript
// Key data mapping in WorkOrderContent.tsx
const mappedWorkOrder = {
  id: order.id,
  order_no: order.order_no || 'N/A',
  status: order.status || 'pending_review',
  timestamp: order.timestamp,
  service_date: searchResponse?.data?.[0]?.date,
  service_notes: searchResponse?.data?.[0]?.notes,
  location: searchResponse?.data?.[0]?.location,
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

## 5. Common Issues & Solutions

### Data Retrieval Issues
1. **Missing Images**
   - Check completion_response->data->form->images array
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

## 6. Best Practices for Edits

### DO NOT:
- Modify the structure of completion_response or search_response JSONB
- Change existing status enum values
- Alter the work order timestamp handling

### ALWAYS:
- Check console logs for data structure
- Verify type definitions match actual data
- Use optional chaining for nested objects
- Add proper error handling for API calls

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
}
```

## 7. Required Validations

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

## 8. Future Considerations

1. Image optimization and caching
2. Batch processing for large order volumes
3. Automated status updates based on rules
4. Enhanced error recovery mechanisms

---

**Note**: This document should be referenced before any modifications to the API integration flow. All changes should be validated against the existing data structures and tested thoroughly before deployment.

