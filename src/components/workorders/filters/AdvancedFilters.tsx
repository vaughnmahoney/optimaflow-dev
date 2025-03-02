
import React from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { WorkOrderFilters } from "../types";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdvancedFiltersProps {
  filters: WorkOrderFilters;
  onFiltersChange: (filters: WorkOrderFilters) => void;
}

export const AdvancedFilters = ({ filters, onFiltersChange }: AdvancedFiltersProps) => {
  // Fetch unique drivers
  const { data: drivers = [] } = useQuery({
    queryKey: ["uniqueDrivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("search_response")
        .not("search_response", "is", null);
      
      if (error) throw error;
      
      // Extract unique driver names and IDs
      const uniqueDrivers = new Map();
      data.forEach(order => {
        const driverName = order.search_response?.scheduleInformation?.driverName;
        const driverId = order.search_response?.scheduleInformation?.driverId;
        
        if (driverName && driverId && !uniqueDrivers.has(driverId)) {
          uniqueDrivers.set(driverId, { id: driverId, name: driverName });
        }
      });
      
      return Array.from(uniqueDrivers.values());
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch unique locations
  const { data: locations = [] } = useQuery({
    queryKey: ["uniqueLocations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("search_response")
        .not("search_response", "is", null);
      
      if (error) throw error;
      
      // Extract unique location names
      const uniqueLocations = new Map();
      data.forEach(order => {
        const location = order.search_response?.data?.location;
        const locationName = location?.name || location?.locationName;
        const locationId = location?.locationId;
        
        if (locationName && !uniqueLocations.has(locationId || locationName)) {
          uniqueLocations.set(locationId || locationName, locationName);
        }
      });
      
      return Array.from(uniqueLocations.entries()).map(([id, name]) => ({ id, name }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        from: date || null
      }
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        to: date || null
      }
    });
  };

  const handleDriverChange = (driverId: string) => {
    onFiltersChange({
      ...filters,
      driver: driverId === "all" ? null : driverId
    });
  };

  const handleLocationChange = (locationId: string) => {
    onFiltersChange({
      ...filters,
      location: locationId === "all" ? null : locationId
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      dateRange: { from: null, to: null },
      driver: null,
      location: null
    });
  };

  const hasActiveFilters = 
    filters.dateRange.from !== null || 
    filters.dateRange.to !== null || 
    filters.driver !== null || 
    filters.location !== null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4 flex-wrap">
      {/* Date Range Filter */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 border-dashed gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "PP")} - {format(filters.dateRange.to, "PP")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "PP")
                  )
                ) : (
                  "Date Range"
                )}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col sm:flex-row">
              <div className="border-r p-2">
                <h3 className="font-medium text-sm mb-2">From Date</h3>
                <CalendarComponent
                  mode="single"
                  selected={filters.dateRange.from || undefined}
                  onSelect={handleDateFromChange}
                  initialFocus
                />
              </div>
              <div className="p-2">
                <h3 className="font-medium text-sm mb-2">To Date</h3>
                <CalendarComponent
                  mode="single"
                  selected={filters.dateRange.to || undefined}
                  onSelect={handleDateToChange}
                  initialFocus
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Driver Filter */}
      <div className="w-[180px]">
        <Select
          value={filters.driver || "all"}
          onValueChange={handleDriverChange}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            {drivers.map((driver) => (
              <SelectItem key={driver.id} value={driver.id}>
                {driver.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Filter */}
      <div className="w-[200px]">
        <Select
          value={filters.location || "all"}
          onValueChange={handleLocationChange}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button - only show if filters are active */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
          Clear Filters
        </Button>
      )}
    </div>
  );
};
