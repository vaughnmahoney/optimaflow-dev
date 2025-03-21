import { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, FilterChangedEvent, SortChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { WorkOrder, SortDirection, SortField, PaginationState } from '../types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Define props interface
interface WorkOrderGridProps {
  workOrders: WorkOrder[];
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  filters: {
    status: string | null;
    dateRange: { from: Date | null; to: Date | null };
    driver: string | null;
    location: string | null;
    orderNo: string | null;
  };
  onColumnFilterChange: (column: string, value: any) => void;
  onColumnFilterClear: (column: string) => void;
  onClearAllFilters: () => void;
}

export const WorkOrderGrid = ({
  workOrders,
  onStatusUpdate,
  onImageView,
  onDelete,
  sortField,
  sortDirection,
  onSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  filters,
  onColumnFilterChange,
  onColumnFilterClear,
  onClearAllFilters
}: WorkOrderGridProps) => {
  // State for AG Grid API
  const [gridApi, setGridApi] = useState<any>(null);
  const [gridColumnApi, setGridColumnApi] = useState<any>(null);

  // Check if any filters are active
  const hasActiveFilters = 
    filters.status !== null || 
    filters.orderNo !== null || 
    filters.driver !== null || 
    filters.location !== null || 
    (filters.dateRange.from !== null || filters.dateRange.to !== null);

  // Define columns
  const columnDefs = useMemo<ColDef[]>(() => [
    { 
      field: 'orderNo', 
      headerName: 'Order #',
      filter: 'agTextColumnFilter',
      sortable: true,
      filterParams: {
        filterOptions: ['contains', 'equals'],
        debounceMs: 200,
      }
    },
    { 
      field: 'serviceDate', 
      headerName: 'Service Date',
      filter: 'agDateColumnFilter',
      sortable: true,
      filterParams: {
        filterOptions: ['equals', 'greaterThan', 'lessThan', 'inRange'],
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          const cellDate = new Date(cellValue);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        }
      }
    },
    { 
      field: 'driver', 
      headerName: 'Driver',
      filter: 'agTextColumnFilter',
      sortable: true
    },
    { 
      field: 'location', 
      headerName: 'Location',
      filter: 'agTextColumnFilter',
      sortable: true
    },
    { 
      field: 'status', 
      headerName: 'Status',
      filter: 'agTextColumnFilter',
      sortable: true,
      cellRenderer: (params: any) => {
        const status = params.value;
        let statusClass = '';
        
        switch (status) {
          case 'completed':
            statusClass = 'bg-green-100 text-green-800';
            break;
          case 'in_progress':
            statusClass = 'bg-blue-100 text-blue-800';
            break;
          case 'flagged':
          case 'flagged_followup':
            statusClass = 'bg-red-100 text-red-800';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800';
        }
        
        return `<div class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">${status.replace('_', ' ')}</div>`;
      }
    },
    {
      headerName: 'Actions',
      field: 'id',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        // This would be better with a proper React component, but for simplicity:
        return `
          <div class="flex space-x-2">
            <button class="text-blue-600 hover:text-blue-800" data-action="view">View</button>
            <button class="text-red-600 hover:text-red-800" data-action="delete">Delete</button>
          </div>
        `;
      },
      cellRendererParams: {
        onImageView,
        onDelete
      },
      onCellClicked: (params: any) => {
        const action = (params.event.target as HTMLElement).getAttribute('data-action');
        if (action === 'view') {
          onImageView(params.value);
        } else if (action === 'delete') {
          onDelete(params.value);
        }
      }
    }
  ], [onImageView, onDelete]);

  // Default column definitions
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  // Handle grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    
    // Apply initial sorting if provided
    if (sortField && sortDirection) {
      const sort = [{ colId: sortField, sort: sortDirection === 'asc' ? 'asc' : 'desc' }];
      params.columnApi.applyColumnState({ state: sort });
    }
  }, [sortField, sortDirection]);

  // Handle filter changes
  const onFilterChanged = useCallback((event: FilterChangedEvent) => {
    if (gridApi) {
      const filterModel = gridApi.getFilterModel();
      
      // Map AG Grid filter model to our app's filter format
      Object.entries(filterModel).forEach(([field, model]: [string, any]) => {
        switch (field) {
          case 'orderNo':
            onColumnFilterChange('order_no', model.filter);
            break;
          case 'serviceDate':
            if (model.type === 'inRange') {
              onColumnFilterChange('service_date', {
                from: model.dateFrom ? new Date(model.dateFrom) : null,
                to: model.dateTo ? new Date(model.dateTo) : null
              });
            }
            break;
          case 'driver':
            onColumnFilterChange('driver', model.filter);
            break;
          case 'location':
            onColumnFilterChange('location', model.filter);
            break;
          case 'status':
            onColumnFilterChange('status', model.filter);
            break;
        }
      });
    }
  }, [gridApi, onColumnFilterChange]);

  // Handle sort changes
  const onSortChanged = useCallback((event: SortChangedEvent) => {
    if (gridColumnApi && onSort) {
      const sortModel = gridColumnApi.getColumnState()
        .filter(column => column.sort)
        .map(column => ({
          field: column.colId as SortField,
          direction: column.sort as SortDirection
        }));
      
      if (sortModel.length > 0) {
        onSort(sortModel[0].field, sortModel[0].direction);
      }
    }
  }, [gridColumnApi, onSort]);

  // Transform work orders for AG Grid
  const rowData = useMemo(() => {
    return workOrders.map(order => ({
      id: order.id,
      orderNo: order.orderNo,
      serviceDate: order.serviceDate,
      driver: order.driver,
      location: order.location,
      status: order.status
    }));
  }, [workOrders]);

  // Apply external filters to AG Grid
  useEffect(() => {
    if (gridApi) {
      // Clear all filters first
      gridApi.setFilterModel({});
      
      // Apply filters from props
      const filterModel: any = {};
      
      if (filters.orderNo) {
        filterModel.orderNo = { 
          type: 'text', 
          filter: filters.orderNo 
        };
      }
      
      if (filters.dateRange.from || filters.dateRange.to) {
        filterModel.serviceDate = { 
          type: 'inRange', 
          dateFrom: filters.dateRange.from, 
          dateTo: filters.dateRange.to 
        };
      }
      
      if (filters.driver) {
        filterModel.driver = { 
          type: 'text', 
          filter: filters.driver 
        };
      }
      
      if (filters.location) {
        filterModel.location = { 
          type: 'text', 
          filter: filters.location 
        };
      }
      
      if (filters.status) {
        filterModel.status = { 
          type: 'text', 
          filter: filters.status 
        };
      }
      
      // Apply the filter model
      gridApi.setFilterModel(filterModel);
    }
  }, [gridApi, filters]);

  // Apply pagination
  useEffect(() => {
    if (gridApi && pagination) {
      gridApi.paginationSetPageSize(pagination.pageSize);
      gridApi.paginationGoToPage(pagination.page - 1); // AG Grid is 0-indexed
    }
  }, [gridApi, pagination]);

  return (
    <div className="space-y-4">
      {/* Filter indicator and clear button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Filters applied
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="h-8 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all filters
          </Button>
        </div>
      )}

      {/* The AG Grid component */}
      <div 
        className="ag-theme-alpine dark:ag-theme-alpine-dark" 
        style={{ height: 600, width: '100%' }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onSortChanged={onSortChanged}
          pagination={true}
          paginationPageSize={pagination?.pageSize || 10}
          suppressPaginationPanel={true} // We'll use our own pagination
          rowSelection="multiple"
          animateRows={true}
          enableCellTextSelection={true}
          suppressRowClickSelection={true}
        />
      </div>

      {/* Custom pagination component */}
      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} entries
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </Button>
            <select
              className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
