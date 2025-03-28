
import React from "react";
import { Layout } from "@/components/Layout";

const Integrations = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Integrations</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Manage connections with external systems and APIs.
          </p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Active Integrations</h3>
              <p className="text-sm text-gray-500">4 services connected</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">API Usage</h3>
              <p className="text-sm text-gray-500">2,458 calls this month</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Data Syncs</h3>
              <p className="text-sm text-gray-500">Last sync: 15 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Integrations;
