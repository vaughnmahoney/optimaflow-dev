
import React, { useState } from 'react';
import { Search, Users, Building, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DriverFilter } from "@/components/reports/DriverFilter";
import { CustomerNameFilter } from "@/components/reports/CustomerNameFilter";
import { CustomerGroupFilter } from "@/components/reports/CustomerGroupFilter";

interface FiltersStepProps {
  selectedDrivers: string[];
  setSelectedDrivers: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCustomerGroups: string[];
  setSelectedCustomerGroups: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCustomerNames: string[];
  setSelectedCustomerNames: React.Dispatch<React.SetStateAction<string[]>>;
}

export const FiltersStep: React.FC<FiltersStepProps> = ({
  selectedDrivers,
  setSelectedDrivers,
  selectedCustomerGroups,
  setSelectedCustomerGroups,
  selectedCustomerNames,
  setSelectedCustomerNames
}) => {
  const [activeTab, setActiveTab] = useState<string>("technicians");
  
  const clearAllFilters = () => {
    setSelectedDrivers([]);
    setSelectedCustomerGroups([]);
    setSelectedCustomerNames([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Select Filters</h3>
          <p className="text-sm text-muted-foreground">
            Refine your report by selecting specific technicians, customer groups, or individual customers
          </p>
        </div>
        
        {(selectedDrivers.length > 0 || selectedCustomerGroups.length > 0 || selectedCustomerNames.length > 0) && (
          <Button variant="outline" size="sm" onClick={clearAllFilters} className="h-8">
            <X className="h-3.5 w-3.5 mr-1" />
            Clear All
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="technicians" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 max-w-[400px]">
          <TabsTrigger value="technicians" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Technicians
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Customers
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          {/* Selected filters display */}
          {(selectedDrivers.length > 0 || selectedCustomerGroups.length > 0 || selectedCustomerNames.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedDrivers.map(driver => (
                <Badge key={`driver-${driver}`} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                  {driver}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0 ml-1 rounded-full" 
                    onClick={() => setSelectedDrivers(prev => prev.filter(d => d !== driver))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              
              {selectedCustomerGroups.map(group => (
                <Badge key={`group-${group}`} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                  Group: {group}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0 ml-1 rounded-full" 
                    onClick={() => setSelectedCustomerGroups(prev => prev.filter(g => g !== group))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              
              {selectedCustomerNames.map(customer => (
                <Badge key={`customer-${customer}`} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                  {customer}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0 ml-1 rounded-full" 
                    onClick={() => setSelectedCustomerNames(prev => prev.filter(c => c !== customer))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          
          <TabsContent value="technicians" className="border rounded-lg p-4">
            <DriverFilter 
              selectedDrivers={selectedDrivers} 
              setSelectedDrivers={setSelectedDrivers} 
            />
          </TabsContent>
          
          <TabsContent value="customers" className="border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Customer Groups</h4>
                <CustomerGroupFilter 
                  selectedCustomerGroups={selectedCustomerGroups} 
                  setSelectedCustomerGroups={setSelectedCustomerGroups} 
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Individual Customers</h4>
                <CustomerNameFilter 
                  selectedCustomerNames={selectedCustomerNames} 
                  setSelectedCustomerNames={setSelectedCustomerNames} 
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
