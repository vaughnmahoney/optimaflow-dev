
import { useState } from "react";
import { WorkOrderListProps } from "./types";
import { SearchBar } from "./search/SearchBar";
import { OptimoRouteSearchBar } from "./search/OptimoRouteSearchBar";
import { StatusFilter } from "./filters/StatusFilter";
import { DebugDataDisplay } from "./debug/DebugDataDisplay";
import { WorkOrderTable } from "./WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { Card } from "@/components/ui/card";

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
    <div className="max-w-7xl mx-auto space-y-8">
      <Card className="p-6 shadow-lg rounded-xl border-opacity-20">
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
      </Card>

      <DebugDataDisplay 
        searchResponse={searchResponse}
        transformedData={transformedData}
      />

      <Card className="shadow-lg rounded-xl border-opacity-20">
        <WorkOrderTable 
          workOrders={workOrders}
          onStatusUpdate={onStatusUpdate}
          onImageView={onImageView}
          onDelete={onDelete}
        />
      </Card>
    </div>
  );
};
