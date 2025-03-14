
import React from "react";
import { Layout } from "@/components/Layout";

const VehicleMaintenance = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Vehicle Maintenance</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Track and maintain the company's vehicle fleet.
          </p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Active Vehicles</h3>
              <p className="text-sm text-gray-500">28 vehicles in service</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Maintenance Due</h3>
              <p className="text-sm text-gray-500">5 vehicles need service</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Out of Service</h3>
              <p className="text-sm text-gray-500">2 vehicles in repair</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VehicleMaintenance;
