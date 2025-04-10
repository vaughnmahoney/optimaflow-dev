
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { DateRange } from "react-day-picker";
import { startOfWeek, endOfWeek } from "date-fns";
import { FilterBar } from "@/components/reports/dashboard/FilterBar";
import { Dashboard } from "@/components/reports/dashboard";

const Reports = () => {
  // Initialize with current week
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 })
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
