
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobsCompletedStats } from "@/hooks/useJobsCompletedStats";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2, FileText, ChartBar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DiagnosticChart = () => {
  const { 
    diagnosticData,
    isLoading, 
    error 
  } = useJobsCompletedStats();

  // Prepare data for the bar chart
  const dataFlowSteps = [
    { 
      name: "Total Records", 
      value: diagnosticData.totalRecords,
      description: "All records fetched from the database for the current week" 
    },
    { 
      name: "With Status", 
      value: diagnosticData.recordsWithStatus,
      description: "Records that have an optimoroute_status field" 
    },
    { 
      name: "With End Time", 
      value: diagnosticData.recordsWithEndTime,
      description: "Records that have an end_time field" 
    },
    { 
      name: "Valid Dates", 
      value: diagnosticData.recordsWithValidDates,
      description: "Records with properly formatted dates" 
    },
    { 
      name: "Processed", 
      value: diagnosticData.processedRecords,
      description: "Records with 'success' status that were counted" 
    }
  ];

  // Prepare status distribution data
  const statusDistribution = Object.entries(diagnosticData.statuses || {}).map(([status, count]) => ({
    name: status,
    value: count
  })).sort((a, b) => b.value - a.value);

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Data Flow Diagnostic Chart</CardTitle>
        <CardDescription>Visualizing data processing steps to identify where records might be lost</CardDescription>
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
            <div className="space-y-8">
              {/* First section: Data Flow Chart */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ChartBar className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold">Data Flow Pipeline</h3>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataFlowSteps}>
                      <XAxis 
                        dataKey="name" 
                        fontSize={12} 
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip 
                        formatter={(value) => [`${value} records`, '']}
                        labelFormatter={(label) => label}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const step = dataFlowSteps.find(step => step.name === label);
                            return (
                              <div className="bg-white p-2 border rounded-md shadow-sm">
                                <p className="font-medium">{label}</p>
                                <p className="text-sm">{payload[0].value} records</p>
                                <p className="text-xs text-muted-foreground mt-1">{step?.description}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Record Count" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Second section: Status Distribution */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold">Status Distribution</h3>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusDistribution} layout="vertical">
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={80}
                        tick={props => {
                          const { x, y, payload } = props;
                          return (
                            <text x={x} y={y} dy={4} textAnchor="end" fill="#666" fontSize={12}>
                              {payload.value}
                            </text>
                          );
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} records`, '']}
                        labelFormatter={(label) => `Status: ${label}`}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Count" 
                        fill="#10b981" 
                        radius={[0, 4, 4, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Summary section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-2">Data Loss Summary</h3>
                <div className="flex flex-wrap gap-2">
                  {diagnosticData.totalRecords > 0 && (
                    <Badge variant="outline" className="bg-slate-50">
                      Total: {diagnosticData.totalRecords}
                    </Badge>
                  )}
                  
                  {diagnosticData.totalRecords > 0 && diagnosticData.recordsWithStatus < diagnosticData.totalRecords && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-800">
                      Missing Status: {diagnosticData.totalRecords - diagnosticData.recordsWithStatus}
                    </Badge>
                  )}
                  
                  {diagnosticData.totalRecords > 0 && diagnosticData.recordsWithEndTime < diagnosticData.totalRecords && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-800">
                      Missing End Time: {diagnosticData.totalRecords - diagnosticData.recordsWithEndTime}
                    </Badge>
                  )}
                  
                  {diagnosticData.recordsWithEndTime > 0 && diagnosticData.recordsWithValidDates < diagnosticData.recordsWithEndTime && (
                    <Badge variant="outline" className="bg-rose-50 text-rose-800">
                      Invalid Dates: {diagnosticData.recordsWithEndTime - diagnosticData.recordsWithValidDates}
                    </Badge>
                  )}
                  
                  {diagnosticData.recordsWithStatus > 0 && diagnosticData.processedRecords < diagnosticData.recordsWithStatus && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-800">
                      Non-Success Status: {diagnosticData.recordsWithStatus - diagnosticData.processedRecords}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
