
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/components/workorders/types";
import { toast } from "sonner";
import { transformWorkOrderData } from "@/utils/workOrderUtils";

export const useLocationSearch = () => {
  const [searchResults, setSearchResults] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const searchByLocation = async (locationName: string) => {
    if (!locationName.trim()) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }

    setIsLoading(true);
    setNoResults(false);

    try {
      // Search for work orders with matching location_name (case insensitive partial match)
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .ilike('location_name', `%${locationName}%`)
        .order('service_date', { ascending: false });

      if (error) {
        throw error;
      }

      if (data.length === 0) {
        setNoResults(true);
        setSearchResults([]);
      } else {
        // Transform the raw data into WorkOrder objects
        const transformedData = data.map(item => transformWorkOrderData(item));
        setSearchResults(transformedData);
      }

      console.log(`Found ${data.length} orders for location: ${locationName}`);
    } catch (error: any) {
      console.error("Error searching work orders by location:", error);
      toast.error(`Error: ${error.message}`);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchResults,
    isLoading,
    noResults,
    searchByLocation
  };
};
