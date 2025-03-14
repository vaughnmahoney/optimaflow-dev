import React from "react";
import { Layout } from "@/components/Layout";
import Admin from "./Admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Phone, Mail, CreditCard, MapPin } from "lucide-react";

// We're renaming the route but keeping the functionality from Admin page
const Employees = () => {
  return (
    <Layout>
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Management System</CardTitle>
            <CardDescription>
              Comprehensive employee information management that integrates with OptimoRoute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The employee management system will:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <span>Automatically create employees from OptimoRoute driver data</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>Store personal and work contact information</span>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Track PEX card and financial information</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Maintain current address and emergency contacts</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Admin />
    </Layout>
  );
};

export default Employees;
