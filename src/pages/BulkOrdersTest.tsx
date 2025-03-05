
import { Layout } from "@/components/Layout";
import { BulkOrdersForm } from "@/components/bulk-orders/BulkOrdersForm";

const BulkOrdersTest = () => {
  return (
    <Layout title="Bulk Orders Test">
      <div className="space-y-6">
        <BulkOrdersForm />
      </div>
    </Layout>
  );
};

export default BulkOrdersTest;
