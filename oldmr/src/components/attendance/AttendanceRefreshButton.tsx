import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const AttendanceRefreshButton = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["attendance"] });
      await queryClient.refetchQueries({ queryKey: ["attendance"] });
      toast({
        title: "Success",
        description: "Attendance records refreshed",
      });
    } catch (error: any) {
      console.error("Error refreshing attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh attendance records",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleRefresh} variant="outline" className="gap-2">
      <RefreshCw className="h-4 w-4" />
      Refresh
    </Button>
  );
};