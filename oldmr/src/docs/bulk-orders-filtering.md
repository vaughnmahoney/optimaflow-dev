
# Bulk Orders Filtering Documentation

## Problem
When fetching work orders from OptimoRoute via the API, we were receiving orders with statuses like `scheduled` and `on_route` that weren't relevant for our quality control process.

Additionally, we encountered timezone-related issues where orders selected for a specific date would sometimes be off by one day due to timezone differences between local browser time and UTC time used by the API.

## OptimoRoute Order Status Values
| Value | Description |
|-------|-------------|
| unscheduled | Order has not been scheduled |
| scheduled | Order has not been started yet |
| on_route | Driver is on their way to order location |
| servicing | Order is currently being serviced |
| success | Order was completed successfully |
| failed | Driver failed to complete the order |
| rejected | Order was rejected by the driver |
| cancelled | Order was cancelled by customer |

## Solution

### Status Filtering
The solution for status filtering was to explicitly limit the statuses we request from our Edge Function. This filtering happens in two places:

#### 1. Frontend Request (src/hooks/useBulkOrdersFetch.ts)
We modified the `fetchOrdersData` function to only request orders with the following statuses:
```typescript
validStatuses: ['success', 'failed', 'rejected'] // Only request these three statuses
```

#### 2. Backend Edge Function (supabase/functions/get-orders-with-completion/index.ts)
Our edge function accepts the `validStatuses` parameter and applies filtering:
```typescript
const { startDate, endDate, enablePagination, afterTag, allCollectedOrders = [], validStatuses = ['success', 'failed', 'rejected'] } = await req.json();
```

And later uses it with the filtering function:
```typescript
const filteredCurrentPageOrders = filterOrdersByStatus(mergedOrders, validStatuses);
```

#### Shared Filtering Logic (supabase/functions/_shared/optimoroute.ts)
The actual filtering is performed by the `filterOrdersByStatus` function:
```typescript
export function filterOrdersByStatus(orders: any[], validStatuses: string[] = ['success', 'failed', 'rejected']): any[] {
  // ... filtering implementation
}
```

### Timezone Handling
To resolve timezone issues, we implemented a consistent timezone handling strategy:

#### 1. Date Formatting (src/hooks/bulk-orders/useOrdersApi.ts)
We now use the `date-fns-tz` library to format dates in the UTC timezone:
```typescript
const formattedStartDate = formatInTimeZone(startDate, 'UTC', 'yyyy-MM-dd');
const formattedEndDate = formatInTimeZone(endDate, 'UTC', 'yyyy-MM-dd');
```

This ensures that regardless of the user's local timezone, the dates sent to the API are always in UTC, preventing the "off-by-one-day" issue that could occur near timezone boundaries.

#### 2. User Interface Improvements
The DateRangePicker component now displays the user's timezone and clarifies that dates are processed in UTC to help users understand the date handling.

## Debugging Process
1. Identified the issues: 
   - Unwanted order statuses appearing in results
   - Timezone-related date filtering inconsistencies
2. Examined the API request in `useBulkOrdersFetch.ts` and found we were explicitly requesting additional statuses
3. Confirmed the edge function was correctly using the provided status list for filtering
4. Modified the frontend to only request the three relevant statuses
5. Added proper timezone handling with the `date-fns-tz` library
6. Added debugging logs to track timezone conversion
7. Verified the fix by confirming orders are correctly filtered by date and status

## Future Considerations
- If requirements change, the valid statuses can be adjusted in `useBulkOrdersFetch.ts`. This gives us flexibility to add or remove statuses as needed without changing the edge function code.
- If additional timezone handling is needed for other date-related features, the same approach using `date-fns-tz` should be followed.
