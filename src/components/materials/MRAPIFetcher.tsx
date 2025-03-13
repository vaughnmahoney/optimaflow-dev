
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Database } from "lucide-react";
import { toast } from "sonner";
import { useMRStore } from "@/hooks/materials/useMRStore";
import { DateRangePicker } from "@/components/bulk-orders/DateRangePicker";
import { useMaterialsApi } from "@/hooks/materials/useMaterialsApi";

export const MRAPIFetcher = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { setMaterialsData, setRawNotes, setTechnicianName } = useMRStore();
  const { isLoading, extractMaterialsFromOrders } = useMaterialsApi();

  const handleFetchOrders = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const result = await extractMaterialsFromOrders(startDate, endDate);
    
    if (result.error) {
      toast.error(`Error: ${result.error}`);
      return;
    }
    
    if (result.materialItems.length === 0) {
      toast.warning("No material items found in the work orders' notes");
      return;
    }
    
    // Store the extracted data
    setMaterialsData(result.materialItems);
    setRawNotes(result.noteStrings);
    setTechnicianName(result.technicianName);
    
    toast.success(`Successfully extracted ${result.materialItems.length} material items from ${result.noteStrings.length} work orders`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fetch Materials via API</CardTitle>
        <CardDescription>
          Fetch materials requirements directly from OptimoRoute work orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        
        <div className="flex items-center gap-4 mt-4">
          <Button 
            variant="default" 
            className="w-full"
            onClick={handleFetchOrders}
            disabled={isLoading || !startDate || !endDate}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Fetch Work Orders
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
