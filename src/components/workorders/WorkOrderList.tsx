
import { useState } from "react";
import { WorkOrderListProps } from "./types";
import { StatusFilter } from "./filters/StatusFilter";
import { DebugDataDisplay } from "./debug/DebugDataDisplay";
import { WorkOrderTable } from "./WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";

export const WorkOrderList = ({ 
  workOrders, 
  isLoading,
  onStatusFilterChange,
  onStatusUpdate,
  onImageView,
  onDelete,
  statusFilter
}: WorkOrderListProps) => {
  const [transformedData, setTransformedData] = useState<any>(null);
  const [searchResponse, setSearchResponse] = useState<any>(null);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
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
