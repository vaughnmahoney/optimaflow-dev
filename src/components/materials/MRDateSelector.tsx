
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BatchProcessingStats } from "@/components/bulk-orders/types";
import { FetchProgressBar } from "../bulk-orders/FetchProgressBar";
import { GetRoutesParams } from "@/services/optimoroute/getRoutesService";

interface MRDateSelectorProps {
  onFetchRoutes: (params: GetRoutesParams) => Promise<void>;
  onReset: () => void;
  isLoading: boolean;
  batchStats: BatchProcessingStats | null;
}

export const MRDateSelector = ({
  onFetchRoutes,
  onReset,
  isLoading,
  batchStats
}: MRDateSelectorProps) => {
  const [date, setDate] = useState<Date | undefined>();

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const handleFetchRoutes = async () => {
    if (!date) return;
    await onFetchRoutes({
      date: format(date, "yyyy-MM-dd")
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select Route Date</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "MMMM d, yyyy") : <span>Select a date...</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Button 
            onClick={handleFetchRoutes} 
            disabled={!date || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Routes...
              </>
            ) : (
              <>Fetch Routes</>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={onReset}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
        
        {isLoading && batchStats && (
          <FetchProgressBar 
            processing={isLoading}
            stats={batchStats}
          />
        )}
      </CardContent>
    </Card>
  );
};
