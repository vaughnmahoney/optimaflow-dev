
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

  // Simple button for both mobile and desktop
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
