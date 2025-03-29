
import { useState } from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { WorkOrder, SortDirection, SortField, PaginationState, WorkOrderFilters } from "../types";
import { WorkOrderTableHeader } from "./TableHeader";
import { WorkOrderRow } from "./WorkOrderRow";
import { EmptyState } from "./EmptyState";
import { useSortableTable } from "./useSortableTable";
import { Pagination } from "./Pagination";
import { Button } from "@/components/ui/button";
import { FilterX, Import, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkOrderTableProps {
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
  filters: WorkOrderFilters;
  onColumnFilterChange: (column: string, value: any) => void;
  onColumnFilterClear: (column: string) => void;
  onClearAllFilters: () => void;
  onOptimoRouteSearch: (value: string) => void;
  onRefresh?: () => void;
}

export const WorkOrderTable = ({ 
  workOrders: initialWorkOrders, 
  onStatusUpdate,
  onImageView,
  onDelete,
  sortField: externalSortField,
  sortDirection: externalSortDirection,
  onSort: externalOnSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  filters,
  onColumnFilterChange,
  onColumnFilterClear,
  onClearAllFilters,
  onOptimoRouteSearch,
  onRefresh
}: WorkOrderTableProps) => {
  const [importValue, setImportValue] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const { 
    workOrders, 
    sortField, 
    sortDirection, 
    handleSort 
  } = useSortableTable(
    initialWorkOrders, 
    externalSortField, 
    externalSortDirection, 
    externalOnSort
  );

  // Check if any filter is active
  const hasActiveFilters = 
    filters.status !== null || 
    filters.orderNo !== null || 
    filters.driver !== null || 
    filters.location !== null || 
    filters.dateRange.from !== null || 
    filters.dateRange.to !== null;

  const handleImport = async () => {
    if (!importValue.trim()) return;

    setIsImporting(true);
    try {
      // Call the onOptimoRouteSearch with the import value
      onOptimoRouteSearch(importValue.trim());
      
      // Clear the import field after successful import
      setImportValue("");
      
      // Close the search sheet if on mobile
      if (isMobile) {
        setIsSearchOpen(false);
      }
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleImport();
    }
  };

  return (
    <div className="space-y-2">
      {/* Top controls section with filters and import */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        {/* Active filters indicator */}
        <div className="flex items-center">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAllFilters}
              className="h-8 text-xs"
            >
              <FilterX className="h-3 w-3 mr-1" />
              Clear all filters
            </Button>
          )}
        </div>
        
        {/* Import controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Mobile import sheet */}
          {isMobile ? (
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <div className="flex gap-2 w-full">
                <SheetTrigger asChild className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Import className="h-4 w-4 mr-1" />
                    Import Order
                  </Button>
                </SheetTrigger>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  className="flex-shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Refresh</span>
                </Button>
              </div>
              
              <SheetContent side="top" className="pt-10">
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-medium">Import Order</h3>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Enter Order #"
                      value={importValue}
                      onChange={(e) => setImportValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      autoFocus
                    />
                    <SheetClose asChild>
                      <Button size="sm" variant="ghost">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </Button>
                    </SheetClose>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      onClick={handleImport}
                      disabled={isImporting}
                    >
                      <Import className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            /* Desktop import controls */
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Import Order#"
                value={importValue}
                onChange={(e) => setImportValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-44"
              />
              <Button 
                onClick={handleImport}
                disabled={isImporting}
              >
                <Import className="h-4 w-4 mr-1" />
                Import
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    
      <div className="rounded-md border">
        <Table>
          <WorkOrderTableHeader 
            sortField={sortField} 
            sortDirection={sortDirection} 
            onSort={handleSort}
            filters={filters}
            onFilterChange={onColumnFilterChange}
            onFilterClear={onColumnFilterClear}
          />
          <TableBody>
            {workOrders.length === 0 ? (
              <EmptyState />
            ) : (
              workOrders.map((workOrder) => (
                <WorkOrderRow 
                  key={workOrder.id}
                  workOrder={workOrder}
                  onStatusUpdate={onStatusUpdate}
                  onImageView={onImageView}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
        
        {pagination && onPageChange && onPageSizeChange && (
          <Pagination 
            pagination={pagination}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
