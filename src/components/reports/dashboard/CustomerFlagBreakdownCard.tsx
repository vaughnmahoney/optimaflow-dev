
import React from 'react';
import { KpiCard } from './KpiCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Building } from 'lucide-react';

// Sample data for the chart
const data = [
  { name: 'Walmart', value: (30) },
  { name: 'Target', value: (24) },
  { name: 'Costco', value: (16) },
  { name: 'Home Depot', value: (12) },
  { name: 'Others', value: (18) },
];

const COLORS = ['#8b5cf6', '#22c55e', '#f97316', '#ef4444', '#64748b'];

export const CustomerFlagBreakdownCard = () => {
  const isLoading = false;

  // Calculate total value for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-2 border shadow-sm rounded-md">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.value} jobs ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Generate table data
  const tableData = (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Customer Flag Breakdown</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Customer</th>
              <th className="text-right py-2">Flagged Jobs</th>
              <th className="text-right py-2">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{item.name}</td>
                <td className="text-right py-2">{item.value}</td>
                <td className="text-right py-2">
                  {((item.value / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr className="font-medium">
              <td className="py-2">Total</td>
              <td className="text-right py-2">{total}</td>
              <td className="text-right py-2">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <KpiCard
      title="Customer Flag Breakdown"
      value={`${data[0].name}: ${((data[0].value / total) * 100).toFixed(1)}%`}
      subtitle="Most flagged customer"
      icon={<Building className="h-5 w-5" />}
      loading={isLoading}
      chart={
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      }
      tableData={tableData}
    />
  );
};
