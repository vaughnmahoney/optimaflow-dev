
import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Wrench, AlertTriangle, Calendar } from "lucide-react";

const VehicleMaintenance = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Vehicle Maintenance</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Automated Maintenance Alerts</CardTitle>
            <CardDescription>
              Track and automatically schedule maintenance for company vehicles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The vehicle maintenance system will automatically:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Schedule regular maintenance based on mileage and time</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span>Alert when vehicles need immediate attention</span>
              </li>
              <li className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span>Track repair history for each vehicle</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Car className="h-4 w-4" />
              Active Vehicles
            </h3>
            <p className="text-sm text-gray-500">28 vehicles in service</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Maintenance Due
            </h3>
            <p className="text-sm text-gray-500">5 vehicles need service</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Out of Service
            </h3>
            <p className="text-sm text-gray-500">2 vehicles in repair</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VehicleMaintenance;
