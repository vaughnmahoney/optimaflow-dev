
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface DateRangeStepProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: React.Dispatch<React.SetStateAction<{ 
    from: Date | undefined; 
    to: Date | undefined 
  }>>;
}

export const DateRangeStep: React.FC<DateRangeStepProps> = ({
  dateRange,
  setDateRange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Date Range</h3>
      <p className="text-sm text-muted-foreground">
        Choose the time period for your report
      </p>
      
      <div className="flex flex-col md:flex-row gap-6 mt-4">
        <Card className="flex-1">
          <CardContent className="p-4">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="mx-auto"
            />
          </CardContent>
        </Card>
        
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Selected Range</h4>
              {dateRange.from ? (
                <div>
                  <p className="text-2xl font-bold">
                    {dateRange.from && format(dateRange.from, "MMMM d, yyyy")}
                  </p>
                  {dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime() && (
                    <>
                      <p className="text-sm mt-1">to</p>
                      <p className="text-2xl font-bold">
                        {format(dateRange.to, "MMMM d, yyyy")}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No date range selected</p>
              )}
            </CardContent>
          </Card>
          
          <div className="text-sm text-muted-foreground">
            <p>Tips:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Click once to select a single date</li>
              <li>Click and drag to select a range</li>
              <li>Use navigation arrows to change months</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
