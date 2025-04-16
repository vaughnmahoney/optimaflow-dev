
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobsCompletedStats } from "@/hooks/useJobsCompletedStats";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";

export const JobsCompletedCard = () => {
  const { 
    currentWeekTotal, 
    percentageChange, 
    dailyCounts, 
    isLoading, 
    error 
  } = useJobsCompletedStats();

  const isPositiveChange = percentageChange >= 0;

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Jobs Completed This Week</CardTitle>
        <CardDescription>Weekly completion metrics and daily breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex h-[200px] items-center justify-center text-destructive">
            <p>Error loading data: {error}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="text-3xl font-bold">{currentWeekTotal}</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  {isPositiveChange ? (
                    <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4 text-rose-500" />
                  )}
                  <span className={isPositiveChange ? "text-emerald-500" : "text-rose-500"}>
                    {isPositiveChange ? "+" : ""}{percentageChange.toFixed(1)}%
                  </span>
                  <span className="ml-1">from last week</span>
                </div>
              </div>
            </div>
            <div className="mt-4 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyCounts}>
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={(value) => value.substring(0, 3)} 
                    fontSize={12} 
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    formatter={(value) => [`${value} jobs`, 'Completed']}
                    labelFormatter={(label) => label}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Jobs Completed" 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
