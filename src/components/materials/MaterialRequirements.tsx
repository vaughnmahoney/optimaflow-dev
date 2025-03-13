
import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMRStore } from "@/store/useMRStore";
import { MRHeader } from "./MRHeader";
import { MRDriverList } from "./MRDriverList";
import { MRRouteImport } from "./MRRouteImport";
import { MRSummary } from "./MRSummary";
import { MaterialSummary } from "./types";

export const MaterialRequirements: React.FC = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { materialStats, drivers, selectedDrivers, dateSelected } = useMRStore();
  const [generatedMR, setGeneratedMR] = useState<{ [key: string]: MaterialSummary[] }>({});
  
  // Function to generate Material Requirements for selected drivers
  const generateMaterialRequirements = () => {
    // For now, we'll just set some example data
    const mrData: { [key: string]: MaterialSummary[] } = {};
    
    selectedDrivers.forEach(driverSerial => {
      const driver = drivers.find(d => d.driverSerial === driverSerial);
      if (driver) {
        mrData[driver.driverName] = [
          { type: "Fiberglass", size: "20x20x2", quantity: 50 },
          { type: "Pleated", size: "24x24x2", quantity: 30 },
          { type: "Condenser Coils", size: "N/A", quantity: 3 },
        ];
      }
    });
    
    setGeneratedMR(mrData);
    setActiveTab("generated");
  };
  
  return (
    <div className="flex flex-col gap-4">
      <MRHeader />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Route Summary</TabsTrigger>
          <TabsTrigger value="generated">Generated MR</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <MRRouteImport />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Material Requirements Summary
                {dateSelected && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {format(dateSelected, "MMMM d, yyyy")}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MRSummary stats={materialStats} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Driver Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <MRDriverList />
            </CardContent>
          </Card>
          
          <div className="flex justify-end mt-4">
            <Button 
              size="lg"
              onClick={generateMaterialRequirements}
              disabled={selectedDrivers.length === 0}
            >
              Generate Material Requirements
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="generated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Material Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(generatedMR).length > 0 ? (
                <Tabs defaultValue={Object.keys(generatedMR)[0]}>
                  <TabsList className="mb-4">
                    {Object.keys(generatedMR).map(driverName => (
                      <TabsTrigger key={driverName} value={driverName}>
                        {driverName}'s MR
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {Object.entries(generatedMR).map(([driverName, materials]) => (
                    <TabsContent key={driverName} value={driverName}>
                      <div className="rounded-md border">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="h-10 px-4 text-left font-medium">Material Type</th>
                              <th className="h-10 px-4 text-left font-medium">Size</th>
                              <th className="h-10 px-4 text-left font-medium">Quantity Needed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {materials.map((material, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-4">{material.type}</td>
                                <td className="p-4">{material.size}</td>
                                <td className="p-4">{material.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline">Export as PDF</Button>
                        <Button variant="outline">Export as CSV</Button>
                        <Button>Send to Warehouse</Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No material requirements generated yet. Please select drivers and generate MR first.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
