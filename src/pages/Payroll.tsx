
import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDollarSign, CheckCircle, CalendarDays, FileText } from "lucide-react";

const Payroll = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Payroll Management</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Automated Payroll Processing</CardTitle>
            <CardDescription>
              Approved work orders from Quality Control automatically import for payroll processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The OptimaFlow payroll system automatically:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span>Imports approved work orders from QC</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Reads service notes from OptimoRoute</span>
              </li>
              <li className="flex items-center gap-2">
                <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Applies preset payout rates for fast processing</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Current Pay Period
            </h3>
            <p className="text-sm text-gray-500">May 1, 2023 - May 15, 2023</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pending Approvals
            </h3>
            <p className="text-sm text-gray-500">12 timesheet approvals needed</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <BadgeDollarSign className="h-4 w-4" />
              Next Payroll Date
            </h3>
            <p className="text-sm text-gray-500">May 20, 2023</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payroll;
