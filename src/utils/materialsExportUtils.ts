
import * as XLSX from 'xlsx';
import { MaterialItem } from '@/hooks/materials/useMRStore';
import { formatMaterialType } from './materialsUtils';

/**
 * Creates a formatted Excel workbook with proper styling and organization
 */
const createFormattedWorkbook = (
  materialSummary: Record<string, number>,
  materials: MaterialItem[],
  technicianName: string = 'Technician'
) => {
  const workbook = XLSX.utils.book_new();
  const today = new Date().toLocaleDateString();
  
  // Create header rows
  const headerRows = [
    [`MR FOR ${technicianName.toUpperCase()}`],
    [`DATE: ${today}`],
    [],
    ['MATERIAL TOTALS:'],
    []
  ];
  
  // Create material summary data - sorted by material type
  const summaryData = Object.entries(materialSummary)
    .sort(([typeA], [typeB]) => formatMaterialType(typeA).localeCompare(formatMaterialType(typeB)))
    .map(([type, quantity]) => [
      formatMaterialType(type),
      type, // Material code
      quantity,
      "PCS" // Unit of measurement
    ]);
  
  // Add header row for summary data
  summaryData.unshift(['Material Type', 'Material Code', 'Quantity', 'Unit']);
  
  // Combine header rows and summary data
  const combinedData = [...headerRows, ...summaryData, [], ['MATERIAL BREAKDOWN:']];
  
  // Add material breakdown header
  combinedData.push(['Work Order', 'Material Type', 'Material Code', 'Quantity', 'Unit', 'Driver']);
  
  // Add detailed material breakdown - sorted first by work order, then by material type
  const detailedData = [...materials]
    .sort((a, b) => {
      // Sort by work order ID first
      const workOrderComp = (a.workOrderId || '').localeCompare(b.workOrderId || '');
      if (workOrderComp !== 0) return workOrderComp;
      
      // Then sort by material type
      return formatMaterialType(a.type).localeCompare(formatMaterialType(b.type));
    })
    .map(item => [
      item.workOrderId || 'Unknown',
      formatMaterialType(item.type),
      item.type,
      item.quantity,
      "PCS",
      item.driverName || technicianName
    ]);
  
  // Add detailed data to combined data
  combinedData.push(...detailedData);
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(combinedData);
  
  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Work Order / First column
    { wch: 25 }, // Material Type
    { wch: 15 }, // Material Code
    { wch: 10 }, // Quantity
    { wch: 8 },  // Unit
    { wch: 20 }  // Driver
  ];
  worksheet['!cols'] = columnWidths;
  
  // Apply styling for header row - make it bold (limited styling options in xlsx)
  const headerCellStyle = { font: { bold: true } };
  
  // Apply styles to header cells
  const applyStyles = (worksheet: XLSX.WorkSheet) => {
    // Apply bold to header row cells
    if (worksheet['A1']) worksheet['A1'].s = headerCellStyle;
    if (worksheet['A2']) worksheet['A2'].s = headerCellStyle;
    if (worksheet['A4']) worksheet['A4'].s = headerCellStyle;
    
    // Apply styles to material summary header
    const summaryHeaderRowIndex = 6; // Header is at row 6 (0-based in the data, 1-based in the cell references)
    ['A', 'B', 'C', 'D'].forEach(col => {
      const cellRef = `${col}${summaryHeaderRowIndex}`;
      if (worksheet[cellRef]) worksheet[cellRef].s = headerCellStyle;
    });
    
    // Apply styles to material breakdown header
    // Find the index of the breakdown header
    let breakdownHeaderRowIndex = combinedData.findIndex(row => row[0] === 'MATERIAL BREAKDOWN:') + 2;
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
      const cellRef = `${col}${breakdownHeaderRowIndex}`;
      if (worksheet[cellRef]) worksheet[cellRef].s = headerCellStyle;
    });
  };
  
  // Apply styles
  applyStyles(worksheet);
  
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
  // First, create the material summary by type
  const materialSummary = materials.reduce<Record<string, number>>((acc, item) => {
    const { type, quantity } = item;
    acc[type] = (acc[type] || 0) + quantity;
    return acc;
  }, {});
  
  // Create formatted workbook
  const workbook = createFormattedWorkbook(materialSummary, materials, technicianName);
  
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
