# Reporting KPIs Implementation Plan

This document outlines the plan for implementing various Key Performance Indicators (KPIs) and visualizations on the Reports page.

## Data Schema Reference

**`reports` Table Columns:**

```
id
org_id
order_no
status                 -- Internal status?
optimoroute_status     -- Status from OptimoRoute
scheduled_time
end_time
cust_name              -- Customer Name (Specific Store/Location ID)
cust_group             -- Customer Group (e.g., "Menards", "Dollar General")
tech_name              -- Technician/Driver Name
region
fetched_at
duration_seconds       -- Added in previous discussions, verify existence
```

**Note:** Based on user confirmation:
*   `tech_name` is the correct field for driver filtering.
*   `cust_name` is the specific customer/store identifier.
*   `cust_group` provides a higher-level grouping.
*   Filtering will use `tech_name`, `cust_group`, AND `cust_name` directly from this table, avoiding joins to `work_orders` for filtering.

## Page Layout Strategy & Shared State

*   **Layout:** A Tabbed interface will be used to organize the KPIs and charts into logical sections (e.g., Overview, Driver Performance, Efficiency, Data Quality). This prevents information overload on a single view.
*   **Date Control:** A single, primary Date Picker component will be placed prominently.
*   **Global Filters:** Driver (`tech_name`), Customer Group (`cust_group`), and Customer Name (`cust_name`) multi-select filters will be placed alongside the Date Picker.
*   **Shared State:** Central state in `reports.tsx` will manage:
    *   `chartSelectedDate: string | null` (for the date picker)
    *   `selectedDrivers: string[]` (for `tech_name` filter)
    *   `selectedCustomerGroups: string[]` (for `cust_group` filter)
    *   `selectedCustomerNames: string[]` (for `cust_name` filter)
    *   These states will be passed down to all relevant components and hooks.
*   **Component Refactor:** Existing/planned components with their own date pickers will be refactored to accept the date as a prop.

## Global Filtering Strategy

*   **Goal:** Allow filtering data across all tabs by selected Drivers (`tech_name`), Customer Groups (`cust_group`), AND Customer Names (`cust_name`).
*   **UI:** Place *three* multi-select comboboxes near the Date Picker:
    *   `DriverFilter.tsx` (for `tech_name`)
    *   `CustomerGroupFilter.tsx` (for `cust_group`)
    *   `CustomerNameFilter.tsx` (for `cust_name`)
*   **State:** Use `selectedDrivers`, `selectedCustomerGroups`, and `selectedCustomerNames` state arrays in `reports.tsx`.
*   **Filter Options:** A new hook (`useReportFilterOptions.ts`) will fetch distinct values for all three fields from the `reports` table to populate the filter dropdowns.
    *   RPC/Query: Fetch distinct `tech_name`, `cust_group`, `cust_name`.
    *   Output: `{ availableDrivers: string[], availableCustomerGroups: string[], availableCustomerNames: string[], isLoading, error }`.
*   **Hook Impact:** **ALL** data fetching hooks (`useCompletionRate`, `useTotalCompletedJobs`, etc.) **MUST** be updated to:
    *   Accept `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, and `selectedCustomerNames: string[]` as parameters.
    *   Modify their underlying SQL queries/RPCs to conditionally add `WHERE` clauses for all three, if the arrays are not empty:
        *   `... WHERE r.end_time >= start_iso AND r.end_time < end_iso`
        *   `[AND r.tech_name = ANY($drivers_array)]`
        *   `[AND r.cust_group = ANY($groups_array)]`
        *   `[AND r.cust_name = ANY($names_array)]`
*   **Performance:** Indexing `reports.tech_name`, `reports.cust_group`, `reports.cust_name`, and `reports.end_time` is crucial. Avoiding joins for filtering is a performance benefit.

## KPI Sections

### 1. Overview & Completion Performance

*   **KPI:** Completion Rate
    *   **Description:** Percentage of jobs successfully completed.
    *   **Data:** `reports.optimoroute_status`.
    *   **Calculation:** `COUNT(CASE WHEN optimoroute_status = 'Success' THEN 1 END) / Total Jobs Attempted in Period`
    *   **Granularity:** Daily, Weekly, Monthly.
    *   **Implementation Plan (KPI Card):**
        *   **Goal:** Display completion rate for the period.
        *   **Component (`KpiCard.tsx` - Reusable):**
            *   Props: `title="Completion Rate"`, `value="{percentage}%"`, `description="Successful jobs in period"`, `isLoading`, `error`.
        *   **Data Hook (`src/hooks/useCompletionRate.ts` - New):**
            *   Input: `date: string | null`, `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, `selectedCustomerNames: string[]`.
            *   Logic (RPC Recommended or Direct Query):
                *   Define RPC `get_completion_rate(start_iso, end_iso, drivers_array, groups_array, names_array)`.
                *   SQL: `SELECT COUNT(CASE WHEN optimoroute_status = 'Success' THEN 1 END) as total_success, COUNT(*) as total_attempted FROM reports r WHERE r.end_time >= start_iso AND r.end_time < end_iso [AND r.tech_name = ANY($drivers_array)] [AND r.cust_group = ANY($groups_array)] [AND r.cust_name = ANY($names_array)];`
                *   Hook calls RPC/query.
            *   Output: `{ completionRate: number | null, isLoading: boolean, error: string | null }`.
        *   **Integration (`src/pages/reports.tsx`):
            *   Instantiate hook using shared `chartSelectedDate` and all three filter states.
            *   Render `<KpiCard />` passing data from hook.

*   **KPI:** Total Jobs Completed
    *   **Description:** Total count of successfully completed jobs.
    *   **Data:** `reports.optimoroute_status`.
    *   **Calculation:** `COUNT(*)`
    *   **Granularity:** Per Period.
    *   **Implementation Plan (KPI Card):**
        *   **Goal:** Display total successful jobs for the period.
        *   **Component (`KpiCard.tsx` - Reusable):**
            *   Props: `title="Total Jobs Completed"`, `value="{count}"`, `description="Successful jobs in period"`, `isLoading`, `error`.
        *   **Data Hook (`src/hooks/useTotalCompletedJobs.ts` - New):**
            *   Input: `date: string | null`, `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, `selectedCustomerNames: string[]`.
            *   Logic (RPC Recommended or Direct Query):
                *   Define RPC `get_total_completed_jobs(start_iso, end_iso, drivers_array, groups_array, names_array)`.
                *   SQL: `SELECT COUNT(*) as total_completed FROM reports r WHERE r.end_time >= start_iso AND r.end_time < end_iso AND r.optimoroute_status = 'Success' [AND r.tech_name = ANY($drivers_array)] [AND r.cust_group = ANY($groups_array)] [AND r.cust_name = ANY($names_array)];`
                *   Hook calls RPC/query.
            *   Output: `{ count: number | null, isLoading: boolean, error: string | null }`.
        *   **Integration (`src/pages/reports.tsx`):
            *   Instantiate hook using shared `chartSelectedDate` and all three filter states.
            *   Render `<KpiCard />` in the Overview tab.

*   **KPI:** Status Breakdown
    *   **Description:** Distribution of final job statuses (Success, Failed, Cancelled, etc.).
    *   **Data:** `reports.optimoroute_status`.
    *   **Calculation:** `COUNT(*) GROUP BY optimoroute_status`
    *   **Granularity:** Daily, Weekly, Monthly.
    *   **Implementation Plan (Pie Chart):**
        *   **Goal:** Display status distribution for the period.
        *   **Component (`src/components/reports/StatusBreakdownChart.tsx` - Existing):
            *   Use Recharts (`PieChart`, etc.) within a `Card`.
            *   UI: Pie chart with segments for each status, Tooltip.
            *   Props: `statusData: { status: string; count: number }[] | null`, `isLoading`, `error?`, `displayDate: string | null`.
            *   Handles loading/error states.
            *   Initially follows the shared date via `displayDate` prop for context.
        *   **Data Hook (`src/hooks/useReportStatusStats.ts` - Existing):
            *   Input: `date: string | null`, `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, `selectedCustomerNames: string[]`.
            *   Logic (Current client-side or RPC):
                *   If RPC: Define Supabase RPC `get_status_breakdown(start_iso, end_iso, drivers_array, groups_array, names_array)`.
                *   SQL: `SELECT optimoroute_status, COUNT(*) as count FROM reports r WHERE r.end_time >= start_iso AND r.end_time < end_iso [AND r.tech_name = ANY($drivers_array)] [AND r.cust_group = ANY($groups_array)] [AND r.cust_name = ANY($names_array)] GROUP BY optimoroute_status ORDER BY count DESC;`
                *   Hook calls RPC/query.
            *   Output: `{ statusData: Array<{ status: string; count: number }> | null, isLoading: boolean, error: string | null }`.
            *   Uses `useState`, `useEffect`.
        *   **Integration (`src/pages/reports.tsx`):
            *   Use lifted `chartSelectedDate` state.
            *   Instantiate hook: `useReportStatusStats(chartSelectedDate, selectedDrivers, selectedCustomerGroups, selectedCustomerNames)`.
            *   Render `<StatusBreakdownChart />` passing data from hook and `formattedChartDate` as `displayDate`.
        *   **User Flow (Shared Date & Filters):**
            *   Page loads, shared date/filter states are initialized (e.g., today, empty filters).
            *   User changes date via the primary Date Picker OR selects/deselects drivers/customers.
            *   Shared state updates, triggering re-renders.
            *   All active data hooks re-fetch data using the new shared state.
            *   All components update.
        *   **Date Sharing:** Use "Lift State Up" pattern for `chartSelectedDate`.
            *   Update `StatusBreakdownChart` to accept `date` prop and remove internal date picker.

*   **KPI:** Failure Reason Analysis
    *   **Description:** Breakdown of reasons provided for failed jobs.
    *   **Data:** `reports.optimoroute_status` (specific failure codes?), `reports.notes`?
    *   **Calculation:** Grouping/counting based on failure status or keyword analysis of notes.
    *   **Granularity:** Per Period, Per Driver.
    *   **Implementation Plan (List/Table):**
        *   **Goal:** List non-successful jobs and their reason (status/notes).
        *   **Component (`src/components/reports/FailureReasonList.tsx` - New):
            *   Use `Card` with `Table` or simple list (`ul`/`li`).
            *   UI: Columns/Items for Order #, Driver, Reason (Status/Note).
            *   Props: `failureData: { orderNo: string; driver: string | null; reason: string }[] | null`, `isLoading`, `error?`, `displayDate: string | null`.
            *   Handles loading/error states. Limit rows shown initially.
        *   **Data Hook (`src/hooks/useFailureReasons.ts` - New):
            *   Input: `date: string | null`, `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, `selectedCustomerNames: string[]`.
            *   Logic:
                *   Calculate date range (`startOfDayISO`, `startOfNextDayISO`).
                *   Query `reports r` table filtered by `end_time`.
                *   Filter `WHERE optimoroute_status IN ('Failed', ...)` (Define failure statuses).
                *   Select `order_no`, `tech_name` (as driver), `notes` (as reason).
                *   Apply filters: `[AND r.tech_name = ANY($drivers_array)] [AND r.cust_group = ANY($groups_array)] [AND r.cust_name = ANY($names_array)]`
            *   Output: `{ failureData: ... , isLoading, error }`.
            *   Uses `useState`, `useEffect`.
        *   **Integration (`src/pages/reports.tsx`):
            *   Use lifted `chartSelectedDate`.
            *   Instantiate hook: `useFailureReasons(chartSelectedDate, selectedDrivers, selectedCustomerGroups, selectedCustomerNames)`.
            *   Render `<FailureReasonList />` passing props from hook and `formattedChartDate` as `displayDate`.
        *   **Considerations:** Define "failure" statuses clearly. Notes are free text, just display them initially. Handle null drivers.
*   **KPI:** On-Time Performance
    *   **Description:** Percentage of jobs completed within a defined window of their scheduled time.
    *   **Data:** `reports.scheduled_time`, `reports.end_time`.
    *   **Calculation:** Compare `end_time` to `scheduled_time + acceptable_lateness_window`.
    *   **Granularity:** Daily, Weekly, Per Driver.
    *   **Implementation Plan (KPI Card):**
        *   **Goal:** Percentage of jobs completed within +/- X minutes of scheduled time.
        *   **Component (`KpiCard.tsx` - Reusable):**
            *   Use the generic KPI card.
            *   Props: `title="On-Time Performance"`, `value="{percentage}%"`, `description="Completed within +/- {X} min of schedule"`, `isLoading`, `error`.
        *   **Data Hook (`src/hooks/useOnTimePerformance.ts` - New):
            *   Input: `date: string | null`, `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, `selectedCustomerNames: string[]`, `onTimeWindowMinutes: number`.
            *   Dependencies: **CRITICAL** - Requires reliable/accurate `scheduled_time` and `end_time` timestamps. **Data Verification Required:** Examine `reports` table for `scheduled_time` presence and accuracy before implementation.
            *   Logic (RPC Recommended):
                *   Define RPC `get_on_time_performance(start_iso, end_iso, drivers_array, groups_array, names_array, window_minutes)`.
                *   SQL: Query `reports r`, filter by `end_time` range, filter `WHERE scheduled_time IS NOT NULL AND end_time IS NOT NULL`. Apply all three filters. Calculate `total_relevant = COUNT(*)` and `on_time_count = COUNT(*) WHERE end_time BETWEEN (scheduled_time - interval '{X} minutes') AND (scheduled_time + interval '{X} minutes')`. Return counts.
                *   Hook calls RPC, calculates percentage `(on_time_count / total_relevant) * 100`. Handle division by zero.
            *   Output: `{ onTimePercentage: number | null, isLoading: boolean, error: string | null }`.
        *   **Integration (`src/pages/reports.tsx`):
            *   Define `ON_TIME_WINDOW_MINUTES`. Instantiate hook using shared `chartSelectedDate` and all three filter states.
            *   Format percentage. Generate description string.
            *   Render `<KpiCard />`.
        *   **Critical Caveats:**
            *   **Data Quality:** If `scheduled_time` is unreliable/missing, this KPI is invalid. Verify data first.
            *   **Time Definition:** Assumes `scheduled_time` aligns with `end_time` concept (e.g., scheduled completion). Adjust SQL if it's a scheduled start time.
            *   **Window Size:** Choose a meaningful `onTimeWindowMinutes`.

### 2. Driver Performance

*   **KPI:** Jobs Completed per Driver
    *   **Description:** Total count of successfully completed jobs grouped by driver.
    *   **Data:** `reports.optimoroute_status`, `reports.tech_name` (assuming this is driver).
    *   **Visualization:** Bar Chart (Recharts).
    *   **Implementation Plan:**
        *   **Component (`src/components/reports/DriverCompletionChart.tsx` - New):
            *   Props: `chartData: { driver: string; completedJobs: number }[] | null`, `isLoading`, `error?`, `displayDate: string | null`.
            *   Handles loading/error states.
            *   Initially follows the shared date via `displayDate` prop for context.
        *   **Data Hook (`src/hooks/useDriverCompletions.ts` - New):
            *   Input: `date: string | null`, `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, `selectedCustomerNames: string[]`.
            *   Logic (RPC Recommended):
                *   Define Supabase RPC `get_driver_completions(start_iso, end_iso, drivers_array, groups_array, names_array)`.
                *   SQL: `SELECT tech_name as driver, COUNT(*) as completed_jobs FROM reports r WHERE r.end_time >= start_iso AND r.end_time < end_iso AND r.optimoroute_status = 'Success' AND r.tech_name IS NOT NULL [AND r.tech_name = ANY($drivers_array)] [AND r.cust_group = ANY($groups_array)] [AND r.cust_name = ANY($names_array)] GROUP BY driver ORDER BY completed_jobs DESC;` (Adjust based on verified fields)
                *   Hook calculates ISO range from input `date`, calls RPC.
            *   Output: `{ driverCompletions: Array<{ driver: string; completedJobs: number }> | null, isLoading: boolean, error: string | null }`.
            *   Uses `useState`, `useEffect`.
        *   **Integration (`src/pages/reports.tsx`):
            *   Use lifted `chartSelectedDate` state.
            *   Instantiate hook: `useDriverCompletions(chartSelectedDate, selectedDrivers, selectedCustomerGroups, selectedCustomerNames)`.
            *   Render `<DriverCompletionChart />` passing data from hook and `formattedChartDate` as `displayDate` in the Driver Performance tab.
        *   **User Flow (Shared Date & Filters):**
            *   Page loads, shared date/filter states are initialized (e.g., today, empty filters).
            *   User changes date via the primary Date Picker OR selects/deselects drivers/customers.
            *   Shared state updates, triggering re-renders.
            *   All active data hooks re-fetch data using the new shared state.
            *   All components update.

*   **KPI:** Driver Success Rate
    *   **Description:** Percentage of successful jobs out of total attempted jobs per driver.
    *   **Data:** `reports.optimoroute_status`, `reports.tech_name`.
    *   **Visualization:** Bar Chart (Recharts).
    *   **Implementation Plan:**
        *   **Component (`src/components/reports/DriverSuccessRateChart.tsx` - New):
            *   Props: `chartData: { driver: string; successRate: number }[] | null`, `isLoading`, `error?`, `displayDate: string | null`.
            *   Handles loading/error states.
        *   **Data Hook (`src/hooks/useDriverSuccessRate.ts` - New):
            *   Input: `date: string | null`, `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, `selectedCustomerNames: string[]`.
            *   Logic (RPC Recommended):
                *   Define RPC `get_driver_success_rates(start_iso, end_iso, drivers_array, groups_array, names_array)`.
                *   SQL: Query `reports r`, filter by date range, filter `WHERE tech_name IS NOT NULL`. Apply all three filters. `SELECT tech_name as driver, COUNT(*) as total_attempted, COUNT(CASE WHEN optimoroute_status = 'Success' THEN 1 END) as total_success FROM reports r ... GROUP BY driver;` Return `{ driver, total_attempted, total_success }`.
                *   Hook calls RPC. Map results: `rate = (total_success / total_attempted) * 100`. Handle division by zero.
            *   Output: `{ driverRates: Array<{ driver: string; successRate: number }> | null, isLoading: boolean, error: string | null }`.
        *   **Integration (`src/pages/reports.tsx`):
            *   Instantiate hook using shared `chartSelectedDate` and all three filter states.
            *   Render `<DriverSuccessRateChart />` passing data from hook in the Driver Performance tab.
*   **KPI:** Average Job Duration per Driver (Requires reliable `duration_seconds` or `start_time`/`end_time`)
    *   **Description:** Average time spent per completed job by each driver.
    *   **Data:** `reports.duration_seconds` or (`reports.start_time`, `reports.end_time`), `reports.tech_name`.
    *   **Visualization:** Bar Chart (Recharts).
    *   **Implementation Plan:**
        *   **Component (`src/components/reports/DriverAvgDurationChart.tsx` - New):
            *   Props: `chartData: { driver: string; avgDurationMinutes: number }[] | null`, `isLoading`, `error?`, `displayDate: string | null`.
            *   Handles loading/error states.
        *   **Data Hook (`src/hooks/useDriverAvgDuration.ts` - New):
            *   Input: `date: string | null`, `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, `selectedCustomerNames: string[]`.
            *   Dependencies: **CRITICAL** - Requires reliable `duration_seconds` OR both `start_time`/`end_time`. **Data Verification Required:** Examine `reports` table for `duration_seconds`, `start_time`, `end_time` presence and accuracy before implementation.
            *   Logic (RPC Recommended):
                *   Define RPC `get_driver_avg_durations(start_iso, end_iso, drivers_array, groups_array, names_array)`.
                *   SQL: Query `reports r`, filter date range, `WHERE tech_name IS NOT NULL AND optimoroute_status = 'Success' AND duration_seconds IS NOT NULL AND duration_seconds > 0`. Apply all three filters. `SELECT tech_name as driver, AVG(duration_seconds) as avg_duration_secs ... GROUP BY driver;` (Or use `AVG(EXTRACT(EPOCH FROM (end_time - start_time)))` if using timestamps).
                *   Hook calls RPC. Map results: Convert seconds to minutes.
            *   Output: `{ driverDurations: Array<{ driver: string; avgDurationMinutes: number }> | null, isLoading: boolean, error: string | null }`.
        *   **Integration (`src/pages/reports.tsx`):
            *   Instantiate hook using shared `chartSelectedDate` and all three filter states.
            *   Render `<DriverAvgDurationChart />` passing data from hook in the Driver Performance tab.
        *   **Critical Caveats:**
            *   **Data Quality:** If duration/timestamp data is unreliable/missing, this KPI is invalid. Verify data first.

### 3. Efficiency & Trends

*   **KPI:** Average Job Duration (Overall / By Service Type) (Requires reliable duration & `work_orders.service_type`)
    *   **Description:** Average time spent per completed job, overall and broken down by service type.
    *   **Data:** `reports.duration_seconds` or (`reports.start_time`, `reports.end_time`), join to `work_orders.service_type` via `order_no`.
    *   **Visualization:** KPI Card (Overall), Bar Chart (By Service Type).
    *   **Implementation Plan:**
        *   **Component:**
            *   Overall: Reusable `<KpiCard />` (`title="Avg. Job Duration (Overall)"`, `value="{minutes} min"`).
            *   By Type: `<ServiceTypeAvgDurationChart />` (New Bar Chart: X=Service Type, Y=Avg Duration).
        *   **Data Hook (`src/hooks/useAvgJobDuration.ts` - New):
            *   Input: `date: string | null`, `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, `selectedCustomerNames: string[]`.
            *   Dependencies: **CRITICAL** - Reliable duration data & `work_orders.service_type` linkable via `order_no`. **Data Verification Required:** Examine `reports` and `work_orders` tables for duration data, `service_type`, and `order_no` link integrity before implementation.
            *   Logic (RPC Recommended):
                *   Define RPC `get_avg_job_durations(start_iso, end_iso, drivers_array, groups_array, names_array)`.
                *   SQL: Join `reports r` & `work_orders wo`. Filter date range, `optimoroute_status = 'Success'`, `duration_seconds IS NOT NULL > 0`. Apply all three filters (on `r`). Calculate `AVG(duration_seconds)` overall. Calculate `AVG(duration_seconds)` grouped by `wo.service_type`.
                *   Return combined results: `{ overall_avg_secs, by_type: [{ service_type, avg_secs }] }`.
                *   Hook calls RPC, converts seconds to minutes.
            *   Output: `{ overallAvgMinutes: number | null, byType: Array<{ serviceType: string; avgMinutes: number }> | null, isLoading, error }`.
        *   **Integration (`src/pages/reports.tsx`):
            *   Instantiate hook using shared `chartSelectedDate` and all three filter states. Render `KpiCard` (overall) & `ServiceTypeAvgDurationChart` (by type) in the Efficiency tab.
        *   **Critical Caveats:** Data quality (duration, service type), join reliability.
*   **KPI:** Jobs Completed per Day/Week/Month
    *   **Description:** Trend of total completed jobs over time.
    *   **Data:** `reports.end_time`, `reports.optimoroute_status`.
    *   **Visualization:** Line Chart (Recharts).
    *   **Implementation Plan:**
        *   **Component (`src/components/reports/CompletionTrendChart.tsx` - New):
            *   Line Chart (Recharts) in a `Card`. X=Time, Y=Job Count.
            *   Props: `chartData: { date: string; completedJobs: number }[] | null`, `timeUnit`, `isLoading`, `error?`.
        *   **Data Hook (`src/hooks/useCompletionTrend.ts` - New):
            *   Input: `startDate`, `endDate`, `timeUnit`, `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, `selectedCustomerNames: string[]`.
            *   Logic (RPC Recommended):
                *   Define RPC `get_completion_trend(start_iso, end_iso, time_unit, drivers_array, groups_array, names_array)`.
                *   SQL: Query `reports r`. Filter date range, `optimoroute_status = 'Success'`. Apply all three filters. `SELECT DATE_TRUNC(time_unit, end_time)::date as period_start, COUNT(*) ... GROUP BY period_start ORDER BY period_start;`
                *   Return `{ period_start, completed_jobs }`.
                *   Hook calls RPC, formats date.
            *   Output: `{ trendData: Array | null, isLoading, error }`.
        *   **Integration (`src/pages/reports.tsx`):
            *   Instantiate hook using shared date range and all three filter states. Render `<CompletionTrendChart />` in the Efficiency tab.
*   **KPI:** Status Discrepancy (OptimoRoute vs. Internal)
    *   **Description:** Identifying orders where the final `reports.optimoroute_status` differs from the final `work_orders.status`.
    *   **Data:** `reports.optimoroute_status`, `reports.status`? or join `work_orders.status`.
    *   **Visualization:** KPI Card (Count), Optional Table (Details).
    *   **Implementation Plan:**
        *   **Component:**
            *   A: `<KpiCard />` (`title="Status Discrepancies"`, `value="{count}"`).
            *   B: `<DiscrepancyList />` (New Table: Order #, Report Status, WO Status, Date).
        *   **Data Hook (`src/hooks/useStatusDiscrepancy.ts` - New):
            *   Input: `date: string | null`, `selectedDrivers: string[]`, `selectedCustomerGroups: string[]`, `selectedCustomerNames: string[]`.
            *   Dependencies: **CRITICAL** - Reliable join & defined status mapping logic. **Data Verification Required:** Define and verify status mapping logic between `reports.optimoroute_status` and `work_orders.status` (or `reports.status`?) before implementation. Check join reliability if needed.
            *   Logic (RPC Recommended):
                *   Define RPC `get_status_discrepancies(start_iso, end_iso, drivers_array, groups_array, names_array)`.
                *   SQL: Join `reports r` & `work_orders wo` (if needed). Filter date range. Apply all three filters (on `r`). Compare final statuses: **`WHERE map_report_status(r.optimoroute_status) != map_wo_status(wo.status)`** (Requires SQL helper functions for mapping, or use `r.status` if applicable).
                *   Select details or just count.
                *   Return `{ discrepancyCount, discrepancyList: Array | null, isLoading, error }`.
        *   **Integration (`src/pages/reports.tsx`):
            *   Instantiate hook using shared `chartSelectedDate` and all three filter states. Render chosen component in the Data Quality tab.
        *   **Critical Caveats:** Status mapping complexity, identifying *final* status if multiple entries exist.

### 4. Data Quality

*   **KPI:** Missing `end_time` Count
    *   **Description:** Number/percentage of report entries missing the completion time.
    *   **Data:** `reports.end_time`.
    *   **Calculation:** `COUNT(*) WHERE end_time IS NULL`
    *   **Granularity:** Daily, Weekly (based on `report_date`?)
*   **KPI:** "Unknown" Status Count
    *   **Description:** Number/percentage of report entries where `optimoroute_status` is NULL or unmapped.
    *   **Data:** `reports.optimoroute_status`.
    *   **Calculation:** `COUNT(*) WHERE optimoroute_status IS NULL`
    *   **Granularity:** Daily, Weekly.

## Notes & Considerations

*   The accuracy of time-based KPIs (On-Time Performance, Job Duration) depends heavily on the availability and accuracy of `scheduled_time`, `end_time`, `start_time`, and `duration_seconds` fields in the `reports` table. Verify this data.
*   Joining `reports` and `work_orders` tables on `order_no` will be necessary for KPIs involving data from both (e.g., Service Type, Internal Status).
*   Status mapping between `optimoroute_status` and internal `work_orders.status` needs careful definition if comparing them.

## Page Layout Wireframe

```text
+----------------------------------------------------------------------------------+
| Reports Dashboard                                                                |
+----------------------------------------------------------------------------------+
| [ Date ] [ Driver Filter (tech_name) ] [ Group Filter (cust_group) ] [ Name Filter (cust_name) ] |
+----------------------------------------------------------------------------------+
| [ Overview Tab | Driver Performance Tab | Efficiency Tab | Data Quality Tab ]      |
+==================================================================================+
|                                                                                  |
|                      [ Content for Currently Active Tab ]                           |
|                                                                                  |
| --- Example: Overview Tab Active ---                                             |
|                                                                                  |
| +--------------------------+ +--------------------------+ +---------------------+ |
| | Completion Rate          | | Total Jobs Completed     | | On-Time Perf.       | |
| |--------------------------| |--------------------------| |---------------------| |
| |           92%            | |           157            | |       88%           | |
| | (Filtered by D, G, N)    | | (Filtered by D, G, N)    | | (Filtered by D, G, N) | |
| +--------------------------+ +--------------------------+ +---------------------+ |
|                                                                                  |
| +--------------------------------------------+ +---------------------------------+ |
| | Status Breakdown (Date/Filters Applied)    | | Failure Reasons (Filtered)      | |
| | ------------------------------------------ | | ------------------------------- | |
| | < Pie Chart Visualization >                | | - Reason 1: 5                   | |
| |                                            | | - Reason 2: 3                   | |
| |                                            | | - Reason 3: 1                   | |
| +--------------------------------------------+ +---------------------------------+ |
|                                                                                  |
| --- Example: Driver Performance Tab Active ---                                   |
|                                                                                  |
| +--------------------------------------------+ +---------------------------------+ |
| | Jobs Completed per Driver (Filtered)       | | Driver Success Rate (Filtered)    | |
| | ------------------------------------------ | | ------------------------------- | |
| | < Bar Chart Visualization >                | | < Bar Chart Visualization >     | |
| |                                            | |                                 | |
| +--------------------------------------------+ +---------------------------------+ |
| | Driver Avg Job Duration (Filtered)         | |                                 | |
| | ------------------------------------------ | |                                 | |
| | < Bar Chart Visualization >                | |                                 | |
| +--------------------------------------------+ +---------------------------------+ |
|                                                                                  |
| --- Example: Efficiency Tab Active ---                                           |
|                                                                                  |
| +-----------------------+ +----------------------------------------------------+ |
| | Avg Job Duration      | | Avg Job Duration by Service Type (Filtered)        | |
| | (Overall, Filtered)   | | -------------------------------------------------- | |
| |-----------------------| | < Bar Chart Visualization >                        | |
| |         35 min        | |                                                    | |
| | (Filtered by D, G, N) | |                                                    | |
| +-----------------------+ +----------------------------------------------------+ |
| | Completion Trend (Filtered)                | |                                 | |
| | ------------------------------------------ | |                                 | |
| | < Line Chart Visualization >               | |                                 | |
| +--------------------------------------------+ +---------------------------------+ |
|                                                                                  |
| --- Example: Data Quality Tab Active ---                                         |
|                                                                                  |
| +--------------------------+ +-------------------------------------------------+ |
| | Status Discrepancies     | | Discrepancy Details (Filtered)                  | |
| | (Filtered)               | | ----------------------------------------------- | |
| |--------------------------| | < Table Visualization >                         | |
| |            5             | |                                                 | |
| | (Filtered by D, G, N)    | |                                                 | |
| +--------------------------+ +-------------------------------------------------+ |
| | (Other Data Quality Checks - TBD)          | |                                 | |
| +--------------------------------------------+ +---------------------------------+ |
|                                                                                  |
+----------------------------------------------------------------------------------+
