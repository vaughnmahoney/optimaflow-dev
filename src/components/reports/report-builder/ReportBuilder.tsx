
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar as CalendarIcon, Filter, FileBarChart2, BarChart3, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DriverFilter } from "@/components/reports/DriverFilter";
import { CustomerGroupFilter } from "@/components/reports/CustomerGroupFilter";
import { CustomerNameFilter } from "@/components/reports/CustomerNameFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiSection } from "@/components/reports/kpis/KpiSection";
import { StatusBreakdownChart } from "@/components/reports/StatusBreakdownChart";
import { ReportFilterBox } from "./ReportFilterBox";
import { ReportResults } from "./ReportResults";
import { toast } from "sonner";

interface ReportBuilderProps {
  selectedDrivers: string[];
  setSelectedDrivers: (drivers: string[]) => void;
  selectedCustomerGroups: string[];
  setSelectedCustomerGroups: (groups: string[]) => void;
  selectedCustomerNames: string[];
  setSelectedCustomerNames: (names: string[]) => void;
  reportDate: string | null;
  setReportDate: (date: Date | undefined) => void;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  selectedDrivers,
  setSelectedDrivers,
  selectedCustomerGroups,
  setSelectedCustomerGroups,
  selectedCustomerNames,
  setSelectedCustomerNames,
  reportDate,
  setReportDate
}) => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState("dashboard");
  
  // Convert string date to Date object for the calendar
  const selectedDate = reportDate ? new Date(reportDate) : undefined;
  
  // Function to handle report generation
  const handleGenerateReport = () => {
    if (!reportDate) {
      toast.error("Please select a date for your report");
      return;
    }
    
    setIsGeneratingReport(true);
    
    // Simulate report generation - in a real app, this would call an API
    setTimeout(() => {
      setIsGeneratingReport(false);
      setReportGenerated(true);
      toast.success("Report generated successfully");
    }, 1500);
  };
  
  // Function to clear all filters
  const clearFilters = () => {
    setSelectedDrivers([]);
    setSelectedCustomerGroups([]);
    setSelectedCustomerNames([]);
    setReportDate(undefined);
    setReportGenerated(false);
    toast.info("All filters cleared");
  };
  
  // Function to export report data
  const exportReportData = () => {
    toast.success("Report data exported");
    // In a real app, this would generate and download a CSV/Excel file
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart2 className="h-5 w-5" />
            Report Builder
          </CardTitle>
          <CardDescription>
            Select filters and generate a custom report with detailed analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Date Selection */}
              <div className="flex flex-col space-y-1 flex-grow">
                <label className="text-sm font-medium">Report Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Select a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setReportDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                onClick={handleGenerateReport} 
                className="gap-2 w-full md:w-auto"
                size="lg"
                disabled={isGeneratingReport || !reportDate}
              >
                {isGeneratingReport ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full md:w-auto"
              >
                Clear Filters
              </Button>
            </div>
            
            <ReportFilterBox 
              title="Filters"
              description="Refine your report by selecting specific criteria"
              icon={<Filter className="h-4 w-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <DriverFilter selectedDrivers={selectedDrivers} setSelectedDrivers={setSelectedDrivers} />
                <CustomerGroupFilter selectedCustomerGroups={selectedCustomerGroups} setSelectedCustomerGroups={setSelectedCustomerGroups} />
                <CustomerNameFilter selectedCustomerNames={selectedCustomerNames} setSelectedCustomerNames={setSelectedCustomerNames} />
              </div>
            </ReportFilterBox>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {reportGenerated ? 
              `Report generated for ${reportDate}` : 
              "Select filters and click Generate Report to view analytics"
            }
          </div>
          
          {reportGenerated && (
            <Button variant="outline" onClick={exportReportData} className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {reportGenerated && (
        <div className="space-y-6">
          <Tabs defaultValue="dashboard" value={activeResultTab} onValueChange={setActiveResultTab}>
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="details">Detailed Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6 mt-4">
              <ReportResults>
                <KpiSection
                  reportDate={reportDate}
                  selectedDrivers={selectedDrivers}
                  selectedCustomerGroups={selectedCustomerGroups}
                  selectedCustomerNames={selectedCustomerNames}
                />
                
                <StatusBreakdownChart 
                  chartSelectedDate={selectedDate}
                  selectedDrivers={selectedDrivers}
                  selectedCustomerGroups={selectedCustomerGroups}
                  selectedCustomerNames={selectedCustomerNames} 
                />
              </ReportResults>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-6 mt-4">
              <ReportResults>
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Report Metrics</CardTitle>
                    <CardDescription>
                      Full breakdown of all metrics based on your filter criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-6 text-muted-foreground">
                      Detailed metrics display will be implemented in the next phase
                    </div>
                  </CardContent>
                </Card>
              </ReportResults>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
