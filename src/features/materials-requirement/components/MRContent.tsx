
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMRStore } from "../hooks/useMRStore";
import { Fragment, useState } from "react";
import { formatMaterialType, getBadgeVariant, getMaterialCategory } from "../utils/materialsUtils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Download, ListFilter, PackageOpen, Printer } from "lucide-react";
import { MRMaterialSummary } from "./MRMaterialSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportMaterialsToExcel } from "../utils/materialsExportUtils";

export const MRContent = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { 
    materialsData,
    selectedDrivers,
    technicianName,
    addSelectedDriver,
    removeSelectedDriver,
    clearSelectedDrivers,
    getMaterialsForDriver,
    getTotalMaterialsCount
  } = useMRStore();
  
  // Get unique driver names
  const uniqueDrivers = Array.from(
    new Set(materialsData.map(item => item.driverName).filter(Boolean))
  ) as string[];
  
  // Get material categories
  const uniqueCategories = Array.from(
    new Set(materialsData.map(item => getMaterialCategory(item.type)))
  ).sort();
  
  // Get total materials count
  const totalMaterialsCount = getTotalMaterialsCount();
  
  // Filter materials by selected category
  const filterMaterialsByCategory = (materials: Record<string, number>) => {
    if (selectedCategory === "all") {
      return materials;
    }
    
    return Object.entries(materials).reduce((filtered, [type, count]) => {
      if (getMaterialCategory(type) === selectedCategory) {
        filtered[type] = count;
      }
      return filtered;
    }, {} as Record<string, number>);
  };
  
  const filteredMaterialsCount = filterMaterialsByCategory(totalMaterialsCount);
  
  // Get total count of materials
  const totalCount = Object.values(filteredMaterialsCount).reduce((sum, count) => sum + count, 0);
  
  // Handle driver selection
  const toggleDriverSelection = (driverName: string) => {
    if (selectedDrivers.includes(driverName)) {
      removeSelectedDriver(driverName);
    } else {
      addSelectedDriver(driverName);
    }
  };
  
  // Handle print
  const handlePrint = () => {
    window.print();
  };
  
  // Handle excel export
  const handleExportExcel = () => {
    // Use the exported utility function for Excel export
    if (selectedDrivers.length > 0) {
      // Export just the selected drivers
      const selectedDriversMaterials = selectedDrivers.flatMap(driverName => 
        getMaterialsForDriver(driverName)
      );
      
      const fileName = selectedDrivers.length === 1 
        ? selectedDrivers[0] 
        : `${selectedDrivers.length}-Drivers`;
        
      exportMaterialsToExcel(selectedDriversMaterials, fileName);
    } else {
      // Export all materials
      exportMaterialsToExcel(materialsData, technicianName);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 print:hidden">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-1">Materials Requirement</h2>
          <p className="text-muted-foreground text-sm">
            {selectedDrivers.length > 0 
              ? `Showing materials for ${selectedDrivers.length} selected driver(s)` 
              : `Showing all materials for ${uniqueDrivers.length} driver(s)`}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportExcel}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Excel</span>
          </Button>
        </div>
      </div>
      
      {/* Print header - only visible when printing */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">{technicianName}</h1>
        <p className="text-gray-500">
          {selectedDrivers.length > 0 
            ? `Materials for: ${selectedDrivers.join(', ')}` 
            : 'All Materials'}
        </p>
        <p className="text-sm text-gray-400">Printed on {new Date().toLocaleDateString()}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Drivers selector */}
        <div className="lg:col-span-1 print:hidden">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center">
                  <ListFilter className="h-4 w-4 mr-2" />
                  Filter by Driver
                </span>
                {selectedDrivers.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedDrivers}
                    className="h-7 px-2 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                <div className="px-4 pb-4">
                  {uniqueDrivers.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No drivers found</p>
                  ) : (
                    uniqueDrivers.map((driverName) => {
                      const isSelected = selectedDrivers.includes(driverName);
                      const driverMaterials = getMaterialsForDriver(driverName);
                      const materialCount = driverMaterials.reduce((sum, item) => sum + item.quantity, 0);
                      
                      return (
                        <div
                          key={driverName}
                          className={`flex items-center justify-between p-2 my-1 rounded-md cursor-pointer transition-colors ${
                            isSelected 
                              ? "bg-primary/10 hover:bg-primary/15" 
                              : "hover:bg-muted"
                          }`}
                          onClick={() => toggleDriverSelection(driverName)}
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight 
                              className={`h-3 w-3 transition-transform ${isSelected ? "rotate-90" : ""}`} 
                            />
                            <span className="text-sm">{driverName}</span>
                          </div>
                          <Badge variant="outline" className="ml-auto">
                            {materialCount}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Category Filter */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <PackageOpen className="h-4 w-4 mr-2" />
                Filter by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
        
        {/* Content area */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="print:hidden">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
              <TabsTrigger value="table" className="flex-1">Table View</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <TabsContent value="summary" className="mt-0 print:block">
            <MRMaterialSummary 
              categoryFilter={selectedCategory !== "all" ? selectedCategory : undefined} 
            />
          </TabsContent>
          
          <TabsContent value="table" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <PackageOpen className="h-4 w-4 mr-2" />
                  Materials Table
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(filteredMaterialsCount).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                            No materials found
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {Object.entries(filteredMaterialsCount)
                            .sort(([a], [b]) => {
                              // Sort by category first, then by type
                              const catA = getMaterialCategory(a);
                              const catB = getMaterialCategory(b);
                              
                              if (catA === catB) {
                                return a.localeCompare(b);
                              }
                              return catA.localeCompare(catB);
                            })
                            .map(([type, count], index, array) => {
                              const category = getMaterialCategory(type);
                              const prevCategory = index > 0 ? getMaterialCategory(array[index - 1][0]) : null;
                              const showCategoryHeader = index === 0 || category !== prevCategory;
                              
                              return (
                                <Fragment key={type}>
                                  {showCategoryHeader && (
                                    <TableRow className="bg-muted/50">
                                      <TableCell colSpan={2} className="py-2 font-medium text-xs uppercase">
                                        {category}
                                      </TableCell>
                                    </TableRow>
                                  )}
                                  <TableRow>
                                    <TableCell>
                                      <Badge 
                                        variant={getBadgeVariant(type)}
                                        className="font-normal"
                                      >
                                        {formatMaterialType(type)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{count}</TableCell>
                                  </TableRow>
                                </Fragment>
                              );
                            })
                          }
                          <TableRow className="border-t-2">
                            <TableCell className="font-medium">Total</TableCell>
                            <TableCell className="text-right font-medium">{totalCount}</TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  );
};
