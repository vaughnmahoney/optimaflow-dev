
import { Layout } from "@/components/Layout";
import { BulkOrdersForm } from "@/components/bulk-orders/BulkOrdersForm";
import { useBulkOrdersFetch } from "@/hooks/useBulkOrdersFetch";
import { RawOrdersTable } from "@/components/bulk-orders/RawOrdersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BulkOrdersTest = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    rawOrders,
    activeTab,
    setActiveTab,
    handleFetchOrders,
  } = useBulkOrdersFetch();

  return (
    <Layout title="Bulk Orders Test">
      <div className="space-y-6">
        <BulkOrdersForm
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isLoading={isLoading}
          onFetchOrders={handleFetchOrders}
        />

        {rawOrders && rawOrders.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Raw Orders Data</CardTitle>
              <Badge variant="outline">{rawOrders.length} Orders</Badge>
            </CardHeader>
            <CardContent>
              <RawOrdersTable 
                orders={rawOrders} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default BulkOrdersTest;
