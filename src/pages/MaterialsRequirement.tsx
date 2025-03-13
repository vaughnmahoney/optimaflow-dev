
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { MRUploader } from "@/components/materials/MRUploader";
import { MRAPIFetcher } from "@/components/materials/MRAPIFetcher";
import { MRContent } from "@/components/materials/MRContent";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MaterialsRequirement() {
  const [activeTab, setActiveTab] = useState("upload");
  
  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <Header title="Materials Requirement Generator">
          <p className="text-muted-foreground">
            Generate and manage Materials Requirements (MR) for technicians
          </p>
        </Header>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload">Upload Excel</TabsTrigger>
            <TabsTrigger value="api">Fetch from API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <MRUploader />
          </TabsContent>
          
          <TabsContent value="api">
            <MRAPIFetcher />
          </TabsContent>
        </Tabs>
        
        <MRContent />
      </div>
    </Layout>
  );
}
