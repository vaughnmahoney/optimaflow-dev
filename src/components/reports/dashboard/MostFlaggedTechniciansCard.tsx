
import React from 'react';
import { KpiCard } from './KpiCard';
import { AlertOctagon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// This would typically come from an API or hook
const useMostFlaggedTechs = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Mock data
  const data = {
    topTechnician: "Robert Taylor",
    topFlagCount: 8,
    flagRate: 12.5,
    technicians: [
      { name: "Robert Taylor", flagCount: 8, totalJobs: 64, rate: 12.5 },
      { name: "Jessica Adams", flagCount: 7, totalJobs: 82, rate: 8.5 },
      { name: "Thomas Wilson", flagCount: 6, totalJobs: 53, rate: 11.3 },
      { name: "Emily Davis", flagCount: 5, totalJobs: 71, rate: 7.0 },
      { name: "Daniel Martin", flagCount: 4, totalJobs: 47, rate: 8.5 }
    ]
  };
  
  return {
    isLoading,
    ...data
  };
};

export const MostFlaggedTechniciansCard = () => {
  const { 
    isLoading, 
    topTechnician, 
    topFlagCount,
    flagRate,
    technicians 
  } = useMostFlaggedTechs();

  const tableData = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Technician</TableHead>
          <TableHead>Flags</TableHead>
          <TableHead>Total Jobs</TableHead>
          <TableHead>Flag Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {technicians.map((tech) => (
          <TableRow key={tech.name}>
            <TableCell>{tech.name}</TableCell>
            <TableCell>{tech.flagCount}</TableCell>
            <TableCell>{tech.totalJobs}</TableCell>
            <TableCell>{tech.rate.toFixed(1)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <KpiCard
      title="Most Flagged Technicians"
      value={isLoading ? "..." : topFlagCount}
      subtitle={`${topTechnician} (${flagRate}% rate)`}
      icon={<AlertOctagon className="h-5 w-5 text-rose-500" />}
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
              formatter={(value) => [`${value} flags`, 'Flags']}
              labelFormatter={(label) => label}
            />
            <Bar 
              dataKey="flagCount" 
              fill="#f87171" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      }
      tableData={tableData}
      cardSize="md"
    />
  );
};
