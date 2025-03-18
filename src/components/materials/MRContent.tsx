
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package } from "lucide-react";
import { useMRStore } from "@/hooks/materials/useMRStore";
import { MRTable } from "./MRTable";
import { MREmptyState } from "./MREmptyState";
import { MRSummary } from "./MRSummary";
import { MRActions } from "./MRActions";
import { isFilterType } from "@/utils/materialsUtils";

export const MRContent = () => {
  const { materialsData, technicianName } = useMRStore();
  const [activeTab, setActiveTab] = useState("summary");
  
  // Filter out non-filter materials
  const filterMaterials = materialsData.filter(item => isFilterType(item.type));
  
  if (!filterMaterials.length) {
    return <MREmptyState />;
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Materials Requirements for {technicianName}
        </CardTitle>
        
        <MRActions 
          materialsData={filterMaterials}
          technicianName={technicianName}
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="all">All Materials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <MRSummary data={filterMaterials} technicianName={technicianName} />
          </TabsContent>
          
          <TabsContent value="all">
            <MRTable data={filterMaterials} technicianName={technicianName} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

