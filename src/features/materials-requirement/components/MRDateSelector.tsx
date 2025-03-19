
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { BatchProcessingStats } from "@/components/bulk-orders/types";
import { GetRoutesParams } from "../services/getRoutesService";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleFetchRoutes = async () => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    await onFetchRoutes({ date: formattedDate });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Select Date</label>
              <div className="flex w-full md:max-w-xs">
                <div className="relative flex-1">
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={format(selectedDate, "yyyy-MM-dd")}
                    onChange={(e) => handleDateChange(new Date(e.target.value))}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            {batchStats && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-md bg-blue-50 p-2">
                  <p className="text-xs text-blue-600">Orders</p>
                  <p className="text-lg font-medium">{batchStats.totalOrdersProcessed}</p>
                </div>
                <div className="rounded-md bg-green-50 p-2">
                  <p className="text-xs text-green-600">Successful</p>
                  <p className="text-lg font-medium">{batchStats.successfulBatches}/{batchStats.totalBatches}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 md:self-end">
            <Button variant="outline" onClick={onReset} disabled={isLoading}>
              Reset
            </Button>
            <Button onClick={handleFetchRoutes} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Get Materials
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
