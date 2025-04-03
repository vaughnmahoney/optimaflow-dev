
import { Card, CardContent } from "@/components/ui/card";
import { Check, Flag, Clock, CheckCheck, AlertTriangle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FilterSortButton } from "./FilterSortButton";
import { WorkOrderFilters, SortDirection, SortField } from "../types";

interface StatusFilterCardsProps {
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  statusCounts: {
    approved: number;
    pending_review: number;
    flagged: number;
    resolved: number;
    rejected: number;
    all?: number;
  };
  filters: WorkOrderFilters;
  onColumnFilterChange: (column: string, value: any) => void;
  clearColumnFilter: (column: string) => void;
  clearAllFilters: () => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
}

export const StatusFilterCards = ({
  statusFilter,
  onStatusFilterChange,
  statusCounts,
  filters,
  onColumnFilterChange,
  clearColumnFilter,
  clearAllFilters,
  sortField = 'end_time',
  sortDirection = 'desc',
  onSort,
}: StatusFilterCardsProps) => {
  const isMobile = useIsMobile();
  
  const statuses = [
    { 
      label: "Pending Review", 
      value: "pending_review", 
      icon: Clock, 
      color: "bg-yellow-500",
      ringColor: "ring-yellow-500",
      hoverColor: "hover:bg-yellow-600",
      textColor: "text-yellow-500",
      lightBg: "bg-yellow-50"
    },
    { 
      label: "Flagged", 
      value: "flagged", 
      icon: Flag, 
      color: "bg-red-500",
      ringColor: "ring-red-500",
      hoverColor: "hover:bg-red-600",
      textColor: "text-red-500",
      lightBg: "bg-red-50"
    },
    { 
      label: "Approved", 
      value: "approved", 
      icon: Check, 
      color: "bg-green-500",
      ringColor: "ring-green-500",
      hoverColor: "hover:bg-green-600",
      textColor: "text-green-500",
      lightBg: "bg-green-50"
    },
    { 
      label: "Resolved", 
      value: "resolved", 
      icon: CheckCheck, 
      color: "bg-blue-500",
      ringColor: "ring-blue-500",
      hoverColor: "hover:bg-blue-600",
      textColor: "text-blue-500",
      lightBg: "bg-blue-50"
    },
    { 
      label: "Rejected", 
      value: "rejected", 
      icon: AlertTriangle, 
      color: "bg-orange-500",
      ringColor: "ring-orange-500",
      hoverColor: "hover:bg-orange-600",
      textColor: "text-orange-500",
      lightBg: "bg-orange-50"
    },
  ];

  // Same button rendering function for both mobile and desktop to maintain consistency
  const renderStatusButtons = () => {
    const hasActiveFilters = 
      filters.status !== null || 
      filters.orderNo !== null || 
      filters.driver !== null || 
      filters.location !== null || 
      filters.dateRange.from !== null || 
      filters.dateRange.to !== null;

    return (
      <>
        {/* Filter button first */}
        <FilterSortButton 
          filters={filters}
          onColumnFilterChange={onColumnFilterChange}
          clearColumnFilter={clearColumnFilter}
          clearAllFilters={clearAllFilters}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        
        {/* Status buttons */}
        {statuses.map((status) => {
          const isActive = statusFilter === status.value;
          const count = statusCounts[status.value] || 0;
          
          return (
            <button
              key={status.value}
              onClick={() => onStatusFilterChange(
                statusFilter === status.value ? null : status.value
              )}
              className={cn(
                "flex items-center space-x-2 py-1.5 px-3 rounded-full transition-all shrink-0",
                isActive 
                  ? `${status.color} text-white shadow-md`
                  : `bg-white border border-gray-200 hover:border-gray-300 shadow-sm`
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full",
                isActive ? "bg-white/20" : status.color
              )}>
                <status.icon 
                  size={14}
                  className={isActive ? "text-white" : "text-white"} 
                />
              </div>
              <span className="text-sm font-medium">{status.label}</span>
              {count > 0 && (
                <span className={cn(
                  "inline-flex items-center justify-center text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[20px]",
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-gray-100 text-gray-700"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </>
    );
  };

  // Fixed the scrolling by adding explicit width & height constraints,
  // adding ScrollBar with orientation="horizontal", and ensuring proper layout
  return (
    <div className="mb-0 overflow-hidden w-full">
      <ScrollArea className="w-full">
        <div className="flex space-x-2 pb-2 min-w-max">
          {renderStatusButtons()}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
