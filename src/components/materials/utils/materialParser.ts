
import { MaterialItem, OrderDetail } from "../types";
import { v4 as uuidv4 } from "uuid";

/**
 * Parses materials from order notes
 */
export const parseMaterialsFromNotes = (
  notes: string,
  workOrderId: string,
  driverSerial?: string,
  storeInfo?: { storeId?: string; storeName?: string }
): MaterialItem[] => {
  if (!notes) return [];

  // Regular expression to match material items in format: (quantity) material_type
  const materialRegex = /\((\d+)\)\s*([^,(]+)(?:,|$)/g;
  const materials: MaterialItem[] = [];
  let match;

  while ((match = materialRegex.exec(notes)) !== null) {
    const quantity = parseInt(match[1], 10);
    const type = match[2].trim();
    
    // Skip invalid entries
    if (isNaN(quantity) || !type) continue;

    // Determine size if available
    const sizeMatch = type.match(/(\d+x\d+x\d+)/);
    const size = sizeMatch ? sizeMatch[1] : '';
    
    // Create material item
    materials.push({
      id: uuidv4(),
      type: type.toUpperCase(),
      quantity,
      size,
      workOrderId,
      driverSerial,
      storeId: storeInfo?.storeId,
      storeName: storeInfo?.storeName
    });
  }

  return materials;
};

/**
 * Processes a batch of order details to extract materials
 */
export const processBatchOrderDetails = (
  orderDetails: Record<string, OrderDetail>,
  orderToDriverMap: Record<string, string>,
  storeInfoMap: Record<string, { storeId?: string; storeName?: string }>
): MaterialItem[] => {
  const allMaterials: MaterialItem[] = [];
  
  // Process each order
  Object.entries(orderDetails).forEach(([orderNo, orderDetail]) => {
    if (!orderDetail.data || !orderDetail.data.notes) return;
    
    const driverSerial = orderToDriverMap[orderNo];
    const storeInfo = storeInfoMap[orderNo] || {};
    
    // Parse materials from notes
    const materials = parseMaterialsFromNotes(
      orderDetail.data.notes,
      orderNo,
      driverSerial,
      storeInfo
    );
    
    // Add to collection
    allMaterials.push(...materials);
  });
  
  return allMaterials;
};

/**
 * Calculates material summaries by type and size
 */
export const calculateMaterialSummaries = (
  materials: MaterialItem[],
  driverSerials?: string[]
): Array<{ type: string; size: string; quantity: number }> => {
  // Filter by selected drivers if provided
  const filteredMaterials = driverSerials?.length 
    ? materials.filter(item => driverSerials.includes(item.driverSerial || ''))
    : materials;
  
  // Group by type and size
  const summaryMap = new Map<string, { type: string; size: string; quantity: number }>();
  
  filteredMaterials.forEach(item => {
    const key = `${item.type}|${item.size || 'N/A'}`;
    const existing = summaryMap.get(key);
    
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      summaryMap.set(key, {
        type: item.type,
        size: item.size || 'N/A',
        quantity: item.quantity
      });
    }
  });
  
  // Convert map to array and sort by type and size
  return Array.from(summaryMap.values()).sort((a, b) => {
    // Sort by material type priority first
    const typePriority = getMaterialTypePriority(a.type) - getMaterialTypePriority(b.type);
    if (typePriority !== 0) return typePriority;
    
    // Then by size
    return a.size.localeCompare(b.size);
  });
};

/**
 * Helper to determine material type display priority
 */
const getMaterialTypePriority = (type: string): number => {
  const upperType = type.toUpperCase();
  
  if (upperType.includes('CONDCOIL')) return 1;
  if (upperType.includes('COOLER') || upperType.includes('FREEZER')) return 2;
  if (upperType.includes('PLEATED')) return 3;
  if (upperType.includes('POLY')) return 4;
  if (upperType.includes('FIBERGLASS')) return 5;
  if (upperType.includes('MERV')) return 6;
  
  return 100; // Default priority for other types
};
