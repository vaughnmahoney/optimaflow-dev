
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Import, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Header } from "@/components/Header";

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
  const [searchValue, setSearchValue] = useState(searchQuery || "");
  const [importValue, setImportValue] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

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

  return (
    <Header title="Work Orders">
      <div className="flex items-center gap-4 w-full max-w-2xl">
        {/* Search field with icon */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search work order..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10 w-full bg-gray-50 border-gray-200"
          />
        </div>
        
        <div className="flex flex-row gap-3 flex-shrink-0">
          {/* Import section with better visual grouping */}
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Import Order#"
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-44 bg-gray-50 border-gray-200"
            />
            <Button 
              className="ml-2 whitespace-nowrap"
              onClick={handleImport}
              disabled={isImporting}
              variant="default"
            >
              <Import className="h-4 w-4 mr-2" />
              Import
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
