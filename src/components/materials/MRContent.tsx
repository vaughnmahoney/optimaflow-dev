
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Download, UserCircle, Package } from "lucide-react";
import { useMRStore } from "@/hooks/materials/useMRStore";
import { MRTable } from "./MRTable";
import { MREmptyState } from "./MREmptyState";
import { MRSummary } from "./MRSummary";

export const MRContent = () => {
  const { materialsData, technicians } = useMRStore();
  const [activeTab, setActiveTab] = useState("all");
  
  if (!materialsData.length) {
    return <MREmptyState />;
  }
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExport = () => {
    // Create a CSV string
    let csvContent = "Material Type,Size/SKU,Quantity,Technician\n";
    
    materialsData.forEach(item => {
      csvContent += `"${item.type}","${item.size}",${item.quantity},"${item.driverName || 'Unassigned'}"\n`;
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'materials_requirements.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Materials Requirements
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
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Materials</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            {technicians.map(tech => (
              <TabsTrigger key={tech} value={tech}>
                <UserCircle className="h-4 w-4 mr-2" />
                {tech}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            <MRTable 
              data={materialsData} 
              technician={null}
            />
          </TabsContent>
          
          <TabsContent value="summary">
            <MRSummary data={materialsData} />
          </TabsContent>
          
          {technicians.map(tech => (
            <TabsContent key={tech} value={tech}>
              <MRTable 
                data={materialsData.filter(item => item.driverName === tech)} 
                technician={tech}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
