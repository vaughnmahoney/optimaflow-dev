
import * as XLSX from 'xlsx';
import { MaterialItem } from '@/hooks/materials/useMRStore';
import { formatMaterialType, formatSizeCode, getFilterCategory, getPackagingInfo, isFilterType } from './materialsUtils';

/**
 * Creates a formatted Excel workbook with proper styling and organization
 * to match the client's required format
 */
const createFormattedWorkbook = (
  materials: MaterialItem[],
  technicianName: string = 'Technician'
) => {
  // Filter out non-filter material types
  const filterMaterials = materials.filter(item => isFilterType(item.type));
  
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  const today = new Date().toLocaleDateString();
  
  // Calculate totals by filter category
  const totalsByCategory: Record<string, number> = {};
  const detailedBreakdown: Record<string, { type: string, formattedType: string, quantity: number }> = {};
  
  // Process materials to get totals and breakdowns
  filterMaterials.forEach(item => {
    const category = getFilterCategory(item.type);
    const formattedType = formatMaterialType(item.type);
    
    // Add to category totals
    totalsByCategory[category] = (totalsByCategory[category] || 0) + item.quantity;
    
    // Add to detailed breakdown
    const key = item.type;
    if (!detailedBreakdown[key]) {
      detailedBreakdown[key] = {
        type: item.type,
        formattedType,
        quantity: 0
      };
    }
    detailedBreakdown[key].quantity += item.quantity;
  });
  
  // Create worksheet data
  const wsData = [];
  
  // Header with technician name and date
  wsData.push([`MR FOR ${technicianName.toUpperCase()}`]);
  wsData.push([`Date: ${today}`]);
  wsData.push([]);
  
  // Material Totals section
  wsData.push(['MATERIAL TOTALS:']);
  wsData.push(['--------------------']);
  
  // Add category totals with packaging info
  Object.entries(totalsByCategory)
    .filter(([category]) => category !== 'Other')
    .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB))
    .forEach(([category, count]) => {
      wsData.push([`${category}: ${getPackagingInfo(category, count)}`]);
    });
  
  // Add spacing before detailed breakdown
  wsData.push([]);
  wsData.push(['DETAILED BREAKDOWN:']);
  wsData.push(['--------------------']);
  
  // Add column headers for detailed breakdown
  wsData.push(['Type', 'Quantity']);
  
  // Add detailed breakdown rows - sorted by formatted type
  Object.values(detailedBreakdown)
    .sort((a, b) => a.formattedType.localeCompare(b.formattedType))
    .forEach(({ formattedType, quantity }) => {
      wsData.push([formattedType, quantity]);
    });
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  const columnWidths = [
    { wch: 30 }, // Column A
    { wch: 12 }  // Column B
  ];
  worksheet['!cols'] = columnWidths;
  
  // Apply styles to headers and section headers
  // XLSX.js in the browser doesn't support full styling like font weight
  // But we'll set what we can
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Materials Report');
  
  return workbook;
};

/**
 * Export materials data to an Excel file with improved formatting
 */
export const exportMaterialsToExcel = (
  materials: MaterialItem[],
  technicianName: string = 'Technician'
) => {
  // Create formatted workbook
  const workbook = createFormattedWorkbook(materials, technicianName);
  
  // Generate a file name with date
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const fileName = `MR_${technicianName.replace(/\s+/g, '_')}_${date}.xlsx`;
  
  // Export to file
  XLSX.writeFile(workbook, fileName);
};

/**
 * Export summarized materials data to an Excel file
 * @deprecated Use exportMaterialsToExcel instead, which now includes summary
 */
export const exportSummarizedMaterialsToExcel = (
  materialSummary: Record<string, number>,
  technicianName: string = 'Technician'
) => {
  // Create an empty materials array
  const emptyMaterials: MaterialItem[] = Object.entries(materialSummary).map(([type, quantity]) => ({
    id: type,
    type,
    quantity,
    workOrderId: 'Summary', 
    driverName: technicianName
  }));
  
  // Use the new format but with empty details section
  exportMaterialsToExcel(emptyMaterials, technicianName);
};
