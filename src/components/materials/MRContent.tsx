
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Download, Package } from "lucide-react";
import { useMRStore } from "@/hooks/materials/useMRStore";
import { MRTable } from "./MRTable";
import { MREmptyState } from "./MREmptyState";
import { MRSummary } from "./MRSummary";
import { formatMaterialType } from "@/utils/materialsUtils";
import * as XLSX from 'xlsx';

export const MRContent = () => {
  const { materialsData, technicianName } = useMRStore();
  const [activeTab, setActiveTab] = useState("summary");
  
  if (!materialsData.length) {
    return <MREmptyState />;
  }
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExport = () => {
    // Group materials by type
    const materialsByType: Record<string, number> = {};
    
    materialsData.forEach(item => {
      const type = item.type;
      
      // Group refrigerator coils types together
      let normalizedType = type;
      if (type.includes('FREEZER') || type.includes('FREEZECOOL') || type.includes('COOLER')) {
        normalizedType = 'REFRIGERATOR_COILS';
      }
      
      if (!materialsByType[normalizedType]) {
        materialsByType[normalizedType] = 0;
      }
      
      materialsByType[normalizedType] += item.quantity;
    });
    
    // Count packaging units needed
    const packagingNeeded: Record<string, {quantity: number, packSize: number, units: number}> = {};
    
    // Define pack sizes for different material types
    const POLY_PACK_SIZE = 50;
    const FIBERGLASS_PACK_SIZE = 50;
    const PLEATED_PACK_SIZE = 50;
    
    // Calculate packaging units needed
    Object.entries(materialsByType).forEach(([type, quantity]) => {
      if (type.startsWith('S')) {
        // All polyester filters (both regular and MEND)
        const category = type.endsWith('MEND') ? 'POLY_MEND' : 'POLY';
        if (!packagingNeeded[category]) {
          packagingNeeded[category] = { quantity: 0, packSize: POLY_PACK_SIZE, units: 0 };
        }
        packagingNeeded[category].quantity += quantity;
        packagingNeeded[category].units = Math.ceil(packagingNeeded[category].quantity / POLY_PACK_SIZE);
      } 
      else if (type.startsWith('G') && type.endsWith('B')) {
        // Fiberglass filters
        if (!packagingNeeded['FIBERGLASS']) {
          packagingNeeded['FIBERGLASS'] = { quantity: 0, packSize: FIBERGLASS_PACK_SIZE, units: 0 };
        }
        packagingNeeded['FIBERGLASS'].quantity += quantity;
        packagingNeeded['FIBERGLASS'].units = Math.ceil(packagingNeeded['FIBERGLASS'].quantity / FIBERGLASS_PACK_SIZE);
      }
      else if (type.startsWith('P') && type.includes('INS')) {
        // Pleated filters
        if (!packagingNeeded['PLEATED']) {
          packagingNeeded['PLEATED'] = { quantity: 0, packSize: PLEATED_PACK_SIZE, units: 0 };
        }
        packagingNeeded['PLEATED'].quantity += quantity;
        packagingNeeded['PLEATED'].units = Math.ceil(packagingNeeded['PLEATED'].quantity / PLEATED_PACK_SIZE);
      }
    });
    
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    // Add header rows
    let rowIndex = 0;
    XLSX.utils.sheet_add_aoa(ws, [
      [`HYLAND FILTER SERVICE - MATERIALS REQUIREMENTS`],
      [`===============================================`],
      [``],
      [`TECHNICIAN: ${technicianName.toUpperCase()}`],
      [`DATE: ${formattedDate}`],
      [``],
    ], { origin: { r: rowIndex, c: 0 } });
    rowIndex += 6;
    
    // MATERIAL SUMMARY SECTION
    XLSX.utils.sheet_add_aoa(ws, [
      [`MATERIAL SUMMARY`],
      [`---------------`],
    ], { origin: { r: rowIndex, c: 0 } });
    rowIndex += 2;
    
    // Coil cleaning section
    let coilCleaningTotal = 0;
    XLSX.utils.sheet_add_aoa(ws, [
      [`COIL CLEANING:`],
    ], { origin: { r: rowIndex, c: 0 } });
    rowIndex += 1;
    
    const coilMappings = {
      'CONDCOIL': 'Condenser Coils',
      'REFRIGERATOR_COILS': 'Refrigerator Coils',
      'PRODUCE': 'Produce Coils',
      'P-TRAP': 'P-Traps'
    };
    
    Object.entries(coilMappings).forEach(([type, label]) => {
      if (materialsByType[type]) {
        XLSX.utils.sheet_add_aoa(ws, [
          [`  ${label}: ${materialsByType[type]}`],
        ], { origin: { r: rowIndex, c: 0 } });
        rowIndex += 1;
        coilCleaningTotal += materialsByType[type];
      }
    });
    
    XLSX.utils.sheet_add_aoa(ws, [
      [`  TOTAL COIL CLEANING: ${coilCleaningTotal}`],
      [``],
    ], { origin: { r: rowIndex, c: 0 } });
    rowIndex += 2;
    
    // Group filter types
    const polyMendTotal = Object.entries(materialsByType)
      .filter(([type]) => type.startsWith('S') && type.endsWith('MEND'))
      .reduce((sum, [_, qty]) => sum + qty, 0);
      
    const polyTotal = Object.entries(materialsByType)
      .filter(([type]) => type.startsWith('S') && !type.endsWith('MEND'))
      .reduce((sum, [_, qty]) => sum + qty, 0);
      
    const fiberglassTotal = Object.entries(materialsByType)
      .filter(([type]) => type.startsWith('G') && type.endsWith('B'))
      .reduce((sum, [_, qty]) => sum + qty, 0);
      
    const pleatedTotal = Object.entries(materialsByType)
      .filter(([type]) => type.startsWith('P') && type.includes('INS'))
      .reduce((sum, [_, qty]) => sum + qty, 0);
    
    const frameTotal = Object.entries(materialsByType)
      .filter(([type]) => type.startsWith('F'))
      .reduce((sum, [_, qty]) => sum + qty, 0);
      
    // Calculate total filters
    const totalFilters = polyMendTotal + polyTotal + fiberglassTotal + pleatedTotal;
    
    // Add filter summary
    XLSX.utils.sheet_add_aoa(ws, [
      [`FILTERS:`],
    ], { origin: { r: rowIndex, c: 0 } });
    rowIndex += 1;
    
    if (polyMendTotal > 0) {
      XLSX.utils.sheet_add_aoa(ws, [
        [`  Polyester MEND: ${polyMendTotal}`],
      ], { origin: { r: rowIndex, c: 0 } });
      rowIndex += 1;
    }
    
    if (polyTotal > 0) {
      XLSX.utils.sheet_add_aoa(ws, [
        [`  Polyester Standard: ${polyTotal}`],
      ], { origin: { r: rowIndex, c: 0 } });
      rowIndex += 1;
    }
    
    if (fiberglassTotal > 0) {
      XLSX.utils.sheet_add_aoa(ws, [
        [`  Fiberglass: ${fiberglassTotal}`],
      ], { origin: { r: rowIndex, c: 0 } });
      rowIndex += 1;
    }
    
    if (pleatedTotal > 0) {
      XLSX.utils.sheet_add_aoa(ws, [
        [`  Pleated: ${pleatedTotal}`],
      ], { origin: { r: rowIndex, c: 0 } });
      rowIndex += 1;
    }
    
    if (frameTotal > 0) {
      XLSX.utils.sheet_add_aoa(ws, [
        [`  Frames: ${frameTotal}`],
      ], { origin: { r: rowIndex, c: 0 } });
      rowIndex += 1;
    }
    
    XLSX.utils.sheet_add_aoa(ws, [
      [`  TOTAL FILTERS: ${totalFilters}`],
      [``],
    ], { origin: { r: rowIndex, c: 0 } });
    rowIndex += 2;
    
    // PACKAGING SECTION
    XLSX.utils.sheet_add_aoa(ws, [
      [`PACKAGING REQUIREMENTS`],
      [`---------------------`],
    ], { origin: { r: rowIndex, c: 0 } });
    rowIndex += 2;
    
    if (packagingNeeded['POLY_MEND']?.units > 0) {
      XLSX.utils.sheet_add_aoa(ws, [
        [`Polyester MEND Bags: ${packagingNeeded['POLY_MEND'].units} (${packagingNeeded['POLY_MEND'].quantity} filters @ ${POLY_PACK_SIZE}/bag)`],
      ], { origin: { r: rowIndex, c: 0 } });
      rowIndex += 1;
    }
    
    if (packagingNeeded['POLY']?.units > 0) {
      XLSX.utils.sheet_add_aoa(ws, [
        [`Polyester Bags: ${packagingNeeded['POLY'].units} (${packagingNeeded['POLY'].quantity} filters @ ${POLY_PACK_SIZE}/bag)`],
      ], { origin: { r: rowIndex, c: 0 } });
      rowIndex += 1;
    }
    
    if (packagingNeeded['FIBERGLASS']?.units > 0) {
      XLSX.utils.sheet_add_aoa(ws, [
        [`Fiberglass Boxes: ${packagingNeeded['FIBERGLASS'].units} (${packagingNeeded['FIBERGLASS'].quantity} filters @ ${FIBERGLASS_PACK_SIZE}/box)`],
      ], { origin: { r: rowIndex, c: 0 } });
      rowIndex += 1;
    }
    
    if (packagingNeeded['PLEATED']?.units > 0) {
      XLSX.utils.sheet_add_aoa(ws, [
        [`Pleated Bundles: ${packagingNeeded['PLEATED'].units} (${packagingNeeded['PLEATED'].quantity} filters @ ${PLEATED_PACK_SIZE}/bundle)`],
      ], { origin: { r: rowIndex, c: 0 } });
      rowIndex += 1;
    }
    
    XLSX.utils.sheet_add_aoa(ws, [
      [``],
    ], { origin: { r: rowIndex, c: 0 } });
    rowIndex += 1;
    
    // DETAILED BREAKDOWN SECTION
    XLSX.utils.sheet_add_aoa(ws, [
      [`DETAILED BREAKDOWN`],
      [`------------------`],
    ], { origin: { r: rowIndex, c: 0 } });
    rowIndex += 2;
    
    // Group materials by their main type
    const materialGroups = {
      'COND': { title: 'CONDENSER COILS', items: [] as [string, number][] },
      'REF': { title: 'REFRIGERATOR COILS', items: [] as [string, number][] },
      'POLY_MEND': { title: 'POLYESTER MEND FILTERS', items: [] as [string, number][] },
      'POLY': { title: 'POLYESTER STANDARD FILTERS', items: [] as [string, number][] },
      'FIBER': { title: 'FIBERGLASS FILTERS', items: [] as [string, number][] },
      'PLEAT': { title: 'PLEATED FILTERS', items: [] as [string, number][] },
      'FRAME': { title: 'FRAMES', items: [] as [string, number][] },
      'OTHER': { title: 'OTHER MATERIALS', items: [] as [string, number][] }
    };
    
    // Sort materials into appropriate groups
    Object.entries(materialsByType).forEach(([type, quantity]) => {
      if (type === 'CONDCOIL') {
        materialGroups['COND'].items.push([type, quantity]);
      } 
      else if (type === 'REFRIGERATOR_COILS' || type.includes('FREEZER') || type.includes('FREEZECOOL') || type.includes('COOLER')) {
        materialGroups['REF'].items.push([type, quantity]);
      }
      else if (type.startsWith('S') && type.endsWith('MEND')) {
        materialGroups['POLY_MEND'].items.push([type, quantity]);
      }
      else if (type.startsWith('S')) {
        materialGroups['POLY'].items.push([type, quantity]);
      }
      else if (type.startsWith('G') && type.endsWith('B')) {
        materialGroups['FIBER'].items.push([type, quantity]);
      }
      else if (type.startsWith('P') && type.includes('INS')) {
        materialGroups['PLEAT'].items.push([type, quantity]);
      }
      else if (type.startsWith('F')) {
        materialGroups['FRAME'].items.push([type, quantity]);
      }
      else {
        materialGroups['OTHER'].items.push([type, quantity]);
      }
    });
    
    // Add each group to the worksheet with subtotals
    Object.values(materialGroups).forEach(group => {
      if (group.items.length > 0) {
        XLSX.utils.sheet_add_aoa(ws, [
          [`${group.title}:`],
        ], { origin: { r: rowIndex, c: 0 } });
        rowIndex += 1;
        
        // Sort items by size
        group.items.sort((a, b) => a[0].localeCompare(b[0]));
        
        // Calculate group total
        const groupTotal = group.items.reduce((sum, [_, qty]) => sum + qty, 0);
        
        // Add each item
        group.items.forEach(([type, quantity]) => {
          XLSX.utils.sheet_add_aoa(ws, [
            [`  ${formatMaterialType(type)}: ${quantity}`],
          ], { origin: { r: rowIndex, c: 0 } });
          rowIndex += 1;
        });
        
        // Add subtotal
        XLSX.utils.sheet_add_aoa(ws, [
          [`  Subtotal: ${groupTotal}`],
          [``],
        ], { origin: { r: rowIndex, c: 0 } });
        rowIndex += 2;
      }
    });
    
    // Set column width
    ws['!cols'] = [{ wch: 80 }]; // Set first column width to 80 characters
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Materials Report");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `materials_${technicianName.replace(/\s+/g, '_')}_${formattedDate.replace(/\//g, '-')}.xlsx`);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Materials Requirements for {technicianName}
        </CardTitle>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="all">All Materials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <MRSummary data={materialsData} />
          </TabsContent>
          
          <TabsContent value="all">
            <MRTable data={materialsData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
