
import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, DollarSign, Calendar, CreditCard } from "lucide-react";

const Expenses = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Expenses & Receipts</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Expense Tracking System</CardTitle>
            <CardDescription>
              Comprehensive tracking of all company expenses and receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The expense management system allows you to:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span>Upload and store digital copies of all receipts</span>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Track PEX card usage and balances</span>
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Categorize expenses for reporting and tax purposes</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Recent Expenses
            </h3>
            <p className="text-sm text-gray-500">32 receipts submitted this month</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pending Approvals
            </h3>
            <p className="text-sm text-gray-500">18 receipts awaiting review</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total This Month
            </h3>
            <p className="text-sm text-gray-500">$48,750 in expenses</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Expenses;
