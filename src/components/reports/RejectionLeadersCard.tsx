
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TechnicianMetric } from "@/hooks/useReportsStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

interface RejectionLeadersCardProps {
  rejectionData: TechnicianMetric[];
  isLoading: boolean;
}

export const RejectionLeadersCard = ({ rejectionData, isLoading }: RejectionLeadersCardProps) => {
  // If no rejection data available after loading
  const noData = !isLoading && (!rejectionData || rejectionData.length === 0);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">{`Total Jobs: ${payload[0].payload.totalJobs}`}</p>
          <p className="text-red-500">{`Rejections: ${payload[1].value}`}</p>
          <p className="text-gray-600">{`Rejection Rate: ${Math.round((payload[1].value / payload[0].payload.totalJobs) * 100)}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Format technician names to be more readable
  const formatTechnicianName = (name: string): string => {
    // If name is longer than 12 characters, truncate and add ellipsis
    if (name.length > 12) {
      // Try to find a space to truncate at
      const spaceIndex = name.indexOf(' ', 5);
      if (spaceIndex > 0) {
        return name.substring(0, spaceIndex) + '...';
      }
      return name.substring(0, 10) + '...';
    }
    return name;
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          <AlertTriangle className="inline-block mr-2 h-5 w-5 text-amber-500" />
          Rejection Leaders
        </CardTitle>
        <CardDescription>
          Technicians with the highest number of rejected jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : noData ? (
          <div className="flex flex-col items-center justify-center h-[250px] text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mb-3 text-muted-foreground/50" />
            <p>No rejection data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={rejectionData.map(item => ({
                name: formatTechnicianName(item.name),
                fullName: item.name,
                rejections: item.rejectedCount || 0,
                totalJobs: item.jobCount || 0
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                name="Total Jobs" 
                dataKey="totalJobs" 
                fill="#60a5fa" 
                opacity={0.3}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                name="Rejections" 
                dataKey="rejections" 
                fill="#f87171"
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  dataKey="rejections" 
                  position="top" 
                  fill="#374151" 
                  fontSize={12}
                  formatter={(value: number) => value > 0 ? value : ''}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
