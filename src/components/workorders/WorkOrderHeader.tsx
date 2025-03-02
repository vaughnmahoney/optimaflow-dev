
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Import, RefreshCw, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkOrderHeaderProps {
  onSearchChange: (value: string) => void;
  onOptimoRouteSearch: (value: string) => void;
  searchQuery: string;
}

export const WorkOrderHeader = ({ 
  onSearchChange, 
  onOptimoRouteSearch, 
  searchQuery 
}: WorkOrderHeaderProps) => {
  const [importValue, setImportValue] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "");
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const handleImport = async () => {
    if (!importValue.trim()) return;

    setIsImporting(true);
    try {
      // Call the onOptimoRouteSearch with the import value
      onOptimoRouteSearch(importValue.trim());
      
      // Clear the import field after successful import
      setImportValue("");
      
      // Refresh work orders data
      await queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      
      toast.success("Order imported successfully");
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import order");
    } finally {
      setIsImporting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleImport();
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    toast.success("Work orders refreshed");
  };

  const handleSearch = () => {
    onSearchChange(localSearchQuery);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Header title="Work Orders">
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 w-full max-w-2xl">
        {/* Search input */}
        <div className={`relative flex items-center ${isMobile ? 'w-full' : 'flex-1'}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by order #, driver name, or location..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="pl-10 h-10 bg-gray-50 border-gray-200 w-full"
          />
          <Button 
            onClick={handleSearch}
            variant="default"
            size="sm"
            className="ml-2"
          >
            Search
          </Button>
        </div>

        <div className={`flex ${isMobile ? 'w-full' : 'flex-row'} gap-2 ${isMobile ? 'mt-2' : ''}`}>
          {/* Import section with better visual grouping */}
          <div className={`relative flex items-center ${isMobile ? 'flex-1' : ''}`}>
            <Input
              type="text"
              placeholder="Import Order#"
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`${isMobile ? 'w-full' : 'w-44'} bg-gray-50 border-gray-200`}
            />
            <Button 
              className={`${isMobile ? 'ml-1' : 'ml-2'} whitespace-nowrap`}
              onClick={handleImport}
              disabled={isImporting}
              variant="default"
              size={isMobile ? "sm" : "default"}
            >
              <Import className="h-4 w-4 mr-1" />
              {!isMobile && "Import"}
            </Button>
          </div>

          {/* Refresh button */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            className="flex-shrink-0 bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>
    </Header>
  );
};
