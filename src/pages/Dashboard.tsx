
import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, Truck, Package2, Users, Receipt } from "lucide-react";

const Dashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-600 mb-6">
          This dashboard will provide a complete overview of all operations within OptimaFlow.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Quality Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Review and approve work orders submitted by technicians.
              </p>
              <div className="mt-2 text-sm font-medium">
                8 orders pending review
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Daily attendance tracking for all technicians.
              </p>
              <div className="mt-2 text-sm font-medium">
                95% attendance rate today
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Vehicle Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track vehicle maintenance needs and schedules.
              </p>
              <div className="mt-2 text-sm font-medium">
                3 vehicles due for service
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Package2 className="h-5 w-5 text-primary" />
                Storage Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Manage inventory and storage locations.
              </p>
              <div className="mt-2 text-sm font-medium">
                12 items need reordering
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Manage technician information and assignments.
              </p>
              <div className="mt-2 text-sm font-medium">
                120 technicians active
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track all company expenses and receipts.
              </p>
              <div className="mt-2 text-sm font-medium">
                $48,750 expenses this month
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
