import React, { useState } from 'react';
import { useTotalCompletedJobs } from '@/hooks/kpis/useTotalCompletedJobs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TotalJobsCompletedCardProps {
  reportDate: string | null;
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
}

/**
 * Component that displays the total jobs completed KPI with bar charts
 */
export const TotalJobsCompletedCard: React.FC<TotalJobsCompletedCardProps> = ({
  reportDate,
  selectedDrivers,
  selectedCustomerGroups,
  selectedCustomerNames
}) => {
  // Default to showing by driver
  const [activeTab, setActiveTab] = useState<string>('by-driver');
  
  const { isLoading, data, error } = useTotalCompletedJobs(
    reportDate,
    selectedDrivers,
    selectedCustomerGroups,
    selectedCustomerNames
  );

  // Format the total with thousands separator
  const formattedTotal = data 
    ? data.totalCompleted.toLocaleString() 
    : '0';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!data || data.totalCompleted === 0) {
      return (
        <div className="flex items-center justify-center h-60 text-muted-foreground">
          No completed jobs found for the selected date and filters.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">Total Completed:</span>
            <div className="text-2xl font-bold">{formattedTotal}</div>
          </div>
          <div className="text-muted-foreground">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
        
        <Tabs defaultValue="by-driver" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="by-driver">By Driver</TabsTrigger>
            <TabsTrigger value="by-customer">By Customer Group</TabsTrigger>
          </TabsList>
          
          <TabsContent value="by-driver" className="mt-2">
            {data.byDriver.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.byDriver}
                    margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} jobs`, 'Completed']}
                      labelFormatter={(label) => `Driver: ${label}`}
                    />
                    <Bar dataKey="count" name="Completed Jobs" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-60 text-muted-foreground">
                No driver data available for the selected filters.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="by-customer" className="mt-2">
            {data.byCustomerGroup.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.byCustomerGroup}
                    margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} jobs`, 'Completed']}
                      labelFormatter={(label) => `Customer Group: ${label}`}
                    />
                    <Bar dataKey="count" name="Completed Jobs" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-60 text-muted-foreground">
                No customer group data available for the selected filters.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle>Total Jobs Completed</CardTitle>
        <CardDescription>Top completed jobs by driver and customer group</CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};
