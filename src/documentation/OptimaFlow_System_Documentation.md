
# OptimaFlow System Documentation

## Executive Summary

OptimaFlow is a work order quality control and management system designed for Hyland Filter Service, an HVAC maintenance company specializing in air filter replacement and coil cleaning. The system focuses on:

1. **Quality Control & Work Order Processing**: Reviewing and approving service work orders completed by technicians.
2. **Attendance Management**: Tracking technician attendance for workforce performance.
3. **Bulk Order Import**: Efficiently retrieving and importing service orders from OptimoRoute.
4. **User Management**: Role-based access control for system administrators and users.

This document provides a comprehensive overview of the current system implementation, database structure, and component interactions to facilitate future development planning.

## System Architecture

OptimaFlow is built using a modern web stack:

- **Frontend**: React with TypeScript, Tailwind CSS, and Shadcn/UI components
- **Backend**: Supabase for authentication, database, and serverless functions
- **API Integration**: OptimoRoute API for work order retrieval
- **State Management**: React Context and custom hooks

The application follows a component-based architecture with clean separation of concerns:
- UI components render the interface
- Custom hooks handle data fetching and state management
- Supabase edge functions provide secure API communication with third-party services

## Core Features

### 1. Work Order Management System

The work order management system is the primary component of OptimaFlow, allowing quality control personnel to review, approve, flag, or reject work orders that technicians have completed through OptimoRoute.

#### Key Components:

1. **WorkOrderList**: The main component displaying work orders in a filterable, sortable table
2. **ImageViewModal**: A detailed modal for reviewing work order images and information
3. **StatusFilter**: Controls for filtering work orders by status
4. **ImportControls**: Interface for importing orders from OptimoRoute

#### Work Order Workflow:

1. Technicians complete jobs and submit details via OptimoRoute (external system)
2. Administrators import completed orders into OptimaFlow for QC review
3. QC reviewers examine images and order details
4. Orders are approved, flagged for issues, resolved, or rejected
5. Approved orders become available for billing processes

#### Status Transition Logic:

Work orders follow this status flow:
- **pending_review**: Initial state for imported orders
- **approved**: Orders that pass QC review
- **flagged**: Orders with issues that require attention
- **resolved**: Flagged orders that have been addressed
- **rejected**: Orders that cannot be processed

### 2. User Management System

The user management system controls access to OptimaFlow based on user roles and permissions.

#### Key Components:

1. **UserList**: Administrative interface for viewing and managing users
2. **CreateUserDialog**: Modal for adding new users to the system
3. **UserEditDialog**: Interface for modifying existing user details
4. **UserDeleteDialog**: Confirmation modal for removing users

#### User Roles:

- **Admin**: Full system access including user management
- **Lead**: Limited access to work order processing and attendance management

### 3. Bulk Order Import System

The bulk order import system allows administrators to retrieve multiple orders from OptimoRoute based on date ranges and import them into OptimaFlow.

#### Key Components:

1. **BulkOrdersProgressiveForm**: Interface for specifying date ranges and import parameters
2. **RawOrdersTable**: Displays retrieved orders before import
3. **AutoImportStatus**: Shows status of automated import processes

#### Import Workflow:

1. User selects a date range for order retrieval
2. System fetches orders from OptimoRoute API
3. Orders are displayed for review
4. User confirms import of selected orders
5. System processes orders in batches to avoid API limitations
6. Imported orders become available in the work order management system

## Database Structure

### Work Order Related Tables

#### `work_orders` Table

The central table for storing all work order information:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | UUID | Primary key |
| order_no | TEXT | OptimoRoute order number |
| status | TEXT | Current status (pending_review, approved, flagged, resolved, rejected) |
| timestamp | TIMESTAMP | Creation timestamp |
| service_date | DATE | Date the service was performed |
| end_time | TIMESTAMP | Service completion time |
| service_notes | TEXT | Notes from technician about the service |
| tech_notes | TEXT | Internal notes from technician |
| notes | TEXT | General notes about the order |
| qc_notes | TEXT | Notes from quality control review |
| resolution_notes | TEXT | Notes explaining how a flagged issue was resolved |
| driver_name | TEXT | Name of technician who performed the service |
| location_name | TEXT | Location where service was performed |
| approved_by | UUID | ID of user who approved the order |
| approved_user | TEXT | Username of approver |
| approved_at | TIMESTAMP | When the order was approved |
| flagged_by | UUID | ID of user who flagged the order |
| flagged_user | TEXT | Username who flagged the order |
| flagged_at | TIMESTAMP | When the order was flagged |
| resolved_by | UUID | ID of user who resolved the flagged order |
| resolved_user | TEXT | Username who resolved the order |
| resolved_at | TIMESTAMP | When the flagged order was resolved |
| rejected_by | UUID | ID of user who rejected the order |
| rejected_user | TEXT | Username who rejected the order |
| rejected_at | TIMESTAMP | When the order was rejected |
| last_action_by | UUID | ID of user who last modified the order |
| last_action_user | TEXT | Username who last modified the order |
| last_action_at | TIMESTAMP | When the order was last modified |
| search_response | JSONB | Raw data from OptimoRoute search API |
| completion_response | JSONB | Raw data from OptimoRoute completion API |
| updated_at | TIMESTAMP | Last update timestamp |
| created_at | TIMESTAMP | Creation timestamp |

#### `auto_import_logs` Table

Tracks automated import execution:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | UUID | Primary key |
| execution_time | TIMESTAMP | When the auto-import was executed |
| result | JSONB | Results of the import operation |
| created_at | TIMESTAMP | Record creation timestamp |

### User Management Related Tables

#### `user_profiles` Table

Stores user information:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | UUID | Primary key (references auth.users) |
| full_name | TEXT | User's full name |
| role | USER-DEFINED | User role (admin, lead) |
| email | TEXT | User's email address |
| phone_number | TEXT | User's phone number |
| is_active | BOOLEAN | Whether user account is active |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| created_by | UUID | ID of user who created this user |

### Attendance Management Related Tables

#### `technicians` Table

Stores technician information:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | UUID | Primary key |
| name | TEXT | Technician's name |
| email | TEXT | Technician's email address |
| phone | TEXT | Technician's phone number |
| supervisor_id | UUID | ID of supervising user |
| group_id | UUID | ID of technician's group |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### `groups` Table

Organizes technicians into groups:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | UUID | Primary key |
| name | TEXT | Group name |
| description | TEXT | Group description |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### `attendance_records` Table

Tracks daily technician attendance:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | UUID | Primary key |
| date | DATE | Attendance date |
| technician_id | UUID | ID of technician |
| status | TEXT | Attendance status (present, absent, etc.) |
| note | TEXT | Optional attendance note |
| supervisor_id | UUID | ID of recording supervisor |
| submitted_at | TIMESTAMP | When attendance was recorded |
| updated_at | TIMESTAMP | Last update timestamp |

#### `group_attendance_review` Table

Tracks group-level attendance review:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | UUID | Primary key |
| group_id | UUID | ID of the group |
| date | DATE | Review date |
| is_reviewed | BOOLEAN | Whether attendance has been reviewed |
| reviewed_by | UUID | ID of reviewing user |
| reviewed_at | TIMESTAMP | Review timestamp |
| is_submitted | BOOLEAN | Whether attendance has been submitted |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Cross-Functional Tables

#### `audit_logs` Table

Tracks system activity for auditing:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who performed the action |
| action | TEXT | Action performed (INSERT, UPDATE, DELETE) |
| table_name | TEXT | Table that was modified |
| record_id | UUID | ID of affected record |
| old_data | JSONB | Previous state of record |
| new_data | JSONB | New state of record |
| created_at | TIMESTAMP | Action timestamp |

#### `customers` and `stores` Tables

Store customer and location information:

| Table | Key Columns | Description |
|-------|------------|-------------|
| customers | id, name, type, contact_info | Information about client businesses |
| stores | id, name, customer_id, address, store_number | Individual store/location information |

## Frontend Component Structure

### Work Order System

```
src/components/workorders/
├── WorkOrderContent.tsx       # Container for work order list and controls
├── WorkOrderList.tsx          # Primary work order display component
├── ImportControls.tsx         # Interface for importing orders
├── LoadingSkeleton.tsx        # Loading state UI
├── table/                     # Table components
│   ├── WorkOrderTable.tsx     # Work order data table
│   ├── WorkOrderRow.tsx       # Individual row component
│   └── PaginationIndicator.tsx# Table pagination controls
├── modal/                     # Modal components
│   ├── ImageViewModal.tsx     # Order review modal
│   ├── components/            # Modal sub-components
│   │   ├── ImageViewer.tsx    # Image display component
│   │   ├── ImageThumbnails.tsx# Image thumbnails strip
│   │   └── OrderDetails.tsx   # Order metadata display
│   └── tabs/                  # Modal tabs
│       ├── NotesTab.tsx       # Notes display and editing
│       └── SignatureTab.tsx   # Signature display
├── filters/                   # Filter components
│   ├── StatusFilterCards.tsx  # Status filter interface
│   ├── DateFilter.tsx         # Date-based filtering
│   └── FilterSortButton.tsx   # Advanced filtering controls
└── types/                     # TypeScript types
    ├── workOrder.ts           # Work order type definitions
    ├── props.ts               # Component props definitions
    └── filtering.ts           # Filter type definitions
```

### User Management System

```
src/components/users/
├── UserManagementContent.tsx  # User management container
├── UserList.tsx               # User listing component
├── UserListTable.tsx          # User data table
├── CreateUserDialog.tsx       # New user creation modal
├── UserEditDialog.tsx         # User editing modal
└── UserDeleteDialog.tsx       # User deletion modal
```

### Bulk Order Import System

```
src/components/bulk-orders/
├── BulkOrdersProgressiveForm.tsx # Progressive import interface
├── DateRangePicker.tsx           # Date range selection
├── FetchButton.tsx               # Data retrieval button
├── RawOrdersTable.tsx            # Retrieved orders table
├── AutoImportStatus.tsx          # Auto-import status display
└── utils/                        # Utility functions
    ├── orderTransformer.ts       # Order data transformation
    └── filteringUtils.ts         # Order filtering utils
```

## Key Data Flows

### Work Order Import Flow

1. **Trigger**: User enters an order number in `ImportControls` component
2. **Data Flow**:
   - `searchOptimoRoute()` from `useWorkOrderImport` hook is called
   - Edge function `search-optimoroute` calls the OptimoRoute API
   - Work order data is inserted into `work_orders` table
   - React Query invalidates the work orders cache
   - Updated data is fetched and displayed in `WorkOrderTable`

### Work Order Status Update Flow

1. **Trigger**: User changes work order status in `ImageViewModal`
2. **Data Flow**:
   - `onStatusUpdate()` from `useWorkOrderMutations` hook is called
   - Status update is sent to Supabase database
   - Work order status is updated in the database
   - React Query invalidates the work orders cache
   - UI updates with new status
   - If status change would remove order from current filter, navigation automatically advances to next visible order

### Bulk Order Import Flow

1. **Trigger**: User selects date range in `BulkOrdersProgressiveForm` and clicks "Fetch Orders"
2. **Data Flow**:
   - `handleFetchOrders()` from `useBulkOrdersFetch` hook is called
   - Edge function `get-orders-with-completion` calls OptimoRoute API in batches
   - Retrieved orders are displayed in `RawOrdersTable`
   - User confirms import via "Import All" button
   - Edge function `import-bulk-orders` processes batches of orders
   - Orders are inserted into `work_orders` table
   - Work order page is updated with newly imported orders

## Edge Functions

### 1. `search-optimoroute`

Searches for a specific order in OptimoRoute and imports it.

**Parameters**:
- `searchQuery`: The order number to search for

**Response**:
- `success`: Boolean indicating success
- `workOrderId`: UUID of the imported work order
- `error`: Error message (if any)

### 2. `get-orders-with-completion`

Retrieves multiple orders from OptimoRoute based on date range.

**Parameters**:
- `startDate`: Start of date range (YYYY-MM-DD)
- `endDate`: End of date range (YYYY-MM-DD)
- `validStatuses`: Array of order statuses to include

**Response**:
- `orders`: Array of retrieved orders
- `totalCount`: Number of orders retrieved
- `filteringMetadata`: Information about filtering process
- `batchStats`: Information about processing batches

### 3. `import-bulk-orders`

Imports multiple orders into the OptimaFlow database.

**Parameters**:
- `orders`: Array of order objects to import

**Response**:
- `imported`: Number of orders successfully imported
- `duplicates`: Number of duplicate orders skipped
- `errors`: Number of errors encountered

### 4. `user-management`

Handles user creation, listing, updating, and deletion.

**Parameters**:
- `action`: Operation to perform (create, list, update, delete)
- Additional parameters based on action

**Response**:
- Action-specific data (user details, list of users, etc.)

## Custom Hooks

### Work Order Management Hooks

- **useWorkOrderData**: Main hook for fetching and managing work orders
- **useWorkOrderFetch**: Handles API queries for work order data
- **useWorkOrderMutations**: Manages state updates for work order actions
- **useImageViewer**: Controls image viewing and navigation in modal
- **useWorkOrderStatusCounts**: Computes counts of orders in each status

### Bulk Order Import Hooks

- **useBulkOrdersFetch**: Manages the bulk order retrieval process
- **useBulkOrderImport**: Handles the import of retrieved orders
- **useOrdersApi**: Provides interface to OptimoRoute API
- **useOrdersLogging**: Tracks diagnostic information during import

### User Management Hooks

- **useUserManagement**: Provides user CRUD operations

## Authentication & Authorization

The system uses Supabase Authentication with role-based access control:

1. Users log in via email/password credentials
2. After authentication, user role is retrieved from `user_profiles` table
3. UI components and data access are restricted based on user role:
   - **Admin**: Full system access
   - **Lead**: Limited to work order processing and attendance management

## Future Development Considerations

Based on the current implementation, the following areas may be considered for future development:

1. **Billing System Integration**: Develop functionality to generate invoices from approved work orders
2. **Advanced Reporting**: Create dashboard with KPIs and performance metrics
3. **Mobile App**: Develop companion mobile application for technicians
4. **AI-Powered QC**: Implement image recognition to auto-flag problematic work orders
5. **Customer Portal**: External interface for customers to view service history and schedule maintenance

## Technical Debt & Improvement Opportunities

### 1. Component Refactoring Needs

Several components have grown too large and complex, requiring refactoring:

1. **WorkOrderList.tsx**: This component has grown to over 500 lines and handles too many responsibilities including:
   - Fetching data
   - Managing filters
   - Status updates
   - Modal interactions
   
   It should be split into smaller components with focused responsibilities.

2. **useUserManagement.ts**: At over 250 lines, this hook needs to be broken into smaller hooks for:
   - User fetching
   - User mutations (create/edit/delete)
   - Error handling

3. **UserManagementContent.tsx**: Needs clearer separation of UI and state management logic

### 2. Unused and Partially Working Files

The codebase contains several files that are either unused or contain non-functional code:

1. **src/components/workorders/ImageControls.tsx**: Partially implemented but not used in the current workflow

2. **src/components/users/UserListFilters.tsx**: Contains filtering functionality that's partially working but has UI issues

3. **src/hooks/bulk-orders/useOrderDeduplication.ts**: Has hardcoded values but appears to be unused in production workflow

4. **src/components/workorders/modal/components/ImageStatusIndicators.tsx**: Implemented but not integrated with current modal view

### 3. Performance Issues

Key performance issues that need addressing:

1. **User Management Dialogs**: App freezes when closing user management dialogs, likely due to:
   - State updates during unmounting
   - Race conditions between API calls and UI updates
   - Dialog state and form state conflicts

2. **Large Data Handling**: The work orders table struggles with large datasets:
   - No virtualization for large lists
   - Inefficient filtering that recalculates on every render
   - All images loaded at once rather than on-demand

3. **Bulk Import Performance**: Imports of large batches cause UI freezes:
   - Processing happens on main thread
   - Missing progress indicators
   - No cancelation mechanism

### 4. User Management System Issues

The User Management system has several critical issues that suggest it should be rebuilt:

1. **UI Freezes**: The application freezes when closing dialogs, indicating serious state management issues
   - Likely caused by state updates during component unmounting
   - Dialog close handlers conflict with form submission handlers
   - Multiple async operations may not be properly coordinated

2. **Date Handling Issues**: Date fields in the user management are broken:
   - Invalid date formats cause parsing errors
   - Timezone inconsistencies between server and client
   - Form validation doesn't properly handle date values

3. **API Integration Problems**:
   - Error handling is inconsistent
   - Success/error toasts may be displayed at incorrect times
   - The edge function handles too many responsibilities

4. **Recommended Approach**: Keep the backend structure (tables, edge functions) but rebuild the frontend with:
   - Clearer separation of concerns
   - More reliable state management with proper cleanup
   - Simplified dialog handling using controlled components
   - Better form state management with React Hook Form

## Next Steps for Development

Based on this analysis, here are the recommended next steps for the OptimaFlow system:

1. **Address Critical Issues**:
   - Fix the TypeScript errors in WorkOrderList.tsx causing build failures
   - Rebuild the User Management frontend components while keeping the backend intact

2. **Technical Debt Reduction**:
   - Break down large components into smaller, more focused ones
   - Improve performance of bulk operations with pagination and virtualization
   - Remove or complete partially implemented features

3. **New Feature Development**:
   - Implement the Billing System as the logical next step after work order approval
   - Enhance reporting capabilities for management insights
   - Add more sophisticated automation to the QC process

This documentation provides a comprehensive overview of the current state of OptimaFlow. It should serve as a foundation for planning future development efforts and understanding the system's architecture and data flows.
