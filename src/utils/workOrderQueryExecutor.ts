
import { WorkOrder } from "@/components/workorders/types";
import { transformWorkOrderData } from "./workOrderUtils";

/**
 * Executes the count query to get total number of records
 * @param countQuery The prepared count query
 * @returns The count result or throws an error
 */
export const executeCountQuery = async (countQuery: any): Promise<number> => {
  const { count, error } = await countQuery;
  
  if (error) {
    console.error("Error fetching count:", error);
    throw error;
  }
  
  return count || 0;
};

/**
 * Executes the data query to get work order records
 * @param dataQuery The prepared data query
 * @returns Array of raw work order data or throws an error
 */
export const executeDataQuery = async (dataQuery: any): Promise<any[]> => {
  const { data, error } = await dataQuery;
  
  if (error) {
    console.error("Error fetching work orders:", error);
    throw error;
  }
  
  return data || [];
};

/**
 * Transforms raw work order data to WorkOrder objects
 * @param rawData The raw data from the database
 * @returns Array of transformed WorkOrder objects
 */
export const transformWorkOrderResults = (rawData: any[]): WorkOrder[] => {
  return rawData.map(transformWorkOrderData);
};

/**
 * Processes the filtered data to apply any additional client-side filtering if needed
 * @param transformedOrders The transformed work orders
 * @returns The final filtered data
 */
export const processFilteredData = (transformedOrders: WorkOrder[]): WorkOrder[] => {
  // Currently, all filtering is done at the database level
  // This function exists for potential future client-side filtering needs
  let filteredData = transformedOrders;
  
  return filteredData;
};
