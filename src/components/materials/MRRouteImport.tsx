
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { 
  Calendar as CalendarIcon, 
  Upload, 
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { useMRStore } from "@/store/useMRStore";
import { getRoutes } from "@/services/material-requirements/getRoutesService";
import { getBatchOrderDetails } from "@/services/material-requirements/getOrderDetailService";
import { processBatchOrderDetails } from "./utils/materialParser";

export const MRRouteImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const {
    setDrivers,
    setMaterialItems,
    setRawNotes,
    dateSelected,
    setDateSelected,
    updateMaterialStats,
    clearAll
  } = useMRStore();
  
  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDateSelected(date);
      setIsCalendarOpen(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real implementation, we would process the Excel file here
    toast.info("Excel file upload not implemented yet");
  };
  
  // Handle API import
  const handleApiImport = async () => {
    if (!dateSelected) {
      toast.error("Please select a date first");
      return;
    }
    
    setIsLoading(true);
    // Clear previous data
    clearAll();
    setDateSelected(dateSelected);
    
    try {
      // Step 1: Fetch routes for the selected date
      const { data: routes, error: routesError } = await getRoutes(dateSelected);
      
      if (routesError || !routes) {
        toast.error(`Failed to fetch routes: ${routesError}`);
        setIsLoading(false);
        return;
      }
      
      if (routes.length === 0) {
        toast.warning("No routes found for the selected date");
        setIsLoading(false);
        return;
      }
      
      // Store the routes in our state
      setDrivers(routes);
      
      // Step 2: Extract all order numbers from the routes
      const orderNumbers: string[] = [];
      const orderToDriverMap: Record<string, string> = {};
      const storeInfoMap: Record<string, { storeId?: string; storeName?: string }> = {};
      
      routes.forEach(route => {
        route.stops.forEach(stop => {
          if (stop.orderNo) {
            orderNumbers.push(stop.orderNo);
            orderToDriverMap[stop.orderNo] = route.driverSerial;
            storeInfoMap[stop.orderNo] = {
              storeId: stop.storeId,
              storeName: stop.storeName
            };
          }
        });
      });
      
      if (orderNumbers.length === 0) {
        toast.warning("No orders found in the routes");
        setIsLoading(false);
        return;
      }
      
      // Step 3: Fetch order details for all orders
      const { data: orderDetails, error: orderDetailsError } = 
        await getBatchOrderDetails(orderNumbers);
      
      if (orderDetailsError || !orderDetails) {
        toast.error(`Failed to fetch order details: ${orderDetailsError}`);
        setIsLoading(false);
        return;
      }
      
      // Step 4: Store raw notes for debugging
      const rawNotes: Record<string, string> = {};
      Object.entries(orderDetails).forEach(([orderNo, detail]) => {
        if (detail.data && detail.data.notes) {
          rawNotes[orderNo] = detail.data.notes;
        }
      });
      setRawNotes(rawNotes);
      
      // Step 5: Process order details to extract materials
      const materials = processBatchOrderDetails(
        orderDetails,
        orderToDriverMap,
        storeInfoMap
      );
      
      // Step 6: Store materials and update stats
      setMaterialItems(materials);
      updateMaterialStats();
      
      toast.success(`Loaded ${materials.length} materials from ${orderNumbers.length} orders`);
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Selector */}
        <div className="space-y-2">
          <Label htmlFor="date-select">Select Date</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                id="date-select"
                variant="outline"
                className="w-full justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateSelected ? format(dateSelected, "MMMM d, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateSelected || undefined}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload Excel File</Label>
          <div className="flex">
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </div>
        </div>
        
        {/* API Import */}
        <div className="space-y-2">
          <Label>&nbsp;</Label>
          <Button
            className="w-full"
            onClick={handleApiImport}
            disabled={!dateSelected || isLoading}
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Loading..." : "Import from OptimoRoute"}
          </Button>
        </div>
      </div>
    </div>
  );
};
