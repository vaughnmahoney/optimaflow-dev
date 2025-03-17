
import React from "react";
import { Layout } from "@/components/Layout";

const Storage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Storage Units</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Manage inventory and storage units for equipment and supplies.
          </p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Total Units</h3>
              <p className="text-sm text-gray-500">15 storage units</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Capacity</h3>
              <p className="text-sm text-gray-500">75% utilized</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Low Stock Items</h3>
              <p className="text-sm text-gray-500">12 items need reordering</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Storage;
