
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth } from "date-fns";
import { FilterBar } from "@/components/reports/dashboard/FilterBar";
import { Dashboard } from "@/components/reports/dashboard";
import { ReportsFetchControl } from "@/components/reports/ReportsFetchControl";
import { UnscheduledOrdersControl } from "@/components/reports/UnscheduledOrdersControl";
import { AllReportsControl } from "@/components/reports/AllReportsControl";

const Reports = () => {
  // Initialize with current month
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  
  // Filter states
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedCustomerGroups, setSelectedCustomerGroups] = useState<string[]>([]);
  const [selectedCustomerNames, setSelectedCustomerNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  return (
    <Layout title="Reports">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Reports Dashboard</h1>
        </div>
        
        {/* Data Fetch Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Reports Fetch Control */}
          <ReportsFetchControl />
          
          {/* Unscheduled Orders Control */}
          <UnscheduledOrdersControl />
          
          {/* All Reports LDS Update Control */}
          <AllReportsControl />
        </div>
        
        {/* Filter Bar */}
        <FilterBar 
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedDrivers={selectedDrivers}
          setSelectedDrivers={setSelectedDrivers}
          selectedCustomerGroups={selectedCustomerGroups}
          setSelectedCustomerGroups={setSelectedCustomerGroups}
          selectedCustomerNames={selectedCustomerNames}
          setSelectedCustomerNames={setSelectedCustomerNames}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        {/* Dashboard Cards */}
        <Dashboard 
          dateRange={dateRange}
          selectedDrivers={selectedDrivers}
          selectedCustomerGroups={selectedCustomerGroups}
          selectedCustomerNames={selectedCustomerNames}
          searchQuery={searchQuery}
        />
      </div>
    </Layout>
  );
};

export default Reports;
