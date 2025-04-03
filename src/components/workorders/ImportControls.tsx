
// This component is no longer directly used, as the refresh functionality
// is now integrated directly into the PaginationIndicator component
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAutoImport } from "@/hooks/useAutoImport";

interface ImportControlsProps {
  onRefresh?: () => void;
}

export const ImportControls = ({ 
  onRefresh 
}: ImportControlsProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { isImporting: isAutoImporting, runAutoImport } = useAutoImport();

  const handleRefresh = async () => {
    if (isRefreshing || isAutoImporting) return;
    
    setIsRefreshing(true);
    
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      }
      
      const importSuccess = await runAutoImport();
      
      if (!importSuccess) {
        toast.success("Work orders refreshed");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh work orders");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={handleRefresh}
      disabled={isRefreshing || isAutoImporting}
      className="h-8 w-8"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing || isAutoImporting ? 'animate-spin' : ''}`} />
      <span className="sr-only">{isRefreshing || isAutoImporting ? 'Refreshing...' : 'Refresh'}</span>
    </Button>
  );
};
