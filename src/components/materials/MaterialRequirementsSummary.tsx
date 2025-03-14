
import { useState } from "react";
import { useMRStore } from "@/store/useMRStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { groupMaterialsByCategory, formatMaterialType } from "@/utils/materialsUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Printer, ChevronDown, ChevronUp } from "lucide-react";

export const MaterialRequirementsSummary = () => {
  const { materialsData, technicianName, selectedDrivers } = useMRStore();
  const [activeTab, setActiveTab] = useState("summary");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: "type", direction: "asc" });

  // Exit early if no materials data
  if (!materialsData.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">
          No material requirements data available
        </p>
      </div>
    );
  }

  // Group materials by type for the summary
  const groupedMaterials = groupMaterialsByCategory(materialsData);

  // Filter by selected drivers if any
  const filteredMaterials = selectedDrivers.length > 0
    ? materialsData.filter(item => 
        item.driverSerial ? selectedDrivers.includes(item.driverSerial) : false
      )
    : materialsData;

  // Sort the materials data
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    if (sortConfig.key === "type") {
      if (sortConfig.direction === "asc") {
        return a.type.localeCompare(b.type);
      } else {
        return b.type.localeCompare(a.type);
      }
    } else if (sortConfig.key === "quantity") {
      if (sortConfig.direction === "asc") {
        return a.quantity - b.quantity;
      } else {
        return b.quantity - a.quantity;
      }
    }
    return 0;
  });

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc"
    }));
  };

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  // Handle export to CSV
  const handleExport = () => {
    // Format the CSV string
    let csvContent = `MATERIALS REQUIREMENTS FOR: ${technicianName.toUpperCase()}\n`;
    csvContent += `Date: ${new Date().toLocaleDateString()}\n\n`;
    csvContent += "MATERIAL TYPE,QUANTITY\n";
    
    // Add sorted materials
    sortedMaterials.forEach(item => {
      const readableType = formatMaterialType(item.type);
      csvContent += `"${readableType}",${item.quantity}\n`;
    });
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `material_requirements_${technicianName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sort function for grouped materials
  const sortedGroupedMaterials = Object.entries(groupedMaterials).sort((a, b) => {
    const order = [
      "CONDCOIL", "REFRIGERATOR_COILS", "PRODUCE", "P-TRAP",
      "POLY_MEND", "POLY", "FIBERGLASS", "PLEATED", "FRAMES"
    ];
    
    const indexA = order.indexOf(a[0]);
    const indexB = order.indexOf(b[0]);
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    return a[0].localeCompare(b[0]);
  });

  // Format category name
  const formatCategoryName = (category: string): string => {
    switch (category) {
      case "CONDCOIL": return "Condenser Coils";
      case "REFRIGERATOR_COILS": return "Refrigerator Coils";
      case "PRODUCE": return "Produce Coils";
      case "P-TRAP": return "P-Traps";
      case "POLY_MEND": return "Polyester MEND Filters";
      case "POLY": return "Polyester Filters";
      case "FIBERGLASS": return "Fiberglass Filters";
      case "PLEATED": return "Pleated Filters";
      case "FRAMES": return "Frames";
      default: return category;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Material Requirements{selectedDrivers.length > 0 ? ` (${selectedDrivers.length} Drivers Selected)` : ''}
        </h3>
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
      </div>
      
      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedGroupedMaterials.map(([category, quantity]) => (
                  <TableRow key={category}>
                    <TableCell className="font-medium">{formatCategoryName(category)}</TableCell>
                    <TableCell className="text-right">{quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        
        <TabsContent value="detailed">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("type")} className="cursor-pointer">
                    <div className="flex items-center">
                      Material Type
                      {sortConfig.key === "type" && (
                        sortConfig.direction === "asc" ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort("quantity")} 
                    className="text-right cursor-pointer"
                  >
                    <div className="flex items-center justify-end">
                      Quantity
                      {sortConfig.key === "quantity" && (
                        sortConfig.direction === "asc" ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMaterials.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{formatMaterialType(item.type)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
