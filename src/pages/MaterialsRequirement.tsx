
import { Layout } from "@/components/Layout";
import { MRUploader } from "@/components/materials/MRUploader";
import { MRContent } from "@/components/materials/MRContent";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, Route } from "lucide-react";

export default function MaterialsRequirement() {
  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <Header title="Materials Requirement Generator">
          <p className="text-muted-foreground">
            Generate and manage Materials Requirements (MR) for technicians
          </p>
        </Header>
        
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="api" className="flex items-center">
              <Route className="mr-2 h-4 w-4" />
              OptimoRoute
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center">
              <FileUp className="mr-2 h-4 w-4" />
              File Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="api" className="mt-4">
            <MRUploader />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-4">
            <MRUploader />
          </TabsContent>
        </Tabs>
        
        <MRContent />
      </div>
    </Layout>
  );
}
