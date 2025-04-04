
import { Card, CardContent } from "@/components/ui/card";
import { Check, Flag, Clock, CheckCheck, AlertTriangle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FilterSortButton } from "./FilterSortButton";
import { WorkOrderFilters, SortDirection, SortField } from "../types";
import { TodayDateButton } from "./TodayDateButton";

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
      label: "Pending", 
      value: "pending_review", 
      icon: Clock, 
      color: "text-yellow-600",
      hoverColor: "hover:bg-yellow-50",
      borderColor: "border-yellow-200",
      activeBorderColor: "border-yellow-300",
      bgColor: "bg-yellow-50"
    },
    { 
      label: "Flagged", 
      value: "flagged", 
      icon: Flag, 
      color: "text-red-600",
      hoverColor: "hover:bg-red-50",
      borderColor: "border-red-200",
      activeBorderColor: "border-red-300",
      bgColor: "bg-red-50"
    },
    { 
      label: "Approved", 
      value: "approved", 
      icon: Check, 
      color: "text-green-600",
      hoverColor: "hover:bg-green-50",
      borderColor: "border-green-200",
      activeBorderColor: "border-green-300",
      bgColor: "bg-green-50"
    },
    { 
      label: "Resolved", 
      value: "resolved", 
      icon: CheckCheck, 
      color: "text-blue-600",
      hoverColor: "hover:bg-blue-50",
      borderColor: "border-blue-200",
      activeBorderColor: "border-blue-300",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Rejected", 
      value: "rejected", 
      icon: AlertTriangle, 
      color: "text-orange-600",
      hoverColor: "hover:bg-orange-50",
      borderColor: "border-orange-200",
      activeBorderColor: "border-orange-300",
      bgColor: "bg-orange-50"
    },
  ];

  // Same button rendering function for both mobile and desktop to maintain consistency
  const renderStatusButtons = () => {
    return (
      <>
        {/* Today Date Button first */}
        <TodayDateButton />
        
        {/* Filter button */}
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
                "flex items-center space-x-1.5 py-1 px-2.5 rounded-full transition-all shrink-0 border",
                isActive 
                  ? `${status.bgColor} ${status.color} ${status.activeBorderColor} shadow-sm`
                  : `bg-white border-gray-200 hover:border-gray-300 shadow-sm ${status.hoverColor}`
              )}
            >
              <status.icon 
                size={14}
                className={status.color}
              />
              <span className="text-xs font-medium">{status.label}</span>
              {count > 0 && (
                <span className={cn(
                  "inline-flex items-center justify-center text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px]",
                  isActive 
                    ? "bg-white/80 text-gray-700" 
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

  // Updated to maintain scroll functionality but hide the scrollbar
  return (
    <div className="mb-0 overflow-hidden w-full">
      <ScrollArea className="w-full scrollbar-none">
        <div className="flex space-x-1.5 pb-1.5 min-w-max">
          {renderStatusButtons()}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
};
