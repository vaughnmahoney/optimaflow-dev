import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseFetchDriversReturn {
  isLoading: boolean;
  drivers: string[];
  error: string | null;
}

/**
 * Hook to fetch unique driver (tech_name) values from the reports table
 */
export const useFetchDrivers = (): UseFetchDriversReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('[useFetchDrivers] Fetching unique tech_name values from reports table');
        
        console.log('[useFetchDrivers] Querying reports table for tech_name values');
        
        // Since we know the prefixes we want (CW, L, MW, NE, SE), let's fetch them separately
        console.log('[useFetchDrivers] Fetching drivers by known prefixes');
        
        // Known prefixes based on the data you shared
        const knownPrefixes = ['CW', 'L', 'MW', 'NE', 'SE'];
        
        // Create an array to hold all the driver data
        let allDriversData: any[] = [];
        
        // Fetch drivers for each prefix separately
        for (const prefix of knownPrefixes) {
          console.log(`[useFetchDrivers] Fetching drivers with prefix: ${prefix}`);
          
          const { data: prefixData, error: prefixError } = await supabase
            .from('reports')
            .select('tech_name')
            .not('tech_name', 'is', null)
            .like('tech_name', `${prefix} - %`)
            .order('tech_name');
          
          if (prefixError) {
            console.error(`[useFetchDrivers] Error fetching ${prefix} drivers:`, prefixError);
            continue; // Skip this prefix if there's an error, but continue with others
          }
          
          if (prefixData && prefixData.length > 0) {
            console.log(`[useFetchDrivers] Found ${prefixData.length} drivers with prefix ${prefix}`);
            allDriversData = [...allDriversData, ...prefixData];
          }
        }
        
        // Use the combined data from all prefixes
        const distinctData = allDriversData;
        const distinctError = null;
        
        // Log the distinct query results
        console.log('[useFetchDrivers] Query completed, checking results...');
        
        if (distinctError) {
          console.error('[useFetchDrivers] Error with distinct query:', distinctError);
          throw distinctError;
        }
        
        // Store the data for processing
        const data = distinctData || [];
        
        if (!data || data.length === 0) {
          console.log('[useFetchDrivers] No drivers found');
          setDrivers([]);
          return;
        }
        
        // Log the raw data to see all tech_name values before processing
        console.log('[useFetchDrivers] Total raw records:', data.length);
        
        // Log the first 10 tech_name values to see what we're getting
        const firstFew = data.slice(0, 10).map(item => item.tech_name);
        console.log('[useFetchDrivers] First 10 tech_name values:', firstFew);
        
        // Check for non-CW drivers in the raw data
        const nonCWDriversInRaw = data
          .map(item => item.tech_name)
          .filter(name => name && !name.startsWith('CW'));
        
        console.log('[useFetchDrivers] Found', nonCWDriversInRaw.length, 'non-CW drivers in raw data');
        if (nonCWDriversInRaw.length > 0) {
          console.log('[useFetchDrivers] Sample non-CW drivers:', nonCWDriversInRaw.slice(0, 5));
        }
        
        // Extract unique tech_name values
        const allDriverNames = data.map(item => item.tech_name).filter(Boolean);
        
        // Get a set of unique driver names to remove duplicates
        const uniqueDriversSet = new Set(allDriverNames);
        const uniqueDrivers = Array.from(uniqueDriversSet).filter((name): name is string => 
          typeof name === 'string'
        ).sort();
        
        console.log(`[useFetchDrivers] Found ${uniqueDrivers.length} unique drivers after processing`);
        
        // Count drivers by prefix
        const prefixCounts = {};
        uniqueDrivers.forEach(name => {
          if (typeof name === 'string') {
            const prefix = name.split(' ')[0];
            prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
          }
        });
        
        console.log('[useFetchDrivers] Driver counts by prefix:', prefixCounts);
        
        // Log the unique prefixes we found
        const prefixes = Object.keys(prefixCounts);
        console.log('[useFetchDrivers] Unique prefixes found:', prefixes);
        
        // If we only have CW prefixes, something is wrong with our query or data access
        if (prefixes.length === 1 && prefixes[0] === 'CW') {
          console.warn('[useFetchDrivers] WARNING: Only found CW prefixes despite knowing others exist!');
          console.warn('[useFetchDrivers] This suggests a data access or query issue.');
        }
        setDrivers(uniqueDrivers);
        
      } catch (err: any) {
        console.error('[useFetchDrivers] Error fetching drivers:', err);
        const errorMessage = err.message || 'Unknown error';
        toast.error(`Error fetching drivers: ${errorMessage}`);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []); // Run once on component mount

  return { isLoading, drivers, error };
};
