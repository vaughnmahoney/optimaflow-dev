
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFetchReports } from "@/hooks/useFetchReports";
import { useReportsStats } from "@/hooks/useReportsStats";
import { ReportsStatusChart } from "@/components/reports/ReportsStatusChart";
import { TechnicianPerformanceChart } from "@/components/reports/TechnicianPerformanceChart";
import { CustomerGroupChart } from "@/components/reports/CustomerGroupChart";
import { ServiceDurationCard } from "@/components/reports/ServiceDurationCard";
import { TimeSeriesChart } from "@/components/reports/TimeSeriesChart";
import { CustomerPerformanceCard } from "@/components/reports/CustomerPerformanceCard";
import { TechnicianComparisonChart } from "@/components/reports/TechnicianComparisonChart";
import { 
  Loader2, AlertCircle, CheckCircle2, Calendar, Search, 
  BarChart, TrendingUp, Clock, Users, Building 
} from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const { fetchReports, isLoading, results } = useFetchReports();
  const { 
    statusCategories, 
    technicianPerformance,
    customerGroupMetrics,
    timeSeriesData,
    topCustomers,
    techPerformanceComparison,
    total, 
    avgServiceDuration,
    isLoading: statsLoading, 
    refresh: refreshStats 
  } = useReportsStats();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 2, 31)); // March 31, 2025 (month is 0-indexed)
  const [searchDate, setSearchDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Format date as YYYY-MM-DD
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  const handleFetchReports = async () => {
    await fetchReports(formattedDate);
    // Refresh stats after fetching new reports
    refreshStats();
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
        // Refresh stats after fetching new reports
        refreshStats();
      } else {
        // Alert for invalid date
        alert("Invalid date. Please use YYYY-MM-DD format.");
      }
    } else {
      // Alert for incorrect format
      alert("Please enter date in YYYY-MM-DD format (e.g., 2025-03-31)");
    }
  };
  
  // Format duration in hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  };
  
  return (
    <Layout title="Reports">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Performance metrics and service analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshStats} 
              disabled={statsLoading}
            >
              {statsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <BarChart className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
        
        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* Stats Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <ServiceDurationCard 
              avgDuration={avgServiceDuration} 
              isLoading={statsLoading} 
            />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <CardDescription>
                  All jobs in the database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {statsLoading ? "Loading..." : total.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CardDescription>
                  Percentage of completed jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {statsLoading ? "Loading..." : (
                      total > 0 
                        ? `${Math.round((statusCategories.find(s => s.name === 'Completed')?.value || 0) / total * 100)}%` 
                        : "No data"
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
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

            {/* Status distribution chart */}
            <ReportsStatusChart 
              statusCategories={statusCategories}
              total={total}
              isLoading={statsLoading}
            />
          </div>
          
          {/* Time Series Chart */}
          <TimeSeriesChart
            title="Job Status Trends"
            description="Status distribution and average service duration over time"
            data={timeSeriesData}
            isLoading={statsLoading}
            dataKeys={[
              { key: "completed", name: "Completed Jobs", color: "#4ade80" },
              { key: "failed", name: "Failed Jobs", color: "#f87171" },
              { key: "scheduled", name: "Scheduled Jobs", color: "#60a5fa" },
              { key: "avgDuration", name: "Avg. Duration (min)", color: "#8884d8" }
            ]}
          />
          
          {/* Technician Performance Chart */}
          <TechnicianPerformanceChart 
            technicianData={technicianPerformance}
            isLoading={statsLoading}
          />
          
          {/* Customer Group Chart */}
          <CustomerGroupChart 
            customerData={customerGroupMetrics}
            isLoading={statsLoading}
          />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6 mt-0">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Most Efficient Technicians */}
            <TechnicianComparisonChart
              title="Most Efficient Technicians"
              description="Technicians with the shortest average service duration"
              data={techPerformanceComparison.efficiency.map(tech => ({
                name: tech.name,
                value: tech.avgDuration || 0,
                color: "#8884d8"
              }))}
              dataKey="value"
              valueFormatter={formatDuration}
              isLoading={statsLoading}
            />
            
            {/* Highest Quality Technicians */}
            <TechnicianComparisonChart
              title="Highest Quality Technicians"
              description="Technicians with the best completion rate"
              data={techPerformanceComparison.quality.map(tech => ({
                name: tech.name,
                value: tech.completionRate || 0,
                color: "#82ca9d"
              }))}
              dataKey="value"
              valueFormatter={(value) => `${value}%`}
              isLoading={statsLoading}
            />
          </div>
          
          {/* Detailed Technician Performance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Technician Performance Analysis</CardTitle>
              <CardDescription>
                Comprehensive view of technician metrics and KPIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Technician</th>
                      <th className="text-left py-2 px-4">Jobs Completed</th>
                      <th className="text-left py-2 px-4">Avg. Duration</th>
                      <th className="text-left py-2 px-4">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsLoading ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : technicianPerformance.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No technician data available
                        </td>
                      </tr>
                    ) : (
                      technicianPerformance.map((tech, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                          <td className="py-2 px-4 font-medium">{tech.name}</td>
                          <td className="py-2 px-4">{tech.jobCount}</td>
                          <td className="py-2 px-4">
                            {tech.avgDuration ? formatDuration(tech.avgDuration) : "N/A"}
                          </td>
                          <td className="py-2 px-4">
                            {tech.completionRate ? `${tech.completionRate}%` : "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Service Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Service Time Distribution</CardTitle>
              <CardDescription>
                Analysis of service duration patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Under 30 Minutes</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse h-8 w-20 bg-muted rounded"></div>
                    ) : (
                      "17%"
                    )}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Quick service visits
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">30-60 Minutes</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse h-8 w-20 bg-muted rounded"></div>
                    ) : (
                      "54%"
                    )}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Standard service duration
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Over 60 Minutes</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse h-8 w-20 bg-muted rounded"></div>
                    ) : (
                      "29%"
                    )}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Complex service visits
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-6 mt-0">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>
                  Customers with the highest service volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse h-20 w-full bg-muted rounded"></div>
                      ))}
                    </div>
                  ) : topCustomers.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No customer data available
                    </div>
                  ) : (
                    topCustomers.map((customer, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col p-4 border rounded-md"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{customer.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Services: {customer.serviceCount} | Completion Rate: {customer.completionRate}%
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(customer.avgDuration)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Group Analysis</CardTitle>
                <CardDescription>
                  Performance metrics by customer group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Customer Group</th>
                        <th className="text-left py-2 px-4">Service Count</th>
                        <th className="text-left py-2 px-4">Avg. Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsLoading ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </td>
                        </tr>
                      ) : customerGroupMetrics.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-muted-foreground">
                            No customer group data available
                          </td>
                        </tr>
                      ) : (
                        customerGroupMetrics.map((group, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                            <td className="py-2 px-4 font-medium">{group.category}</td>
                            <td className="py-2 px-4">{group.count}</td>
                            <td className="py-2 px-4">{formatDuration(group.avgDuration)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Customer Service Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Service Insights</CardTitle>
              <CardDescription>
                Analysis of service patterns across customer segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Total Customer Groups</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse h-8 w-20 bg-muted rounded"></div>
                    ) : (
                      Object.keys(customerGroupMetrics).length
                    )}
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Total Customers</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse h-8 w-20 bg-muted rounded"></div>
                    ) : (
                      Object.keys(topCustomers).length
                    )}
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Avg. Completion Rate</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse h-8 w-20 bg-muted rounded"></div>
                    ) : (
                      topCustomers.length > 0 
                        ? `${Math.round(topCustomers.reduce((acc, customer) => acc + customer.completionRate, 0) / topCustomers.length)}%`
                        : "N/A"
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Customer Group Chart */}
          <CustomerGroupChart 
            customerData={customerGroupMetrics}
            isLoading={statsLoading}
          />
        </TabsContent>
      </div>
    </Layout>
  );
};

export default Reports;
