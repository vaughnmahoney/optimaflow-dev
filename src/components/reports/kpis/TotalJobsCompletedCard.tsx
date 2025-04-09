import React, { useState, useRef } from 'react';
import { useTotalCompletedJobs } from '@/hooks/kpis/useTotalCompletedJobs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, AlertCircle, CheckCircle, BarChart3, PieChart, 
  Table, Download, ArrowUpDown, Search, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, RefreshCw, Filter, X
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, PieChart as RechartPieChart, 
  Pie, Cell, ReferenceLine 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent  
} from "@/components/ui/chart";

interface TotalJobsCompletedCardProps {
  reportDate: string | null;
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#64748b', '#a16207'];

/**
 * Component that displays the total jobs completed KPI with multiple visualization options
 * and enhanced interactivity
 */
export const TotalJobsCompletedCard: React.FC<TotalJobsCompletedCardProps> = ({
  reportDate,
  selectedDrivers,
  selectedCustomerGroups,
  selectedCustomerNames
}) => {
  const [activeTab, setActiveTab] = useState<string>('by-driver');
  const [viewMode, setViewMode] = useState<'chart' | 'pie' | 'table'>('chart');
  const [sortMode, setSortMode] = useState<'count-desc' | 'count-asc' | 'name-asc' | 'name-desc'>('count-desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [itemsToShow, setItemsToShow] = useState<number>(10);
  const [startIndex, setStartIndex] = useState<number>(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  
  const { isLoading, data, error } = useTotalCompletedJobs(
    reportDate,
    selectedDrivers,
    selectedCustomerGroups,
    selectedCustomerNames
  );

  const formattedTotal = data 
    ? data.totalCompleted.toLocaleString() 
    : '0';

  const filterData = (data: { name: string; count: number }[]) => {
    if (!searchTerm) return data;
    return data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

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

  const getCurrentData = () => {
    if (!data) return [];
    
    const baseData = activeTab === 'by-driver' ? data.byDriver : data.byCustomerGroup;
    const sortedData = getSortedData(baseData);
    const filteredData = filterData(sortedData);
    
    const endIndex = Math.min(startIndex + itemsToShow, filteredData.length);
    
    return filteredData.slice(startIndex, endIndex);
  };

  const getTotalItemCount = () => {
    if (!data) return 0;
    
    const baseData = activeTab === 'by-driver' ? data.byDriver : data.byCustomerGroup;
    return filterData(baseData).length;
  };

  const handleNext = () => {
    const totalItems = getTotalItemCount();
    const newStartIndex = Math.min(startIndex + Math.floor(itemsToShow / 2), totalItems - itemsToShow);
    setStartIndex(newStartIndex < 0 ? 0 : newStartIndex);
  };

  const handlePrevious = () => {
    const newStartIndex = startIndex - Math.floor(itemsToShow / 2);
    setStartIndex(newStartIndex < 0 ? 0 : newStartIndex);
  };

  React.useEffect(() => {
    setStartIndex(0);
  }, [activeTab, searchTerm, sortMode]);

  React.useEffect(() => {
    const totalItems = getTotalItemCount();
    if (startIndex + itemsToShow > totalItems) {
      setStartIndex(Math.max(0, totalItems - itemsToShow));
    }
  }, [itemsToShow]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartX;
    if (Math.abs(deltaX) > 10) {
      if (deltaX > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
      setDragStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

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
            <div className="relative">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 h-8 pl-8"
              />
              <Search className="h-4 w-4 absolute left-2 top-2 text-muted-foreground" />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 absolute right-2 top-2"
                  onClick={() => setSearchTerm('')}
                >
                  <span className="sr-only">Clear</span>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
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

        {viewMode === 'chart' && (
          <div className="flex items-center space-x-2 pt-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevious}
              disabled={startIndex <= 0}
              className="px-2 h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="relative flex-1">
              <Slider
                value={[itemsToShow]}
                min={5}
                max={20}
                step={1}
                onValueChange={(value) => setItemsToShow(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Zoom Out</span>
                <span>Zoom In</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNext}
              disabled={startIndex + itemsToShow >= getTotalItemCount()}
              className="px-2 h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="px-2 h-8">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Chart Controls</h4>
                  <p className="text-sm text-muted-foreground">
                    Drag the chart horizontally to scroll through data. Use the slider to adjust how many items to display at once.
                  </p>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 items-center gap-4">
                      <label htmlFor="itemsToShow" className="text-sm font-medium">
                        Items to show:
                      </label>
                      <Input
                        id="itemsToShow"
                        type="number"
                        value={itemsToShow}
                        onChange={(e) => setItemsToShow(Number(e.target.value))}
                        min={5}
                        max={20}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
        
        <Tabs defaultValue="by-driver" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="by-driver">By Driver</TabsTrigger>
            <TabsTrigger value="by-customer">By Customer Group</TabsTrigger>
          </TabsList>
          
          <TabsContent value="by-driver" className="mt-2">
            {renderTabContent(
              getCurrentData(), 
              'driver', 
              'No driver data available for the selected filters.'
            )}
            {viewMode === 'chart' && getTotalItemCount() > itemsToShow && (
              <div className="text-xs text-center text-muted-foreground mt-2">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsToShow, getTotalItemCount())} of {getTotalItemCount()} drivers
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="by-customer" className="mt-2">
            {renderTabContent(
              getCurrentData(), 
              'customer group', 
              'No customer group data available for the selected filters.'
            )}
            {viewMode === 'chart' && getTotalItemCount() > itemsToShow && (
              <div className="text-xs text-center text-muted-foreground mt-2">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsToShow, getTotalItemCount())} of {getTotalItemCount()} customer groups
              </div>
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
          {searchTerm ? `No ${labelType} found matching "${searchTerm}"` : emptyMessage}
        </div>
      );
    }

    switch(viewMode) {
      case 'chart':
        return (
          <div 
            ref={chartContainerRef}
            className="h-80 select-none cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <ChartContainer
              className="h-full"
              config={{
                jobs: {
                  label: "Completed Jobs",
                  theme: {
                    light: labelType === 'driver' ? "#22c55e" : "#3b82f6",
                    dark: labelType === 'driver' ? "#4ade80" : "#60a5fa"
                  }
                }
              }}
            >
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
                  
                  <ChartTooltip
                    content={
                      <ChartTooltipContent 
                        labelKey="name"
                        nameKey="jobs"
                      />
                    }
                  />
                  
                  <Bar 
                    dataKey="count" 
                    name="jobs" 
                    radius={[4, 4, 0, 0]} 
                    cursor="pointer"
                    className="stroke-background fill-[var(--color-jobs)]"
                    animationDuration={1000}
                    onClick={(data) => {
                      toast.info(`${data.name}: ${data.count} completed jobs`);
                    }}
                  />
                  
                  {items.length > 1 && (
                    <ReferenceLine 
                      y={Math.round(items.reduce((sum, item) => sum + item.count, 0) / items.length)} 
                      stroke="#888" 
                      strokeDasharray="3 3"
                      label={{ 
                        value: 'Avg', 
                        position: 'right',
                        fill: '#888',
                        fontSize: 12
                      }} 
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
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
                  animationDuration={800}
                  animationBegin={0}
                >
                  {items.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      onClick={() => {
                        toast.info(`${entry.name}: ${entry.count} completed jobs`);
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} jobs`, 'Completed']}
                  labelFormatter={(label) => `${labelType === 'driver' ? 'Driver' : 'Customer Group'}: ${label}`}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  onClick={(data) => {
                    toast.info(`${data.value}: ${items.find(item => item.name === data.value)?.count} completed jobs`);
                  }}
                />
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
                  <tr 
                    key={index} 
                    className={`${index % 2 ? 'bg-muted/50' : ''} hover:bg-muted/80 transition-colors`}
                    onClick={() => toast.info(`${item.name}: ${item.count} completed jobs`)}
                  >
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
        <CardDescription>
          Interactive view of completed jobs by driver and customer group
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};
