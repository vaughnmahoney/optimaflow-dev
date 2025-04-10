import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFetchReports } from "@/hooks/useFetchReports";
import { Loader2, AlertCircle, CheckCircle2, Calendar, Search } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { EndpointTabs } from "@/components/bulk-orders/EndpointTabs";
import { StatusBreakdownChart } from "@/components/reports/StatusBreakdownChart";
import { DriverFilter } from "@/components/reports/DriverFilter";
import { CustomerGroupFilter } from "@/components/reports/CustomerGroupFilter";
import { CustomerNameFilter } from "@/components/reports/CustomerNameFilter";
import { KpiSection } from "@/components/reports/kpis/KpiSection";

const Reports = () => {
  const { fetchReports, isLoading, results } = useFetchReports();
  
  // Date for fetching reports from OptimoRoute
  const [fetchDate, setFetchDate] = useState<Date | undefined>(new Date(2025, 2, 31)); // March 31, 2025 (month is 0-indexed)
  
  // Dedicated date for KPIs/analytics
  const [kpiDate, setKpiDate] = useState<Date | undefined>(new Date(2025, 2, 31)); // March 31, 2025 (month is 0-indexed)
  
  const [searchDate, setSearchDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("with-completion");
  
  // New state variables for global filters
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedCustomerGroups, setSelectedCustomerGroups] = useState<string[]>([]);
  const [selectedCustomerNames, setSelectedCustomerNames] = useState<string[]>([]);

  // Format date as YYYY-MM-DD for fetching reports
  const formattedFetchDate = fetchDate ? format(fetchDate, 'yyyy-MM-dd') : '';
  
  const handleFetchReports = async () => {
    await fetchReports(formattedFetchDate);
  };

  const handleSearchDate = async () => {
    // Check if searchDate is in a valid format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(searchDate)) {
      // Parse searchDate to create a Date object
      const [year, month, day] = searchDate.split('-').map(Number);
      // Adjust month index (subtract 1 as JS months are 0-indexed)
      const date = new Date(year, month - 1, day);
      
      // Verify the date is valid
      if (!isNaN(date.getTime())) {
        setFetchDate(date);
        await fetchReports(searchDate);
      } else {
        // Alert for invalid date
        alert("Invalid date. Please use YYYY-MM-DD format.");
      }
    } else {
      // Alert for incorrect format
      alert("Please enter date in YYYY-MM-DD format (e.g., 2025-03-31)");
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <Layout title="Reports">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fetch Reports from OptimoRoute</CardTitle>
              <CardDescription>
                Retrieve data from OptimoRoute for a specific date and store it in the reports table.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <EndpointTabs activeTab={activeTab} onTabChange={handleTabChange} />
                </div>
                
                {/* Search Date Input & Report Date Picker */}
                <div className="flex flex-col md:flex-row gap-2 ml-auto items-start">
                  {/* Report Date Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full md:w-[240px] justify-start text-left font-normal",
                          !fetchDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {fetchDate ? format(fetchDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={fetchDate}
                        onSelect={setFetchDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <div className="relative flex items-center">
                    <Input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full md:w-[190px]"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSearchDate}
                    className="flex-shrink-0"
                    disabled={isLoading || !searchDate}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Date
                  </Button>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button 
                          onClick={handleFetchReports} 
                          disabled={isLoading || !fetchDate}
                          className="w-fit"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Fetching Reports...
                            </>
                          ) : (
                            `Fetch Reports for ${formattedFetchDate}`
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fetch reports from OptimoRoute for the selected date</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {results && (
                  <div className="mt-4">
                    <Alert variant={results.success ? "default" : "destructive"}>
                      {results.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      <AlertTitle>{results.success ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>
                        {results.success 
                          ? (results.message || `Successfully updated ${results.count || 'multiple'} reports`)
                          : (results.error || 'Unknown error')}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
              <p>
                This function calls the OptimoRoute API to fetch route data for the selected date and updates the reports table.
              </p>
            </CardFooter>
          </Card>
          
          {/* Filter Controls Section */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Global Filters</label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Filter Placeholders */}
              <div className="flex flex-col sm:flex-row gap-2 items-start">
                <DriverFilter selectedDrivers={selectedDrivers} setSelectedDrivers={setSelectedDrivers} />
                <CustomerGroupFilter selectedCustomerGroups={selectedCustomerGroups} setSelectedCustomerGroups={setSelectedCustomerGroups} />
                <CustomerNameFilter selectedCustomerNames={selectedCustomerNames} setSelectedCustomerNames={setSelectedCustomerNames} />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Controls Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>KPI Analytics</CardTitle>
            <CardDescription>
              View key performance indicators for the selected date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start mb-4">
              {/* Dedicated KPI Date Picker */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium">KPI Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !kpiDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {kpiDate ? format(kpiDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={kpiDate}
                      onSelect={setKpiDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* KPI Cards Section */}
            <div className="mt-6">
              <KpiSection
                reportDate={kpiDate ? format(kpiDate, 'yyyy-MM-dd') : null}
                selectedDrivers={selectedDrivers}
                selectedCustomerGroups={selectedCustomerGroups}
                selectedCustomerNames={selectedCustomerNames}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Status Breakdown Chart Section */}
        <div className="mt-6">
          <StatusBreakdownChart 
            chartSelectedDate={kpiDate}
            selectedDrivers={selectedDrivers}
            selectedCustomerGroups={selectedCustomerGroups}
            selectedCustomerNames={selectedCustomerNames} 
          /> 
        </div>

      </div>
    </Layout>
  );
};

export default Reports;
