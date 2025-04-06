
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TechnicianMetric } from "@/hooks/useReportsStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

interface RejectionLeadersCardProps {
  rejectionData: TechnicianMetric[];
  isLoading: boolean;
}

export const RejectionLeadersCard = ({ rejectionData, isLoading }: RejectionLeadersCardProps) => {
  // If no rejection data available after loading
  const noData = !isLoading && (!rejectionData || rejectionData.length === 0);

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
                name: item.name,
                rejections: item.rejectedCount || 0,
                totalJobs: item.jobCount || 0
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "rejections") return [`${value} jobs`, "Rejections"];
                  if (name === "totalJobs") return [`${value} jobs`, "Total Jobs"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Technician: ${label}`}
              />
              <Bar 
                name="Total Jobs" 
                dataKey="totalJobs" 
                fill="#60a5fa" 
                opacity={0.3}
              />
              <Bar 
                name="Rejections" 
                dataKey="rejections" 
                fill="#f87171"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
