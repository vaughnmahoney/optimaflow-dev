
import React from "react";
import { Layout } from "@/components/Layout";

const Receipts = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Receipts & Invoices</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Manage financial documents, receipts, and invoices.
          </p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Recent Invoices</h3>
              <p className="text-sm text-gray-500">32 invoices issued this month</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Pending Payments</h3>
              <p className="text-sm text-gray-500">18 invoices awaiting payment</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Revenue This Month</h3>
              <p className="text-sm text-gray-500">$48,750</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Receipts;
