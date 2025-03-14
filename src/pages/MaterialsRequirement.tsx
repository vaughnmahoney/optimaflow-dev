
import { Layout } from "@/components/Layout";
import { MRUploader } from "@/components/materials/MRUploader";
import { MRContent } from "@/components/materials/MRContent";
import { Header } from "@/components/Header";

export default function MaterialsRequirement() {
  return (
    <Layout title="Materials Requirement Generator">
      <div className="container py-6 space-y-6">
        <MRUploader />
        <MRContent />
      </div>
    </Layout>
  );
}
