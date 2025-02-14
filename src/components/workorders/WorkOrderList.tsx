
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageViewDialog } from "./ImageViewDialog";
import { WorkOrderTable } from "./WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useState } from "react";
import { WorkOrderListProps } from "./types";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

      if (data?.success) {
        toast.success("Work order imported successfully");
        setOptimoSearch("");
        // Refresh the work orders list by clearing the search
        onSearchChange("");
      } else {
        toast.error(data?.error || "No work order found with that number");
      }
    } catch (error) {
      console.error('OptimoRoute search error:', error);
      toast.error(`Failed to import work order: ${error.message}`);
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
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Import OptimoRoute order #"
            value={optimoSearch}
            onChange={(e) => setOptimoSearch(e.target.value)}
            className="w-64"
          />
          <Button 
            variant="secondary"
            onClick={handleOptimoSearch}
            disabled={!optimoSearch.trim() || isSearching}
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? 'Importing...' : 'Import'}
          </Button>
        </div>

        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => onStatusFilterChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
