
import React from "react";
import { Layout } from "@/components/Layout";

const Payroll = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Payroll Management</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Manage employee payroll, review hours, and process payments.
          </p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Current Pay Period</h3>
              <p className="text-sm text-gray-500">May 1, 2023 - May 15, 2023</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Pending Approvals</h3>
              <p className="text-sm text-gray-500">12 timesheet approvals needed</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Next Payroll Date</h3>
              <p className="text-sm text-gray-500">May 20, 2023</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payroll;
