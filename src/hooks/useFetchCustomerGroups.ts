import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseFetchCustomerGroupsReturn {
  isLoading: boolean;
  customerGroups: string[];
  error: string | null;
}

/**
 * Hook to fetch unique customer group (cust_group) values from the reports table
 */
export const useFetchCustomerGroups = (): UseFetchCustomerGroupsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [customerGroups, setCustomerGroups] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerGroups = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('[useFetchCustomerGroups] Fetching unique cust_group values in alphabetical chunks');
        
        // Fetch customer groups in alphabetical chunks to bypass the 1000 row limit
        // Create chunks of the alphabet to query by first letter
        const alphabetChunks = [
          ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
          ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
          ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
          ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] // Include numbers
        ];
        
        // Array to hold all customer group data
        let allGroupsData: any[] = [];
        
        // Fetch each chunk separately
        for (const chunk of alphabetChunks) {
          console.log(`[useFetchCustomerGroups] Fetching groups starting with: ${chunk.join(', ')}`);
          
          // Create an array of filter conditions for this chunk
          const chunkQueries = chunk.map(letter => {
            return supabase
              .from('reports')
              .select('cust_group')
              .not('cust_group', 'is', null)
              .ilike('cust_group', `${letter}%`)
              .order('cust_group');
          });
          
          // Execute all queries for this chunk in parallel
          const chunkResults = await Promise.all(chunkQueries);
          
          // Process results from this chunk
          for (let i = 0; i < chunkResults.length; i++) {
            const { data: letterData, error: letterError } = chunkResults[i];
            
            if (letterError) {
              console.error(`[useFetchCustomerGroups] Error fetching groups starting with ${chunk[i]}:`, letterError);
              continue; // Skip this letter if there's an error
            }
            
            if (letterData && letterData.length > 0) {
              console.log(`[useFetchCustomerGroups] Found ${letterData.length} groups starting with ${chunk[i]}`);
              allGroupsData = [...allGroupsData, ...letterData];
            }
          }
        }
        
        // Also fetch groups that don't start with a letter or number (special characters)
        console.log('[useFetchCustomerGroups] Fetching groups with special characters');
        const { data: specialData, error: specialError } = await supabase
          .from('reports')
          .select('cust_group')
          .not('cust_group', 'is', null)
          .not('cust_group', 'ilike', 'A%')
          .not('cust_group', 'ilike', 'B%')
          .not('cust_group', 'ilike', 'C%')
          .not('cust_group', 'ilike', 'D%')
          .not('cust_group', 'ilike', 'E%')
          .not('cust_group', 'ilike', 'F%')
          .not('cust_group', 'ilike', 'G%')
          .not('cust_group', 'ilike', 'H%')
          .not('cust_group', 'ilike', 'I%')
          .not('cust_group', 'ilike', 'J%')
          .not('cust_group', 'ilike', 'K%')
          .not('cust_group', 'ilike', 'L%')
          .not('cust_group', 'ilike', 'M%')
          .not('cust_group', 'ilike', 'N%')
          .not('cust_group', 'ilike', 'O%')
          .not('cust_group', 'ilike', 'P%')
          .not('cust_group', 'ilike', 'Q%')
          .not('cust_group', 'ilike', 'R%')
          .not('cust_group', 'ilike', 'S%')
          .not('cust_group', 'ilike', 'T%')
          .not('cust_group', 'ilike', 'U%')
          .not('cust_group', 'ilike', 'V%')
          .not('cust_group', 'ilike', 'W%')
          .not('cust_group', 'ilike', 'X%')
          .not('cust_group', 'ilike', 'Y%')
          .not('cust_group', 'ilike', 'Z%')
          .not('cust_group', 'ilike', '0%')
          .not('cust_group', 'ilike', '1%')
          .not('cust_group', 'ilike', '2%')
          .not('cust_group', 'ilike', '3%')
          .not('cust_group', 'ilike', '4%')
          .not('cust_group', 'ilike', '5%')
          .not('cust_group', 'ilike', '6%')
          .not('cust_group', 'ilike', '7%')
          .not('cust_group', 'ilike', '8%')
          .not('cust_group', 'ilike', '9%')
          .order('cust_group');
          
        if (specialData && specialData.length > 0) {
          console.log(`[useFetchCustomerGroups] Found ${specialData.length} groups with special characters`);
          allGroupsData = [...allGroupsData, ...specialData];
        }
        
        if (allGroupsData.length === 0) {
          console.log('[useFetchCustomerGroups] No customer groups found');
          setCustomerGroups([]);
          return;
        }
        
        console.log(`[useFetchCustomerGroups] Total raw records: ${allGroupsData.length}`);
        
        // Check if we might be missing data
        if (allGroupsData.length === 1000) {
          console.warn('[useFetchCustomerGroups] Exactly 1000 records found, might be hitting a limit');
        }
        
        // Extract unique cust_group values
        const uniqueGroups = Array.from(
          new Set(
            allGroupsData
              .map(item => item.cust_group)
              .filter(Boolean) // Remove any null/undefined values
          )
        ).filter((name): name is string => 
          typeof name === 'string'
        ).sort(); // Sort alphabetically
        
        console.log(`[useFetchCustomerGroups] Found ${uniqueGroups.length} unique customer groups`);
        setCustomerGroups(uniqueGroups);
        
      } catch (err: any) {
        console.error('[useFetchCustomerGroups] Error fetching customer groups:', err);
        const errorMessage = err.message || 'Unknown error';
        toast.error(`Error fetching customer groups: ${errorMessage}`);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerGroups();
  }, []); // Run once on component mount

  return { isLoading, customerGroups, error };
};
