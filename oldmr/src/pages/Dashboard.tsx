
import React from "react";
import { Layout } from "@/components/Layout";

const Dashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Work Orders Overview</h2>
            <p className="text-gray-600">Summary of recent work orders and their statuses.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Attendance Summary</h2>
            <p className="text-gray-600">Quick overview of today's attendance records.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-600">Latest updates and activities in the system.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
