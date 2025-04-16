
import React from 'react';
import { KpiCard } from './KpiCard';
import { Building } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock hook - replace with real data
const useTopCustomers = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Mock data
  const data = {
    topCustomer: "Metro Hospital",
    topCount: 45,
    customers: [
      { name: "Metro Hospital", count: 45 },
      { name: "Greenway Offices", count: 38 },
      { name: "Central School District", count: 32 },
      { name: "Lakeside Mall", count: 27 },
      { name: "City Government", count: 24 }
    ]
  };
  
  return {
    isLoading,
    ...data
  };
};

export const TopCustomersCard = () => {
  const { 
    isLoading, 
    topCustomer, 
    topCount, 
    customers 
  } = useTopCustomers();

  const tableData = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Jobs Completed</TableHead>
          <TableHead>% of Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => {
          const totalJobs = customers.reduce((sum, c) => sum + c.count, 0);
          const percentage = ((customer.count / totalJobs) * 100).toFixed(1);
          
          return (
            <TableRow key={customer.name}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.count}</TableCell>
              <TableCell>{percentage}%</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <KpiCard
      title="Top Customers"
      value={isLoading ? "..." : topCount}
      subtitle={`${topCustomer}`}
      icon={<Building className="h-5 w-5" />}
      loading={isLoading}
      chart={
        <ResponsiveContainer width="100%" height={120}>
          <BarChart 
            data={customers}
            layout="vertical"
            margin={{ left: 70 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category"
              tick={{ fontSize: 10 }}
              width={70}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value) => [`${value} jobs`, 'Completed']}
              labelFormatter={(label) => label}
            />
            <Bar 
              dataKey="count" 
              fill="#60a5fa" 
              radius={[0, 4, 4, 0]} 
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      }
      tableData={tableData}
      cardSize="md"
    />
  );
};
