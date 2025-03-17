# Attendance Tracking System Documentation

## Overview
The attendance tracking system allows supervisors to manage and track attendance records for their technicians. The system consists of two main features:
1. Daily attendance submission
2. Historical attendance viewing

## Data Flow Architecture

### Authentication Flow
1. User logs in through Supabase authentication
2. AuthProvider.tsx manages the session state
3. ProtectedRoute.tsx ensures only authenticated users access the app
4. Session information is used to identify the supervisor

### Daily Attendance Flow
1. Supervisor navigates to /supervisor route
2. AttendanceForm.tsx loads and:
   - Fetches technicians for the current supervisor
   - Checks for existing attendance records for today
   - Displays radio buttons for each technician
3. When marking attendance:
   - useAttendanceState hook tracks form state
   - Radio selections update local state
   - Submit button triggers validation
   - Records are saved to Supabase

### Historical View Flow
1. Supervisor navigates to /attendance-history
2. useAttendanceHistory hook:
   - Fetches technicians and attendance records
   - Uses supervisor_id from session for RLS
   - Transforms data into hierarchical structure
3. Data transformation process:
   ```typescript
   Raw Records → Daily Records → Year/Month/Week Groups
   ```
4. Component hierarchy:
   ```
   AttendanceHistory
   └── AttendanceContent
       └── YearGroup
           └── MonthGroup
               └── WeekGroup
                   └── DailyAttendanceCard
   ```

## Component Details

### AttendanceForm.tsx
- Purpose: Daily attendance submission
- Key features:
  - Real-time form state management
  - Validation before submission
  - Optimistic updates
  - Error handling with toasts
- State management:
  ```typescript
  const {
    attendanceStates,
    setAttendanceState,
    resetAttendanceStates
  } = useAttendanceState(technicians);
  ```

### AttendanceHistory.tsx
- Purpose: Historical record viewing
- Key features:
  - Hierarchical data display
  - Filtering by date ranges
  - Edit capability for past records
- Data fetching:
  ```typescript
  const {
    technicians,
    attendanceRecords,
    isLoading,
    error
  } = useAttendanceHistory();
  ```

## Database Structure

### technicians Table
```sql
CREATE TABLE technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  supervisor_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### attendance_records Table
```sql
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID NOT NULL REFERENCES technicians(id),
  supervisor_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL,
  note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Row Level Security (RLS)

### Technicians Table Policies
```sql
-- View policy
CREATE POLICY "Supervisors can view their technicians"
ON technicians FOR SELECT
USING (supervisor_id = auth.uid());

-- Insert policy
CREATE POLICY "Supervisors can create technicians"
ON technicians FOR INSERT
WITH CHECK (supervisor_id = auth.uid());
```

### Attendance Records Policies
```sql
-- View policy
CREATE POLICY "Supervisors can view attendance records for their technicians"
ON attendance_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM technicians
    WHERE technicians.id = attendance_records.technician_id
    AND technicians.supervisor_id = auth.uid()
  )
);

-- Insert/Update policy
CREATE POLICY "Supervisors can manage attendance records for their technicians"
ON attendance_records FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM technicians
    WHERE technicians.id = attendance_records.technician_id
    AND technicians.supervisor_id = auth.uid()
  )
);
```

## Error Handling

### Client-Side Validation
- Required field checks
- Date format validation
- Duplicate record prevention
- Status value validation

### Server-Side Validation
- RLS policies enforce data access
- Foreign key constraints
- Not null constraints
- Status enum validation

### UI Error Handling
- Loading states during fetches
- Error boundaries for component crashes
- Toast notifications for user feedback
- Fallback UI for empty states

## State Management Strategy

### Server State (React Query)
- Attendance records fetching
- Technician data fetching
- Automatic background refetching
- Cache invalidation on updates

### Local State (React Hooks)
- Form input values
- UI state (loading, error)
- Edit mode toggles
- Filter/sort preferences

### Optimistic Updates
1. Update local cache immediately
2. Send request to server
3. Revert on error with toast
4. Refetch on success

## Data Transformation Pipeline

### Raw Records → Daily Records
1. Group by date
2. Calculate daily statistics
3. Merge technician details
4. Sort by date (descending)

### Daily Records → Hierarchical View
1. Group by year
2. Subdivide into months
3. Create week groupings
4. Sort at each level
5. Calculate group statistics

## Performance Considerations
- React Query caching
- Pagination for large datasets
- Memoization of expensive calculations
- Lazy loading of historical data
- Debounced search/filter operations