
import React from 'react';
import { KpiCard } from './KpiCard';
import { Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock hook - replace with real data
const useTechnicianData = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Mock data
  const data = {
    topTechnician: "John Smith",
    topCount: 42,
    averageJobsPerTech: 23,
    technicians: [
      { name: "John Smith", count: 42 },
      { name: "Maria Garcia", count: 37 },
      { name: "David Lee", count: 33 },
      { name: "Sarah Johnson", count: 30 },
      { name: "Michael Brown", count: 28 }
    ]
  };
  
  return {
    isLoading,
    ...data
  };
};

export const TechnicianPerformanceCard = () => {
  const { 
    isLoading, 
    topTechnician, 
    topCount, 
    averageJobsPerTech, 
    technicians 
  } = useTechnicianData();

  const tableData = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Technician</TableHead>
          <TableHead>Jobs Completed</TableHead>
          <TableHead>vs. Average</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {technicians.map((tech) => (
          <TableRow key={tech.name}>
            <TableCell>{tech.name}</TableCell>
            <TableCell>{tech.count}</TableCell>
            <TableCell className={tech.count > averageJobsPerTech ? 'text-emerald-600' : 'text-rose-600'}>
              {tech.count > averageJobsPerTech ? '+' : ''}{(tech.count - averageJobsPerTech).toFixed(0)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <KpiCard
      title="Technician Performance"
      value={isLoading ? "..." : topCount}
      subtitle={`Top Tech: ${topTechnician}`}
      icon={<Users className="h-5 w-5" />}
      loading={isLoading}
      chart={
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={technicians}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => value.split(' ')[0]} // Show only first name
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value) => [`${value} jobs`, 'Completed']}
              labelFormatter={(label) => label}
            />
            <Bar 
              dataKey="count" 
              fill="#8884d8" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      }
      tableData={tableData}
      cardSize="lg"
    />
  );
};
