
import React from 'react';
import { KpiCard } from './KpiCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarClock } from 'lucide-react';
import { useJobsCompletedStats } from '@/hooks/useJobsCompletedStats';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const JobsCompletedCard = () => {
  const { 
    currentWeekTotal, 
    percentageChange, 
    dailyCounts, 
    isLoading 
  } = useJobsCompletedStats();

  const tableData = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Day</TableHead>
          <TableHead>Jobs Completed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dailyCounts.map((day) => (
          <TableRow key={day.day}>
            <TableCell>{day.day}</TableCell>
            <TableCell>{day.count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <KpiCard
      title="Jobs Completed"
      value={isLoading ? "..." : currentWeekTotal}
      subtitle="This Week"
      icon={<CalendarClock className="h-5 w-5" />}
      loading={isLoading}
      trend={
        !isLoading && {
          value: percentageChange,
          timeframe: "last week",
          isPositive: percentageChange >= 0
        }
      }
      chart={
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={dailyCounts}>
            <XAxis 
              dataKey="day" 
              tickFormatter={(value) => value.substring(0, 3)} 
              tick={{ fontSize: 10 }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value) => [`${value} jobs`, 'Completed']}
              labelFormatter={(label) => label}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar 
              dataKey="count" 
              fill="#22c55e" 
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
