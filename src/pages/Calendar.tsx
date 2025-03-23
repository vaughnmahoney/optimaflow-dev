
import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

const CalendarPage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Calendar</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Calendar Overview</CardTitle>
            <CardDescription>
              Track company meetings, delivery ETAs, and important events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This calendar system will allow you to:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Schedule and track company meetings</span>
              </li>
              <li className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Monitor delivery ETAs from vendors</span>
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Coordinate team availability</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Demo Calendar</h2>
          <div className="border rounded-md">
            <Calendar mode="single" />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;
