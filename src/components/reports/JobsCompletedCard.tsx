
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobsCompletedStats } from "@/hooks/useJobsCompletedStats";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2, TrendingDown, TrendingUp, BarChart3, LineChart as LineChartIcon, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const JobsCompletedCard = () => {
  const { 
    currentWeekTotal, 
    percentageChange, 
    dailyCounts, 
    isLoading, 
    error 
  } = useJobsCompletedStats();
  
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [timeframe, setTimeframe] = useState<'week'>('week');

  const isPositiveChange = percentageChange >= 0;

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base font-medium">Jobs Completed This Week</CardTitle>
            <CardDescription>Weekly completion metrics and daily breakdown</CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant={chartType === 'bar' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setChartType('bar')}
              className="px-2 h-8"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={chartType === 'line' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setChartType('line')}
              className="px-2 h-8"
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="px-2 h-8">
                  <Info className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">About this chart</h4>
                  <p className="text-sm text-muted-foreground">
                    This chart shows the total number of jobs completed each day during the current week.
                    The trend indicator compares to the previous week's performance.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
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
              
              <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as 'week')}>
                <TabsList className="h-8">
                  <TabsTrigger value="week" className="px-3 text-xs">This Week</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="mt-4 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
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
                ) : (
                  <LineChart data={dailyCounts}>
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
                    <Line 
                      type="monotone"
                      dataKey="count" 
                      name="Jobs Completed" 
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
