
import { useState } from "react";
import { WorkOrderListProps } from "./types";
import { SearchBar } from "./search/SearchBar";
import { OptimoRouteSearchBar } from "./search/OptimoRouteSearchBar";
import { StatusFilter } from "./filters/StatusFilter";
import { DebugDataDisplay } from "./debug/DebugDataDisplay";
import { WorkOrderTable } from "./WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";

export const WorkOrderList = ({ 
  workOrders, 
  isLoading,
  onSearchChange,
  onOptimoRouteSearch,
  onStatusFilterChange,
  onStatusUpdate,
  onImageView,
  onDelete,
  searchQuery,
  statusFilter
}: WorkOrderListProps) => {
  const [transformedData, setTransformedData] = useState<any>(null);
  const [searchResponse, setSearchResponse] = useState<any>(null);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-border/40 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <SearchBar onSearch={onSearchChange} />
          </div>
          <div className="flex-1">
            <OptimoRouteSearchBar onSearch={onOptimoRouteSearch} />
          </div>
          <StatusFilter 
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
          />
        </div>
      </div>

      <DebugDataDisplay 
        searchResponse={searchResponse}
        transformedData={transformedData}
      />

      <WorkOrderTable 
        workOrders={workOrders}
        onStatusUpdate={onStatusUpdate}
        onImageView={onImageView}
        onDelete={onDelete}
      />
    </div>
  );
};
