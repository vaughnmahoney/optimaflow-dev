
import React, { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { MRDateImport } from '@/components/materials/MRDateImport';
import { MRSummary } from '@/components/materials/MRSummary';
import { DriverList } from '@/components/materials/DriverList';
import { useMRStore } from '@/store/useMRStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MaterialRequirementsSummary } from '@/components/materials/MaterialRequirementsSummary';
import { AlertCircle } from 'lucide-react';
import { WorkOrderList } from '@/components/materials/WorkOrderList';

const MaterialRequirements = () => {
  const { isLoading, error, drivers, summary, calculateSummary, selectedDriver } = useMRStore();

  useEffect(() => {
    // Calculate summary whenever selections change
    calculateSummary();
  }, [calculateSummary]);

  return (
    <Layout title="Material Requirements">
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <MRDateImport />
          <MRSummary summary={summary} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Driver Selection</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-md bg-destructive/15 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-destructive">{error}</p>
              </div>
            ) : (
              <DriverList drivers={drivers} isLoading={isLoading} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Material Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="workorders">Work Orders</TabsTrigger>
                <TabsTrigger value="drivers">By Driver</TabsTrigger>
                <TabsTrigger value="materials">By Material</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <MaterialRequirementsSummary />
              </TabsContent>
              
              <TabsContent value="workorders">
                {selectedDriver ? (
                  <WorkOrderList workOrders={selectedDriver.workOrders} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a driver to view their work orders
                  </p>
                )}
              </TabsContent>

              <TabsContent value="drivers">
                <p className="text-sm text-muted-foreground">
                  Driver-specific material breakdown will appear here.
                </p>
              </TabsContent>

              <TabsContent value="materials">
                <p className="text-sm text-muted-foreground">
                  Materials breakdown by type will appear here.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MaterialRequirements;
