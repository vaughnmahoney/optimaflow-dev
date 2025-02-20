
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <SearchBar onSearch={onSearchChange} />
        </div>
        <div className="flex-1">
          <OptimoRouteSearchBar onSearch={onSearchChange} />
        </div>
        <StatusFilter 
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
        />
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
