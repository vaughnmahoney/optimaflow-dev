
import React from 'react';
import { KpiCard } from './KpiCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChartIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type StatusProps = {
  chartSelectedDate: Date | undefined;
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
};

// Mocked data - replace with actual API call
const useStatusData = (props: StatusProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Mock data
  const data = [
    { name: 'Completed', value: 120, color: '#4ade80' },
    { name: 'Flagged', value: 15, color: '#f87171' },
    { name: 'In Progress', value: 30, color: '#60a5fa' }
  ];
  
  return {
    isLoading,
    data,
    total: data.reduce((acc, item) => acc + item.value, 0)
  };
};

export const StatusBreakdownCard: React.FC<StatusProps> = (props) => {
  const { isLoading, data, total } = useStatusData(props);
  
  const calculatePercentage = (value: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  const tableData = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Count</TableHead>
          <TableHead>Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.name}>
            <TableCell className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </TableCell>
            <TableCell>{item.value}</TableCell>
            <TableCell>{calculatePercentage(item.value)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <KpiCard
      title="Status Distribution"
      value={isLoading ? "..." : total}
      subtitle="Total Jobs"
      icon={<PieChartIcon className="h-5 w-5" />}
      loading={isLoading}
      chart={
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} jobs`, 'Count']} />
          </PieChart>
        </ResponsiveContainer>
      }
      tableData={tableData}
      cardSize="md"
    />
  );
};
