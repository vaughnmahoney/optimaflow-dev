
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Import, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Work Orders</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search work order..."
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="flex flex-row gap-2">
            <div className="relative flex w-full sm:w-auto">
              <Input
                type="text"
                placeholder="Import Order#"
                value={importValue}
                onChange={(e) => setImportValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full sm:w-44"
              />
              <Button 
                className="ml-2 whitespace-nowrap"
                onClick={handleImport}
                disabled={isImporting}
              >
                <Import className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              className="flex-shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
