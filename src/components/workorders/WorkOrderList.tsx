
import { useState } from "react";
import { WorkOrderListProps } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SearchBar } from "./search/SearchBar";
import { OptimoRouteSearchBar } from "./search/OptimoRouteSearchBar";
import { StatusFilter } from "./filters/StatusFilter";
import { DebugDataDisplay } from "./debug/DebugDataDisplay";
import { transformResponse } from "./utils/transformResponse";
import { ImageViewDialog } from "./ImageViewDialog";
import { WorkOrderTable } from "./WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";

export const WorkOrderList = ({ 
  workOrders, 
  isLoading,
  onSearchChange,
  onStatusFilterChange,
  onStatusUpdate,
  searchQuery,
  statusFilter
}: WorkOrderListProps) => {
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
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
        onImageView={setSelectedWorkOrderId}
      />

      <ImageViewDialog 
        workOrderId={selectedWorkOrderId} 
        onClose={() => setSelectedWorkOrderId(null)}
        onStatusUpdate={onStatusUpdate}
        workOrders={workOrders}
      />
    </div>
  );
};
