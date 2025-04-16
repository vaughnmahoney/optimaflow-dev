import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseFetchCustomerNamesReturn {
  isLoading: boolean;
  customerNames: string[];
  error: string | null;
}

/**
 * Hook to fetch unique customer name (cust_name) values from the reports table
 */
export const useFetchCustomerNames = (): UseFetchCustomerNamesReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [customerNames, setCustomerNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerNames = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('[useFetchCustomerNames] Fetching unique cust_name values in alphabetical chunks');
        
        // Fetch customer names in alphabetical chunks to bypass the 1000 row limit
        // Create chunks of the alphabet to query by first letter
        const alphabetChunks = [
          ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
          ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
          ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
          ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] // Include numbers
        ];
        
        // Array to hold all customer name data
        let allNamesData: any[] = [];
        
        // Fetch each chunk separately
        for (const chunk of alphabetChunks) {
          console.log(`[useFetchCustomerNames] Fetching names starting with: ${chunk.join(', ')}`);
          
          // Create an array of filter conditions for this chunk
          const chunkQueries = chunk.map(letter => {
            return supabase
              .from('reports')
              .select('cust_name')
              .not('cust_name', 'is', null)
              .ilike('cust_name', `${letter}%`)
              .order('cust_name');
          });
          
          // Execute all queries for this chunk in parallel
          const chunkResults = await Promise.all(chunkQueries);
          
          // Process results from this chunk
          for (let i = 0; i < chunkResults.length; i++) {
            const { data: letterData, error: letterError } = chunkResults[i];
            
            if (letterError) {
              console.error(`[useFetchCustomerNames] Error fetching names starting with ${chunk[i]}:`, letterError);
              continue; // Skip this letter if there's an error
            }
            
            if (letterData && letterData.length > 0) {
              console.log(`[useFetchCustomerNames] Found ${letterData.length} names starting with ${chunk[i]}`);
              allNamesData = [...allNamesData, ...letterData];
            }
          }
        }
        
        // Also fetch names that don't start with a letter or number (special characters)
        console.log('[useFetchCustomerNames] Fetching names with special characters');
        const { data: specialData, error: specialError } = await supabase
          .from('reports')
          .select('cust_name')
          .not('cust_name', 'is', null)
          .not('cust_name', 'ilike', 'A%')
          .not('cust_name', 'ilike', 'B%')
          .not('cust_name', 'ilike', 'C%')
          .not('cust_name', 'ilike', 'D%')
          .not('cust_name', 'ilike', 'E%')
          .not('cust_name', 'ilike', 'F%')
          .not('cust_name', 'ilike', 'G%')
          .not('cust_name', 'ilike', 'H%')
          .not('cust_name', 'ilike', 'I%')
          .not('cust_name', 'ilike', 'J%')
          .not('cust_name', 'ilike', 'K%')
          .not('cust_name', 'ilike', 'L%')
          .not('cust_name', 'ilike', 'M%')
          .not('cust_name', 'ilike', 'N%')
          .not('cust_name', 'ilike', 'O%')
          .not('cust_name', 'ilike', 'P%')
          .not('cust_name', 'ilike', 'Q%')
          .not('cust_name', 'ilike', 'R%')
          .not('cust_name', 'ilike', 'S%')
          .not('cust_name', 'ilike', 'T%')
          .not('cust_name', 'ilike', 'U%')
          .not('cust_name', 'ilike', 'V%')
          .not('cust_name', 'ilike', 'W%')
          .not('cust_name', 'ilike', 'X%')
          .not('cust_name', 'ilike', 'Y%')
          .not('cust_name', 'ilike', 'Z%')
          .not('cust_name', 'ilike', '0%')
          .not('cust_name', 'ilike', '1%')
          .not('cust_name', 'ilike', '2%')
          .not('cust_name', 'ilike', '3%')
          .not('cust_name', 'ilike', '4%')
          .not('cust_name', 'ilike', '5%')
          .not('cust_name', 'ilike', '6%')
          .not('cust_name', 'ilike', '7%')
          .not('cust_name', 'ilike', '8%')
          .not('cust_name', 'ilike', '9%')
          .order('cust_name');
          
        if (specialData && specialData.length > 0) {
          console.log(`[useFetchCustomerNames] Found ${specialData.length} names with special characters`);
          allNamesData = [...allNamesData, ...specialData];
        }
        
        if (allNamesData.length === 0) {
          console.log('[useFetchCustomerNames] No customer names found');
          setCustomerNames([]);
          return;
        }
        
        console.log(`[useFetchCustomerNames] Total raw records: ${allNamesData.length}`);
        
        // Check if we might be missing data
        if (allNamesData.length === 1000) {
          console.warn('[useFetchCustomerNames] Exactly 1000 records found, might be hitting a limit');
        }
        
        // Extract unique cust_name values
        const uniqueNames = Array.from(
          new Set(
            allNamesData
              .map(item => item.cust_name)
              .filter(Boolean) // Remove any null/undefined values
          )
        ).filter((name): name is string => 
          typeof name === 'string'
        ).sort(); // Sort alphabetically
        
        console.log(`[useFetchCustomerNames] Found ${uniqueNames.length} unique customer names`);
        setCustomerNames(uniqueNames);
        
      } catch (err: any) {
        console.error('[useFetchCustomerNames] Error fetching customer names:', err);
        const errorMessage = err.message || 'Unknown error';
        toast.error(`Error fetching customer names: ${errorMessage}`);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerNames();
  }, []); // Run once on component mount

  return { isLoading, customerNames, error };
};
