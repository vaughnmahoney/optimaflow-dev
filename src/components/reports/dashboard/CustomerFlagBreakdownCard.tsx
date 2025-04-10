
import React from 'react';
import { KpiCard } from './KpiCard';
import { Building, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Mock hook - replace with real data
const useCustomerFlagData = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Mock data
  const data = {
    highestFlagRate: "Riverside Apartments",
    highestRate: 23.5,
    customers: [
      { name: "Riverside Apartments", totalJobs: 34, flaggedJobs: 8, rate: 23.5 },
      { name: "Westside Mall", totalJobs: 42, flaggedJobs: 7, rate: 16.7 },
      { name: "Downtown Office Tower", totalJobs: 56, flaggedJobs: 6, rate: 10.7 },
      { name: "North High School", totalJobs: 29, flaggedJobs: 2, rate: 6.9 },
      { name: "Central Hospital", totalJobs: 68, flaggedJobs: 4, rate: 5.9 }
    ]
  };
  
  return {
    isLoading,
    ...data
  };
};

export const CustomerFlagBreakdownCard = () => {
  const { 
    isLoading, 
    highestFlagRate, 
    highestRate, 
    customers 
  } = useCustomerFlagData();

  // Sort by flag rate descending
  const sortedCustomers = [...customers].sort((a, b) => b.rate - a.rate);

  const getFlagRateColor = (rate: number) => {
    if (rate > 20) return 'text-rose-600';
    if (rate > 10) return 'text-amber-500';
    return 'text-emerald-600';
  };

  const tableData = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Total Jobs</TableHead>
          <TableHead>Flagged</TableHead>
          <TableHead>Flag Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedCustomers.map((customer) => (
          <TableRow key={customer.name}>
            <TableCell>{customer.name}</TableCell>
            <TableCell>{customer.totalJobs}</TableCell>
            <TableCell>{customer.flaggedJobs}</TableCell>
            <TableCell className={getFlagRateColor(customer.rate)}>
              {customer.rate.toFixed(1)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <KpiCard
      title="Customer Flag Breakdown"
      value={isLoading ? "..." : `${highestRate.toFixed(1)}%`}
      subtitle={`Highest: ${highestFlagRate}`}
      icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
      loading={isLoading}
      chart={
        <ResponsiveContainer width="100%" height={120}>
          <BarChart 
            data={sortedCustomers}
            layout="vertical"
            margin={{ left: 100 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category"
              tick={{ fontSize: 10 }}
              width={100}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'rate') return [`${value.toFixed(1)}%`, 'Flag Rate'];
                return [value, name];
              }}
              labelFormatter={(label) => label}
            />
            <Bar 
              dataKey="rate" 
              radius={[0, 4, 4, 0]} 
              barSize={16}
            >
              {sortedCustomers.map((entry, index) => {
                let fill = '#4ade80'; // Low rate (green)
                if (entry.rate > 20) fill = '#f87171'; // High rate (red)
                else if (entry.rate > 10) fill = '#fbbf24'; // Medium rate (amber)
                
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      }
      tableData={tableData}
      cardSize="lg"
    />
  );
};
