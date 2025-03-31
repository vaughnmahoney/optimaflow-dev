
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Import, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  const handleRefresh = () => {
    // Use the onRefresh prop if provided, otherwise fall back to invalidating the query
    if (onRefresh) {
      onRefresh();
    } else {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    }
    toast.success("Work orders refreshed");
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
                  onKeyPress={handleKeyPress}
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
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
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
          onKeyPress={handleKeyPress}
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
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
};
