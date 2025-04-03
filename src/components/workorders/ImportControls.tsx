
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Import, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAutoImport } from "@/hooks/useAutoImport";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

interface ImportControlsProps {
  onOptimoRouteSearch: (value: string) => void;
  onRefresh?: () => void;
}

export const ImportControls = ({ 
  onOptimoRouteSearch,
  onRefresh 
}: ImportControlsProps) => {
  const [importValue, setImportValue] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { isImporting: isAutoImporting, runAutoImport } = useAutoImport();

  const handleImport = async () => {
    if (!importValue.trim()) return;

    setIsImporting(true);
    try {
      // Call the onOptimoRouteSearch with the import value
      onOptimoRouteSearch(importValue.trim());
      
      // Clear the import field after successful import
      setImportValue("");
      
      // Close the search sheet if on mobile
      if (isMobile) {
        setIsSearchOpen(false);
      }
      
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

  const handleRefresh = async () => {
    if (isRefreshing || isAutoImporting) return;
    
    setIsRefreshing(true);
    
    try {
      // First refresh the current data
      if (onRefresh) {
        await onRefresh();
      } else {
        // Fallback to just invalidating the cache if no refresh function provided
        await queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      }
      
      // Then run the auto import to check for new orders
      const importSuccess = await runAutoImport();
      
      if (!importSuccess) {
        // If auto-import didn't report success but the refresh worked, still show success message
        toast.success("Work orders refreshed");
      }
      // If importSuccess is true, the auto-import will have shown its own success message
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh work orders");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Mobile UI
  if (isMobile) {
    return (
      <div className="flex justify-end gap-2 mb-4">
        <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              <Import className="h-4 w-4" />
              <span className="sr-only">Import Order</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="pt-10">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium">Import Order</h3>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Enter Order #"
                  value={importValue}
                  onChange={(e) => setImportValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleImport()}
                  className="flex-1"
                  autoFocus
                />
                <SheetClose asChild>
                  <Button size="sm" variant="ghost">
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetClose>
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  onClick={handleImport}
                  disabled={isImporting}
                >
                  <Import className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || isAutoImporting}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing || isAutoImporting ? 'animate-spin' : ''}`} />
          <span className="ml-2">{isRefreshing || isAutoImporting ? 'Please wait...' : 'Refresh'}</span>
        </Button>
      </div>
    );
  }

  // Desktop UI
  return (
    <div className="flex items-center justify-between mb-4 bg-card p-4 rounded-md shadow-sm border">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Import Order#"
          value={importValue}
          onChange={(e) => setImportValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleImport()}
          className="w-44"
        />
        <Button 
          onClick={handleImport}
          disabled={isImporting}
        >
          <Import className="h-4 w-4 mr-2" />
          Import
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing || isAutoImporting}
          className="flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing || isAutoImporting ? 'animate-spin' : ''}`} />
          {isRefreshing || isAutoImporting ? 'Please wait...' : 'Refresh & Import'}
        </Button>
      </div>
    </div>
  );
};
