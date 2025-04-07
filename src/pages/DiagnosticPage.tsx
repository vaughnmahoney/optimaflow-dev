
import React from 'react';
import { Layout } from "@/components/Layout";
import { DiagnosticChart } from "@/components/diagnostic/DiagnosticChart";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportsStats } from "@/hooks/useReportsStats";

const DiagnosticPage = () => {
  const { 
    statusCategories, 
    customerGroupMetrics,
    avgServiceDuration
  } = useReportsStats();

  return (
    <Layout title="System Diagnostics">
      <div className="space-y-6">
        <DiagnosticChart />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Order status distribution across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statusCategories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                    <span className="font-medium">{category.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Customer Group Metrics</CardTitle>
              <CardDescription>Average duration by customer group (minutes)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customerGroupMetrics.map((metric) => (
                  <div key={metric.category} className="flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{metric.category}</span>
                    <div className="flex items-center">
                      <span className="font-medium">{metric.avgDuration} min</span>
                      <span className="text-xs text-muted-foreground ml-2">({metric.count} orders)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DiagnosticPage;
