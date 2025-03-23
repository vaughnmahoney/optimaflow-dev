
import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package2, ShoppingCart, Lock, MapPin } from "lucide-react";

const Storage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Storage Units</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Complete Storage Management</CardTitle>
            <CardDescription>
              Track locations, access codes, contact information, and inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The storage management system will provide:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Detailed information on all storage locations</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span>Secure storage of access codes and contact info</span>
              </li>
              <li className="flex items-center gap-2">
                <Package2 className="h-4 w-4 text-muted-foreground" />
                <span>Real-time inventory tracking and alerts</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Total Units
            </h3>
            <p className="text-sm text-gray-500">15 storage units</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Package2 className="h-4 w-4" />
              Capacity
            </h3>
            <p className="text-sm text-gray-500">75% utilized</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Low Stock Items
            </h3>
            <p className="text-sm text-gray-500">12 items need reordering</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Storage;
