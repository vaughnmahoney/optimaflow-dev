
import React, { useState } from 'react';
import { useTotalCompletedJobs } from '@/hooks/kpis/useTotalCompletedJobs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle, BarChart3, PieChart, Table, Download, ArrowUpDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartPieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface TotalJobsCompletedCardProps {
  reportDate: string | null;
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#64748b', '#a16207'];

/**
 * Component that displays the total jobs completed KPI with multiple visualization options
 */
export const TotalJobsCompletedCard: React.FC<TotalJobsCompletedCardProps> = ({
  reportDate,
  selectedDrivers,
  selectedCustomerGroups,
  selectedCustomerNames
}) => {
  // Default to showing by driver
  const [activeTab, setActiveTab] = useState<string>('by-driver');
  // View mode: chart (bar), pie, or table
  const [viewMode, setViewMode] = useState<'chart' | 'pie' | 'table'>('chart');
  // Sort mode for data 
  const [sortMode, setSortMode] = useState<'count-desc' | 'count-asc' | 'name-asc' | 'name-desc'>('count-desc');
  
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

  // Sort data based on selected sort mode
  const getSortedData = (data: { name: string; count: number }[]) => {
    if (!data) return [];
    
    const sortedData = [...data];
    
    switch (sortMode) {
      case 'count-desc':
        return sortedData.sort((a, b) => b.count - a.count);
      case 'count-asc':
        return sortedData.sort((a, b) => a.count - b.count);
      case 'name-asc':
        return sortedData.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sortedData.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sortedData;
    }
  };

  // Handle exporting data to CSV
  const handleExportData = () => {
    if (!data) return;
    
    const currentData = activeTab === 'by-driver' ? data.byDriver : data.byCustomerGroup;
    const csvContent = [
      `Name,Completed Jobs`,
      ...currentData.map(item => `${item.name.replace(/,/g, ' ')},${item.count}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jobs-completed-${activeTab}-${reportDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Data exported successfully');
  };

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
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            <Button 
              variant={viewMode === 'chart' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setViewMode('chart')}
              className="px-2"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'pie' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setViewMode('pie')}
              className="px-2"
            >
              <PieChart className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'table' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setViewMode('table')}
              className="px-2"
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Select 
              value={sortMode} 
              onValueChange={(value) => setSortMode(value as any)}
            >
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count-desc">Count (High-Low)</SelectItem>
                <SelectItem value="count-asc">Count (Low-High)</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportData}
              disabled={!data || data.totalCompleted === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="by-driver" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="by-driver">By Driver</TabsTrigger>
            <TabsTrigger value="by-customer">By Customer Group</TabsTrigger>
          </TabsList>
          
          <TabsContent value="by-driver" className="mt-2">
            {renderTabContent(
              getSortedData(data.byDriver), 
              'driver', 
              'No driver data available for the selected filters.'
            )}
          </TabsContent>
          
          <TabsContent value="by-customer" className="mt-2">
            {renderTabContent(
              getSortedData(data.byCustomerGroup), 
              'customer group', 
              'No customer group data available for the selected filters.'
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderTabContent = (
    items: { name: string; count: number }[],
    labelType: string,
    emptyMessage: string
  ) => {
    if (!items || items.length === 0) {
      return (
        <div className="flex items-center justify-center h-60 text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    switch(viewMode) {
      case 'chart':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={items}
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
                <YAxis allowDecimals={false} />
                <Tooltip 
                  formatter={(value) => [`${value} jobs`, 'Completed']}
                  labelFormatter={(label) => `${labelType === 'driver' ? 'Driver' : 'Customer Group'}: ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  name="Completed Jobs" 
                  fill={labelType === 'driver' ? "#22c55e" : "#3b82f6"} 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'pie':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartPieChart>
                <Pie
                  data={items}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {items.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} jobs`, 'Completed']}
                  labelFormatter={(label) => `${labelType === 'driver' ? 'Driver' : 'Customer Group'}: ${label}`}
                />
                <Legend />
              </RechartPieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'table':
        return (
          <div className="overflow-auto max-h-80">
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 font-medium text-muted-foreground border">
                    <div className="flex items-center space-x-1">
                      <span>{labelType === 'driver' ? 'Driver' : 'Customer Group'}</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-right p-2 font-medium text-muted-foreground border">
                    <div className="flex items-center justify-end space-x-1">
                      <span>Completed Jobs</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className={index % 2 ? 'bg-muted/50' : ''}>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 text-right border font-medium">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
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
