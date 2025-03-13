
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
    
    // Format the CSV string for technician-friendly viewing
    let csvContent = `MATERIALS REQUIREMENTS FOR: ${technicianName.toUpperCase()}\n`;
    csvContent += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    // SECTION 1: Summary by filter type
    csvContent += "MATERIAL TOTALS:\n";
    csvContent += "----------------\n";
    
    // Order categories for the summary
    const categoryOrder = [
      { prefix: 'CONDCOIL', label: 'Condenser Coils' },
      { prefix: 'REFRIGERATOR_COILS', label: 'Refrigerator Coils' },
      { prefix: 'PRODUCE', label: 'Produce Coils' },
      { prefix: 'P-TRAP', label: 'P-Traps' }
    ];
    
    // Add the ordered categories first
    categoryOrder.forEach(category => {
      if (materialsByType[category.prefix]) {
        csvContent += `${category.label}: ${materialsByType[category.prefix]}\n`;
      }
    });
    
    // Group filter types for cleaner display
    const polyMendTotal = Object.entries(materialsByType)
      .filter(([type]) => type.startsWith('S') && type.endsWith('MEND'))
      .reduce((sum, [_, qty]) => sum + qty, 0);
      
    const polyTotal = Object.entries(materialsByType)
      .filter(([type]) => type.startsWith('S') && !type.endsWith('MEND'))
      .reduce((sum, [_, qty]) => sum + qty, 0);
      
    const fiberglassTotal = Object.entries(materialsByType)
      .filter(([type]) => type.startsWith('G') && type.endsWith('B'))
      .reduce((sum, [_, qty]) => sum + qty, 0);
      
    const frameTotal = Object.entries(materialsByType)
      .filter(([type]) => type.startsWith('F'))
      .reduce((sum, [_, qty]) => sum + qty, 0);
      
    const pleatedTotal = Object.entries(materialsByType)
      .filter(([type]) => type.startsWith('P') && type.includes('INS'))
      .reduce((sum, [_, qty]) => sum + qty, 0);
    
    // Add filter group totals
    if (polyMendTotal > 0) csvContent += `Polyester MEND Filters: ${polyMendTotal}\n`;
    if (polyTotal > 0) csvContent += `Polyester Filters: ${polyTotal}\n`;
    if (fiberglassTotal > 0) csvContent += `Fiberglass Filters: ${fiberglassTotal}\n`;
    if (pleatedTotal > 0) csvContent += `Pleated Filters: ${pleatedTotal}\n`;
    if (frameTotal > 0) csvContent += `Frames: ${frameTotal}\n`;
    
    // SECTION 2: Packaging units needed
    csvContent += "\nPACKAGING UNITS NEEDED:\n";
    csvContent += "----------------------\n";
    
    if (packagingNeeded['POLY_MEND']?.units > 0) {
      csvContent += `Polyester MEND: ${packagingNeeded['POLY_MEND'].units} bags (${packagingNeeded['POLY_MEND'].quantity} filters)\n`;
    }
    
    if (packagingNeeded['POLY']?.units > 0) {
      csvContent += `Polyester: ${packagingNeeded['POLY'].units} bags (${packagingNeeded['POLY'].quantity} filters)\n`;
    }
    
    if (packagingNeeded['FIBERGLASS']?.units > 0) {
      csvContent += `Fiberglass: ${packagingNeeded['FIBERGLASS'].units} boxes (${packagingNeeded['FIBERGLASS'].quantity} filters)\n`;
    }
    
    if (packagingNeeded['PLEATED']?.units > 0) {
      csvContent += `Pleated: ${packagingNeeded['PLEATED'].units} bundles (${packagingNeeded['PLEATED'].quantity} filters)\n`;
    }
    
    // SECTION 3: Detailed breakdown by size
    csvContent += "\nDETAILED BREAKDOWN:\n";
    csvContent += "------------------\n";
    csvContent += "Type,Size,Quantity\n";
    
    // Sort entries by type for the detailed section
    const sortedEntries = Object.entries(materialsByType).sort((a, b) => {
      const typeA = a[0];
      const typeB = b[0];
      
      // Sort CONDCOIL first, then REFRIGERATOR_COILS, then others
      if (typeA === 'CONDCOIL') return -1;
      if (typeB === 'CONDCOIL') return 1;
      if (typeA === 'REFRIGERATOR_COILS') return -1;
      if (typeB === 'REFRIGERATOR_COILS') return 1;
      if (typeA === 'PRODUCE') return -1;
      if (typeB === 'PRODUCE') return 1;
      
      // Sort polyester MEND filters before regular polyester filters
      if (typeA.startsWith('S') && typeA.endsWith('MEND') && !(typeB.startsWith('S') && typeB.endsWith('MEND'))) return -1;
      if (!(typeA.startsWith('S') && typeA.endsWith('MEND')) && typeB.startsWith('S') && typeB.endsWith('MEND')) return 1;
      
      // Sort regular polyester filters before fiberglass filters
      if (typeA.startsWith('S') && !typeB.startsWith('S')) return -1;
      if (!typeA.startsWith('S') && typeB.startsWith('S')) return 1;
      
      // Sort pleated filters after fiberglass but before frames
      if (typeA.startsWith('P') && typeB.startsWith('F')) return -1;
      if (typeA.startsWith('F') && typeB.startsWith('P')) return 1;
      
      // Sort fiberglass filters before frames
      if (typeA.startsWith('G') && typeB.startsWith('F')) return -1;
      if (typeA.startsWith('F') && typeB.startsWith('G')) return 1;
      
      return typeA.localeCompare(typeB);
    });
    
    // Add detailed breakdown
    sortedEntries.forEach(([type, quantity]) => {
      const readableType = formatMaterialType(type);
      csvContent += `"${readableType}",${quantity}\n`;
    });
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `van_loading_${technicianName.replace(/\s+/g, '_')}.csv`);
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
