
import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Phone, Mail, CreditCard, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Technician } from "@/types/attendance";
import { TechnicianForm } from "@/components/technicians/TechnicianForm";
import { TechnicianList } from "@/components/technicians/TechnicianList";

const Employees = () => {
  // Fetch technicians
  const { data: technicians, isLoading } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      console.log("Fetching technicians...");
      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching technicians:", error);
        throw error;
      }

      console.log("Fetched technicians:", data);
      return data as Technician[];
    },
  });

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
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
        
        <div>
          <h2 className="text-2xl font-bold text-primary">Admin Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage technicians and view attendance records
          </p>
        </div>

        <TechnicianForm />
        <TechnicianList technicians={technicians || []} isLoading={isLoading} />
      </div>
    </Layout>
  );
};

export default Employees;
