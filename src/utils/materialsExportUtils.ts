
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
  const detailedBreakdown: Record<string, number> = {};
  
  // Process materials to get totals and breakdowns
  filterMaterials.forEach(item => {
    const category = getFilterCategory(item.type);
    const formattedType = formatMaterialType(item.type);
    
    // Add to category totals
    totalsByCategory[category] = (totalsByCategory[category] || 0) + item.quantity;
    
    // Add to detailed breakdown
    detailedBreakdown[formattedType] = (detailedBreakdown[formattedType] || 0) + item.quantity;
  });
  
  // Create header rows for the worksheet
  const headerRows = [
    [`MR FOR ${technicianName.toUpperCase()}`],
    [`Date: ${today}`],
    [null],
    ['MATERIAL TOTALS:'],
    ['--------------------']
  ];
  
  // Add category totals with packaging info
  Object.entries(totalsByCategory).forEach(([category, count]) => {
    headerRows.push([`${category}: ${getPackagingInfo(category, count)}`]);
  });
  
  // Add spacing before detailed breakdown
  headerRows.push([null]);
  headerRows.push(['DETAILED BREAKDOWN:']);
  headerRows.push(['--------------------']);
  
  // Create columns for detailed breakdown
  const detailedData = [['Type', 'Quantity']];
  
  // Add detailed breakdown rows - sorted by formatted type
  Object.entries(detailedBreakdown)
    .sort(([typeA], [typeB]) => typeA.localeCompare(typeB))
    .forEach(([formattedType, quantity]) => {
      detailedData.push([formattedType, quantity]);
    });

  // Merge all data for the worksheet
  const worksheetData = [...headerRows];
  
  // Create worksheet for the first section
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Create a separate range for the detailed breakdown
  const detailedWorksheet = XLSX.utils.aoa_to_sheet(detailedData);
  
  // Calculate position for detailed data (we'll place it starting at column D)
  const detailedRange = XLSX.utils.decode_range(detailedWorksheet['!ref'] || 'A1');
  
  // Merge the detailed breakdown into the main worksheet at column D
  for (let R = detailedRange.s.r; R <= detailedRange.e.r; R++) {
    for (let C = detailedRange.s.c; C <= detailedRange.e.c; C++) {
      const detailedCell = XLSX.utils.encode_cell({ r: R, c: C });
      const targetCell = XLSX.utils.encode_cell({ r: R + 7, c: C + 3 }); // +7 rows down, +3 columns to the right (to D column)
      worksheet[targetCell] = detailedWorksheet[detailedCell];
    }
  }
  
  // Set column widths
  const columnWidths = [
    { wch: 30 }, // Column A
    { wch: 30 }, // Column B
    { wch: 10 }, // Column C
    { wch: 25 }, // Column D
    { wch: 10 }, // Column E
    { wch: 10 }  // Column F
  ];
  worksheet['!cols'] = columnWidths;
  
  // Apply styling for header row - make it bold
  const headerCellStyle = { font: { bold: true } };
  
  // Apply styles to key cells
  if (worksheet['A1']) worksheet['A1'].s = headerCellStyle; // MR FOR title
  if (worksheet['A2']) worksheet['A2'].s = headerCellStyle; // Date
  if (worksheet['A4']) worksheet['A4'].s = headerCellStyle; // MATERIAL TOTALS
  if (worksheet['D8']) worksheet['D8'].s = headerCellStyle; // Type header
  if (worksheet['E8']) worksheet['E8'].s = headerCellStyle; // Quantity header
  
  // Calculate the range for the worksheet (needed for proper display)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Update range to include our detailed breakdown section
  range.e.c = Math.max(range.e.c, detailedRange.e.c + 3); // +3 columns (to account for starting at column D)
  range.e.r = Math.max(range.e.r, detailedRange.e.r + 7); // +7 rows
  worksheet['!ref'] = XLSX.utils.encode_range(range);
  
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

