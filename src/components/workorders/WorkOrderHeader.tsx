
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Import, RefreshCw, Search, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

interface WorkOrderHeaderProps {
  onOptimoRouteSearch: (value: string) => void;
}

export const WorkOrderHeader = ({ 
  onOptimoRouteSearch 
}: WorkOrderHeaderProps) => {
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
    queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    toast.success("Work orders refreshed");
  };

  // Mobile UI with Import button that opens a sheet
  if (isMobile) {
    return (
      <Header title="Work Orders">
        <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0 mr-1"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Import Order</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="pt-10">
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
                    <X className="h-4 w-4" />
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
          size="icon" 
          onClick={handleRefresh}
          className="flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </Header>
    );
  }

  // Desktop UI
  return (
    <Header title="Work Orders">
      <div className="flex items-center gap-4">
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
            <Import className="h-4 w-4 mr-1" />
            Import
          </Button>
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
    </Header>
  );
};
