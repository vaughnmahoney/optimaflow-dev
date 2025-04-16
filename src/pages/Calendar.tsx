
import React from "react";
import { Layout } from "@/components/Layout";

const Calendar = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Calendar</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            View and manage schedules, appointments, and important dates.
          </p>
          <div className="grid gap-4 grid-cols-1">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Today's Schedule</h3>
              <ul className="space-y-2">
                <li className="text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium">9:00 AM</span> - Team Meeting
                </li>
                <li className="text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium">1:00 PM</span> - Client Visit: ABC Company
                </li>
                <li className="text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium">3:30 PM</span> - Inventory Review
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
