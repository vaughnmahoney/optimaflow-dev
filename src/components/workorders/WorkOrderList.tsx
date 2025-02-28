
import { useState } from "react";
import { WorkOrderListProps } from "./types";
import { StatusFilterCards } from "./filters/StatusFilterCards";
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
      <StatusFilterCards 
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />

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
