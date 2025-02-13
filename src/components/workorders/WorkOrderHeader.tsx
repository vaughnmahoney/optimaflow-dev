
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings2 } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export const WorkOrderHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-primary">QC Dashboard</h2>
        <p className="mt-2 text-sm text-gray-600">
          Review and approve completed work orders
        </p>
      </div>
      <div className="flex items-center gap-4">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="text-sm">
              Auto-refreshes every 15 minutes. Click to refresh now.
            </p>
          </HoverCardContent>
        </HoverCard>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Customize Columns
        </Button>
      </div>
    </div>
  );
};
