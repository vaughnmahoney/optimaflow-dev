import React from 'react';
import { useReportStatusStats } from '@/hooks/useReportStatusStats';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_COLORS: { [key: string]: string } = {
  Success: '#22c55e', // green-500
  Failed: '#ef4444', // red-500
  Pending: '#f97316', // orange-500
  Cancelled: '#64748b', // slate-500
  'In Progress': '#3b82f6', // blue-500
  Unknown: '#a1a1aa', // zinc-400
};

const DEFAULT_COLOR = '#a1a1aa'; // Default color for unmapped statuses

interface StatusBreakdownChartProps {
  chartSelectedDate?: Date;
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
}

export const StatusBreakdownChart: React.FC<StatusBreakdownChartProps> = ({
  chartSelectedDate,
  selectedDrivers,
  selectedCustomerGroups,
  selectedCustomerNames,
}) => {
  const formattedChartDate = chartSelectedDate ? format(chartSelectedDate, 'yyyy-MM-dd') : null;

  const { isLoading, statusData, error } = useReportStatusStats(
    formattedChartDate, 
    selectedDrivers, 
    selectedCustomerGroups, 
    selectedCustomerNames
  );

  const chartData = statusData?.map(item => ({
    ...item,
    name: item.status || 'Unknown', // Use 'Unknown' for null status display
  })) || [];

  const renderContent = () => {
    console.log(`[StatusBreakdownChart] Rendering with chartData:`, chartData);
    
    if (!formattedChartDate) { 
      return (
        <div className="flex items-center justify-center h-60 text-muted-foreground">
          Select a date to view status breakdown.
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Chart</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-60 text-muted-foreground">
          No report data found for {formattedChartDate}.
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}> 
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60} // Donut chart effect
            outerRadius={100}
            fill="#8884d8" // Default fill, overridden by Cell
            paddingAngle={2}
            dataKey="count"
            nameKey="name" // Use the formatted 'name' field
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.name] || DEFAULT_COLOR}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} orders`, name]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start"> 
          <div>
            <CardTitle>Daily Status Breakdown</CardTitle>
            <CardDescription>
              Status distribution for {formattedChartDate || 'selected date'}.
              {(selectedDrivers.length > 0 || selectedCustomerGroups.length > 0 || selectedCustomerNames.length > 0) && 
                <span className="block text-xs text-muted-foreground mt-1">
                  Filtered by: 
                  {selectedDrivers.length > 0 && ` ${selectedDrivers.length} Drivers`}
                  {selectedCustomerGroups.length > 0 && `, ${selectedCustomerGroups.length} Groups`}
                  {selectedCustomerNames.length > 0 && `, ${selectedCustomerNames.length} Names`}
                </span>
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};
