
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const WorkOrderHeader = () => {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["workOrders"] });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Work Orders</h1>
        <p className="text-sm text-muted-foreground">
          Manage and review work orders
        </p>
      </div>
      <Button onClick={handleRefresh} variant="outline" size="icon">
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};
