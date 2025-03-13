
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  FileDown,
  FileText,
  Send
} from "lucide-react";
import { useMRStore } from "@/store/useMRStore";
import { calculateMaterialSummaries } from "./utils/materialParser";

interface MRSummaryProps {
  onClose: () => void;
}

export const MRSummary = ({ onClose }: MRSummaryProps) => {
  const [activeTab, setActiveTab] = useState("all");
  
  const materialItems = useMRStore(state => state.materialItems);
  const drivers = useMRStore(state => state.drivers);
  const selectedDrivers = useMRStore(state => state.selectedDrivers);
  
  // Filter drivers that are selected
  const selectedDriversList = drivers.filter(driver => 
    selectedDrivers.includes(driver.driverSerial)
  );
  
  // Handle export as PDF
  const handleExportPdf = () => {
    console.log("Export as PDF not implemented");
  };
  
  // Handle export as CSV
  const handleExportCsv = () => {
    console.log("Export as CSV not implemented");
  };
  
  // Handle send to warehouse
  const handleSendToWarehouse = () => {
    console.log("Send to warehouse not implemented");
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Generated Material Requirements (MR)
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Drivers</TabsTrigger>
          {selectedDriversList.map(driver => (
            <TabsTrigger key={driver.driverSerial} value={driver.driverSerial}>
              {driver.driverName}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* All Drivers Tab */}
        <TabsContent value="all">
          <MaterialTable 
            title="All Selected Drivers' Materials"
            driverSerials={selectedDrivers}
            materialItems={materialItems}
          />
        </TabsContent>
        
        {/* Individual Driver Tabs */}
        {selectedDriversList.map(driver => (
          <TabsContent key={driver.driverSerial} value={driver.driverSerial}>
            <MaterialTable 
              title={`${driver.driverName}'s Materials`}
              driverSerials={[driver.driverSerial]}
              materialItems={materialItems}
            />
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Export Actions */}
      <div className="flex flex-wrap gap-2 justify-end mt-4">
        <Button variant="outline" onClick={handleExportPdf}>
          <FileDown className="mr-2 h-4 w-4" />
          Export as PDF
        </Button>
        <Button variant="outline" onClick={handleExportCsv}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </Button>
        <Button onClick={handleSendToWarehouse}>
          <Send className="mr-2 h-4 w-4" />
          Send to Warehouse
        </Button>
      </div>
    </div>
  );
};

interface MaterialTableProps {
  title: string;
  driverSerials: string[];
  materialItems: any[];
}

const MaterialTable = ({ title, driverSerials, materialItems }: MaterialTableProps) => {
  // Calculate material summaries for the selected drivers
  const materialSummaries = calculateMaterialSummaries(materialItems, driverSerials);
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">{title}</h4>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Quantity Needed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materialSummaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No materials found
                </TableCell>
              </TableRow>
            ) : (
              materialSummaries.map((summary, index) => (
                <TableRow key={index}>
                  <TableCell>{summary.type}</TableCell>
                  <TableCell>{summary.size}</TableCell>
                  <TableCell>
                    <Badge>{summary.quantity}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
