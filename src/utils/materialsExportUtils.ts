
import * as XLSX from 'xlsx';
import { MaterialItem } from '@/hooks/materials/useMRStore';
import { formatMaterialType } from './materialsUtils';

/**
 * Export materials data to an Excel file
 */
export const exportMaterialsToExcel = (
  materials: MaterialItem[],
  technicianName: string = 'Technician'
) => {
  // Format the data for export
  const rows = materials.map(item => ({
    'Material Type': formatMaterialType(item.type),
    'Material Code': item.type,
    'Work Order ID': item.workOrderId || 'Unknown',
    'Quantity': item.quantity,
    'Driver': item.driverName || technicianName
  }));

  // Create a worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Material Type
    { wch: 15 }, // Material Code
    { wch: 15 }, // Work Order ID
    { wch: 10 }, // Quantity
    { wch: 20 }  // Driver
  ];
  worksheet['!cols'] = columnWidths;

  // Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Materials');

  // Generate a file name with date
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const fileName = `Materials_${technicianName.replace(/\s+/g, '_')}_${date}.xlsx`;

  // Export to file
  XLSX.writeFile(workbook, fileName);
};

/**
 * Export summarized materials data to an Excel file
 */
export const exportSummarizedMaterialsToExcel = (
  materialSummary: Record<string, number>,
  technicianName: string = 'Technician'
) => {
  // Format the data for export
  const rows = Object.entries(materialSummary).map(([type, quantity]) => ({
    'Material Type': formatMaterialType(type),
    'Material Code': type,
    'Total Quantity': quantity
  }));

  // Sort by material type for better readability
  rows.sort((a, b) => a['Material Type'].localeCompare(b['Material Type']));

  // Create a worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Material Type
    { wch: 15 }, // Material Code
    { wch: 15 }  // Total Quantity
  ];
  worksheet['!cols'] = columnWidths;

  // Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Materials Summary');

  // Generate a file name with date
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const fileName = `Materials_Summary_${technicianName.replace(/\s+/g, '_')}_${date}.xlsx`;

  // Export to file
  XLSX.writeFile(workbook, fileName);
};
