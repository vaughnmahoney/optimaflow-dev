
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useFetchReports } from "@/hooks/useFetchReports";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ReportsFetchControl = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { fetchReports, isLoading, results } = useFetchReports();

  const handleFetch = () => {
    if (!date) return;
    const formattedDate = format(date, 'yyyy-MM-dd');
    fetchReports(formattedDate);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Fetch Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="grid gap-2 flex-1">
            <label className="text-sm font-medium">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-[200px] justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            onClick={handleFetch} 
            disabled={isLoading || !date}
            className="mt-2 md:mt-0 md:self-end"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              'Fetch Reports'
            )}
          </Button>
        </div>
        
        {results && (
          <div className={`mt-4 text-sm p-3 rounded-md ${results.success ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            <p className="font-medium">{results.message}</p>
            {results.count !== undefined && (
              <p className="mt-1">Updated {results.count} reports</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
