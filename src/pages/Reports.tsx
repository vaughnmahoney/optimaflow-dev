
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFetchReports } from "@/hooks/useFetchReports";
import { Loader2, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const Reports = () => {
  const { fetchReports, isLoading, results } = useFetchReports();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 2, 31)); // March 31, 2025 (month is 0-indexed)
  
  // Format date as YYYY-MM-DD
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  const handleFetchReports = () => {
    fetchReports(formattedDate);
  };
  
  return (
    <Layout title="Reports">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Fetch Reports from OptimoRoute</CardTitle>
            <CardDescription>
              Retrieve data from OptimoRoute for a specific date and store it in the reports table.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Report Date</label>
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
              </div>
              
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
    </Layout>
  );
};

export default Reports;
