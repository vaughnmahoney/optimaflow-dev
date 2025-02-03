# Attendance Tracking System Documentation

## Overview
The attendance tracking system allows supervisors to manage and track attendance records for their technicians. The system consists of two main features:
1. Daily attendance submission
2. Historical attendance viewing

## Data Structure

### Database Tables
1. `technicians`
   - Stores technician information (name, email, phone)
   - Each technician is linked to a supervisor

2. `attendance_records`
   - Stores daily attendance status for each technician
   - Links to both technician and supervisor
   - Tracks status (present/absent/excused)
   - Includes timestamps for submission and updates

## Core Components

### 1. Daily Attendance (AttendanceForm.tsx)
- Located in `/src/components/attendance/AttendanceForm.tsx`
- Handles daily attendance submission
- Uses `useAttendanceState` hook for state management
- Allows editing of today's attendance
- Validates that all technicians have attendance marked

### 2. Historical View (AttendanceHistory.tsx)
- Located in `/src/pages/AttendanceHistory.tsx`
- Displays attendance records in a hierarchical structure:
  - Year → Month → Week → Day
- Uses `useAttendanceHistory` hook for data fetching

## Data Flow

### Saving Attendance Records
1. User marks attendance using radio buttons (present/absent/excused)
2. `useAttendanceState` hook manages the form state
3. On submit:
   - Validates all technicians have attendance marked
   - Creates attendance records with timestamps
   - Saves to Supabase database
   - Shows success/error toast notifications

### Viewing History
1. `useAttendanceHistory` hook fetches records and technicians
2. Raw attendance records are transformed into a hierarchical structure:
   ```typescript
   AttendanceRecord[] → DailyAttendanceRecord[] → YearGroup[]
   ```
3. Components render the transformed data:
   - YearGroup.tsx
   - MonthGroup.tsx
   - WeekGroup.tsx
   - DailyAttendanceCard.tsx

## Key Utilities

### attendanceTransformUtils.ts
- Transforms flat attendance records into grouped daily records
- Calculates attendance statistics (present/absent/excused counts)

### attendanceUtils.ts
- Groups records by year/month/week
- Handles record creation and submission
- Provides date-based utilities

## Data Types

### AttendanceRecord
```typescript
{
  id: string;
  technician_id: string;
  supervisor_id: string;
  date: string;
  status: "present" | "absent" | "excused";
  note?: string;
  submitted_at: string;
  updated_at: string;
}
```

### DailyAttendanceRecord
```typescript
{
  id: string;
  date: string;
  records: AttendanceRecord[];
  submittedBy: string;
  submittedAt: string;
  stats: {
    present: number;
    absent: number;
    excused: number;
    total: number;
  };
}
```

## Security
- Row Level Security (RLS) policies ensure:
  - Supervisors can only view/edit their technicians' records
  - Records can only be created for technicians under the supervisor
  - Updates are restricted to the supervisor who owns the records

## Error Handling
- Form validation for required fields
- Toast notifications for success/error states
- Loading states during data fetching
- Fallback UI for empty states

## State Management
- Uses React Query for server state
- Local state managed through React hooks
- Optimistic updates for better UX
- Automatic refetching on data changes