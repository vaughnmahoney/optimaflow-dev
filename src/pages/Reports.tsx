
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
import { JobsCompletedCard } from "@/components/reports/JobsCompletedCard";

const Reports = () => {
  const { fetchReports, isLoading, results } = useFetchReports();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 2, 31)); // March 31, 2025 (month is 0-indexed)
  const [searchDate, setSearchDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("with-completion");
  
  // Format date as YYYY-MM-DD
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  const handleFetchReports = async () => {
    await fetchReports(formattedDate);
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
        setSelectedDate(date);
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
        
        {/* KPI Section */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <JobsCompletedCard />
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
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Report Date</label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <div className="flex flex-col md:flex-row gap-2">
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
                  </div>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button 
                          onClick={handleFetchReports} 
                          disabled={isLoading || !selectedDate}
                          className="w-fit"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Fetching Reports...
                            </>
                          ) : (
                            `Fetch Reports for ${formattedDate}`
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
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
