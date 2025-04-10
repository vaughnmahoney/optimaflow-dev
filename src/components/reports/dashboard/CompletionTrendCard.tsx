
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

// Sample data - would come from an API in production
const data = [
  { date: 'Mon', completed: 12 },
  { date: 'Tue', completed: 19 },
  { date: 'Wed', completed: 15 },
  { date: 'Thu', completed: 22 },
  { date: 'Fri', completed: 18 },
  { date: 'Sat', completed: 6 },
  { date: 'Sun', completed: 3 },
];

export const CompletionTrendCard = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Card className="col-span-1 md:col-span-1 h-[400px]">
      <CardHeader>
        <CardTitle>Completion Trend</CardTitle>
        <CardDescription>Daily job completion over time</CardDescription>
      </CardHeader>
      <CardContent className="h-[330px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [`${value} jobs`, 'Completed']}
                labelFormatter={(label) => `${label}`}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
