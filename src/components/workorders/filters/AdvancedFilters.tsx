
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Fix the typing issue by properly handling the response
export const useDriverOptions = () => {
  const [drivers, setDrivers] = useState<{ id: string, name: string }[]>([]);
  
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select('search_response')
          .not('search_response', 'is', null);
        
        if (error) throw error;
        
        // Extract unique drivers from the response
        const uniqueDrivers = new Map<string, { id: string, name: string }>();
        
        data.forEach(item => {
          if (!item.search_response) return;
          
          // Safely parse the JSON if it's a string
          const searchResponse = typeof item.search_response === 'string' 
            ? JSON.parse(item.search_response) 
            : item.search_response;
            
          // Safely access properties using optional chaining
          const scheduleInfo = searchResponse?.scheduleInformation;
          if (scheduleInfo?.driverId && scheduleInfo?.driverName) {
            uniqueDrivers.set(scheduleInfo.driverId, {
              id: scheduleInfo.driverId,
              name: scheduleInfo.driverName
            });
          }
        });
        
        setDrivers(Array.from(uniqueDrivers.values()));
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };
    
    fetchDrivers();
  }, []);
  
  return drivers;
};

export const useLocationOptions = () => {
  const [locations, setLocations] = useState<{ id: string, name: string }[]>([]);
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select('search_response')
          .not('search_response', 'is', null);
        
        if (error) throw error;
        
        // Extract unique locations from the response
        const uniqueLocations = new Map<string, { id: string, name: string }>();
        
        data.forEach(item => {
          if (!item.search_response) return;
          
          // Safely parse the JSON if it's a string
          const searchResponse = typeof item.search_response === 'string' 
            ? JSON.parse(item.search_response) 
            : item.search_response;
            
          // Safely access properties using optional chaining
          const location = searchResponse?.data?.location;
          if (location?.locationId && (location?.name || location?.locationName)) {
            uniqueLocations.set(location.locationId, {
              id: location.locationId,
              name: location.name || location.locationName
            });
          }
        });
        
        setLocations(Array.from(uniqueLocations.values()));
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    fetchLocations();
  }, []);
  
  return locations;
};
