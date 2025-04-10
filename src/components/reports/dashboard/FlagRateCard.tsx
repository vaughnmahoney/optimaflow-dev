
import React from 'react';
import { KpiCard } from './KpiCard';
import { AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// This would typically come from an API or hook
const useFlagRateData = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Mock data
  const data = {
    currentRate: 7.2,
    previousRate: 8.5,
    flaggedCount: 23,
    totalCount: 320,
    flagsByDay: [
      { day: 'Mon', rate: 5.4 },
      { day: 'Tue', rate: 3.8 },
      { day: 'Wed', rate: 8.2 },
      { day: 'Thu', rate: 10.5 },
      { day: 'Fri', rate: 7.1 },
      { day: 'Sat', rate: 6.4 },
      { day: 'Sun', rate: 9.8 }
    ]
  };
  
  return {
    isLoading,
    ...data
  };
};

export const FlagRateCard = () => {
  const { 
    isLoading, 
    currentRate, 
    previousRate, 
    flaggedCount, 
    totalCount, 
    flagsByDay 
  } = useFlagRateData();
  
  const percentChange = previousRate ? ((currentRate - previousRate) / previousRate) * 100 : 0;
  
  const tableData = (
    <div>
      <div className="p-4 bg-gray-50 rounded-lg mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Flagged Jobs</div>
            <div className="text-2xl font-bold">{flaggedCount}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total Jobs</div>
            <div className="text-2xl font-bold">{totalCount}</div>
          </div>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>Flag Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flagsByDay.map((day) => (
            <TableRow key={day.day}>
              <TableCell>{day.day}</TableCell>
              <TableCell>{day.rate.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <KpiCard
      title="Flag Rate"
      value={isLoading ? "..." : `${currentRate.toFixed(1)}%`}
      subtitle={`${flaggedCount} of ${totalCount} jobs flagged`}
      icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
      loading={isLoading}
      trend={{
        value: Math.abs(percentChange),
        timeframe: "previous period",
        isPositive: percentChange <= 0 // Lower flag rate is positive
      }}
      chart={
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={flagsByDay}>
            <XAxis 
              dataKey="day" 
              tickLine={false}
              axisLine={false}
            />
            <Bar 
              dataKey="rate" 
              fill="#f97316" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      }
      tableData={tableData}
    />
  );
};
