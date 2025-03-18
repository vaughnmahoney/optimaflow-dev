
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
    
    // Format the CSV content to match the example
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Build CSV content with proper formatting
    let csvContent = '';
    
    // HEADER SECTION
    csvContent += `HYLAND FILTER SERVICE - MATERIALS REQUIREMENTS\n`;
    csvContent += `===============================================\n\n`;
    csvContent += `TECHNICIAN: ${technicianName.toUpperCase()}\n`;
    csvContent += `DATE: ${formattedDate}\n\n`;
    
    // MATERIAL SUMMARY SECTION
    csvContent += `MATERIAL SUMMARY\n`;
    csvContent += `---------------\n`;
    
    // Category order for clear organization
    const categoryGroups = [
      {
        title: "COIL CLEANING",
        types: ['CONDCOIL', 'REFRIGERATOR_COILS', 'PRODUCE', 'P-TRAP']
      },
      {
        title: "FILTERS",
        types: []  // Will be calculated dynamically
      }
    ];
    
    // Add coil cleaning items
    let coilCleaningTotal = 0;
    csvContent += `${categoryGroups[0].title}:\n`;
    
    const coilMappings = {
      'CONDCOIL': 'Condenser Coils',
      'REFRIGERATOR_COILS': 'Refrigerator Coils',
      'PRODUCE': 'Produce Coils',
      'P-TRAP': 'P-Traps'
    };
    
    Object.entries(coilMappings).forEach(([type, label]) => {
      if (materialsByType[type]) {
        csvContent += `  ${label}: ${materialsByType[type]}\n`;
        coilCleaningTotal += materialsByType[type];
      }
    });
    csvContent += `  TOTAL COIL CLEANING: ${coilCleaningTotal}\n\n`;
    
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
    csvContent += `FILTERS:\n`;
    if (polyMendTotal > 0) csvContent += `  Polyester MEND: ${polyMendTotal}\n`;
    if (polyTotal > 0) csvContent += `  Polyester Standard: ${polyTotal}\n`;
    if (fiberglassTotal > 0) csvContent += `  Fiberglass: ${fiberglassTotal}\n`;
    if (pleatedTotal > 0) csvContent += `  Pleated: ${pleatedTotal}\n`;
    if (frameTotal > 0) csvContent += `  Frames: ${frameTotal}\n`;
    csvContent += `  TOTAL FILTERS: ${totalFilters}\n\n`;
    
    // PACKAGING SECTION
    csvContent += `PACKAGING REQUIREMENTS\n`;
    csvContent += `---------------------\n`;
    
    if (packagingNeeded['POLY_MEND']?.units > 0) {
      csvContent += `Polyester MEND Bags: ${packagingNeeded['POLY_MEND'].units} (${packagingNeeded['POLY_MEND'].quantity} filters @ ${POLY_PACK_SIZE}/bag)\n`;
    }
    
    if (packagingNeeded['POLY']?.units > 0) {
      csvContent += `Polyester Bags: ${packagingNeeded['POLY'].units} (${packagingNeeded['POLY'].quantity} filters @ ${POLY_PACK_SIZE}/bag)\n`;
    }
    
    if (packagingNeeded['FIBERGLASS']?.units > 0) {
      csvContent += `Fiberglass Boxes: ${packagingNeeded['FIBERGLASS'].units} (${packagingNeeded['FIBERGLASS'].quantity} filters @ ${FIBERGLASS_PACK_SIZE}/box)\n`;
    }
    
    if (packagingNeeded['PLEATED']?.units > 0) {
      csvContent += `Pleated Bundles: ${packagingNeeded['PLEATED'].units} (${packagingNeeded['PLEATED'].quantity} filters @ ${PLEATED_PACK_SIZE}/bundle)\n`;
    }
    
    csvContent += `\n`;
    
    // DETAILED BREAKDOWN SECTION
    csvContent += `DETAILED BREAKDOWN\n`;
    csvContent += `------------------\n`;
    
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
    
    // Add each group to CSV with subtotals
    Object.values(materialGroups).forEach(group => {
      if (group.items.length > 0) {
        csvContent += `${group.title}:\n`;
        
        // Sort items by size
        group.items.sort((a, b) => a[0].localeCompare(b[0]));
        
        // Calculate group total
        const groupTotal = group.items.reduce((sum, [_, qty]) => sum + qty, 0);
        
        // Add each item
        group.items.forEach(([type, quantity]) => {
          csvContent += `  ${formatMaterialType(type)}: ${quantity}\n`;
        });
        
        // Add subtotal
        csvContent += `  Subtotal: ${groupTotal}\n\n`;
      }
    });
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `materials_${technicianName.replace(/\s+/g, '_')}_${formattedDate.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Export CSV
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

