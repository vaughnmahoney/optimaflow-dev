
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { Loader2 } from 'lucide-react';

// Sample data - would come from an API in production
const data = [
  { date: 'Jan', completed: 2000 },
  { date: 'Feb', completed: 1500 },
  { date: 'Mar', completed: 1800 },
  { date: 'Apr', completed: 2200 },
  { date: 'May', completed: 1800 },
  { date: 'Jun', completed: 2400 },
  { date: 'Jul', completed: 2600 },
  { date: 'Aug', completed: 2300 },
  { date: 'Sep', completed: 2800 },
  { date: 'Oct', completed: 3000 },
  { date: 'Nov', completed: 2700 },
  { date: 'Dec', completed: 3200 },
];

export const CompletionTrendCard = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Completion Trend</CardTitle>
        <CardDescription>Monthly job completion over time</CardDescription>
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
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                allowDecimals={false} 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value) => [`${value} jobs`, 'Completed']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{ background: '#FFF', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#colorCompleted)"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
