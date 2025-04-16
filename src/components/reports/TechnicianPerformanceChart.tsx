
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { TechnicianMetric } from "@/hooks/useReportsStats";

interface TechnicianPerformanceChartProps {
  technicianData: TechnicianMetric[];
  isLoading: boolean;
}

export const TechnicianPerformanceChart: React.FC<TechnicianPerformanceChartProps> = ({
  technicianData,
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Technician Performance</CardTitle>
          <CardDescription>Loading technician performance data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (technicianData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Technician Performance</CardTitle>
          <CardDescription>No technician data available</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px] text-muted-foreground">
          No technician performance data available.
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const chartData = technicianData.map(tech => ({
    name: tech.name,
    jobCount: tech.jobCount,
    avgDuration: tech.avgDuration || 0
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Technician Performance</CardTitle>
        <CardDescription>
          Job count and average service duration by technician
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="jobCount" fill="#8884d8" name="Job Count" />
              <Bar yAxisId="right" dataKey="avgDuration" fill="#82ca9d" name="Avg. Duration (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
