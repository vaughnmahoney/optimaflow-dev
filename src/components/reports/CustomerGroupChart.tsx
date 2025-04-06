
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { TimeMetric } from "@/hooks/useReportsStats";

interface CustomerGroupChartProps {
  customerData: TimeMetric[];
  isLoading: boolean;
}

export const CustomerGroupChart: React.FC<CustomerGroupChartProps> = ({
  customerData,
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Customer Group Analysis</CardTitle>
          <CardDescription>Loading customer group data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (customerData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Customer Group Analysis</CardTitle>
          <CardDescription>No customer group data available</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px] text-muted-foreground">
          No customer group data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customer Group Analysis</CardTitle>
        <CardDescription>
          Service count and average duration by customer group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={customerData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Service Count" />
              <Bar yAxisId="right" dataKey="avgDuration" fill="#82ca9d" name="Avg. Duration (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
