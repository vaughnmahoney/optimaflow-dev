
import { Layout } from "@/components/Layout";
import { MRUploader } from "@/components/materials/MRUploader";
import { MRContent } from "@/components/materials/MRContent";
import { Header } from "@/components/Header";

export default function MaterialsRequirement() {
  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <Header title="Materials Requirement Generator">
          <p className="text-muted-foreground">
            Generate and manage Materials Requirements (MR) for technicians
          </p>
        </Header>
        
        <MRUploader />
        
        <MRContent />
      </div>
    </Layout>
  );
}
