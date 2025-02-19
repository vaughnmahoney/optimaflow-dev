
import { useState } from "react";
import { WorkOrderListProps } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SearchBar } from "./search/SearchBar";
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
  const [optimoSearch, setOptimoSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);

  const handleOptimoSearch = async () => {
    if (!optimoSearch.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-optimoroute', {
        body: { searchQuery: optimoSearch }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      console.log('Response from function:', data);
      setSearchResponse(data);
      setTransformedData(transformResponse(data));

      if (data?.success) {
        toast.success("Work order found");
        setOptimoSearch("");
      } else {
        toast.error(data?.error || "No work order found with that number");
      }
    } catch (error: any) {
      console.error('OptimoRoute search error:', error);
      toast.error(`Failed to find work order: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <SearchBar 
          searchQuery={searchQuery}
          optimoSearch={optimoSearch}
          isSearching={isSearching}
          onSearchChange={onSearchChange}
          onOptimoSearchChange={setOptimoSearch}
          onOptimoSearch={handleOptimoSearch}
        />

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
