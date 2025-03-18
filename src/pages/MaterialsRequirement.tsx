
import { Layout } from "@/components/Layout";
import { MRHeader } from "@/components/materials/MRHeader";
import { MRDateSelector } from "@/components/materials/MRDateSelector";
import { MRDriversTable } from "@/components/materials/MRDriversTable";
import { MRDriverDetail } from "@/components/materials/MRDriverDetail";
import { useMaterialRoutes } from "@/hooks/materials/useMaterialRoutes";
import { useState } from "react";
import { DriverRoute } from "@/services/optimoroute/getRoutesService";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function MaterialsRequirement() {
  const [selectedDriver, setSelectedDriver] = useState<DriverRoute | null>(null);
  const materialRoutes = useMaterialRoutes();
  
  const handleSelectDriver = (driver: DriverRoute | null) => {
    setSelectedDriver(driver);
  };

  return (
    <Layout title="Materials Requirement Generator">
      <div className="container py-6 space-y-6">
        <MRHeader />
        
        <div className="grid grid-cols-1 gap-6">
          <MRDateSelector 
            onFetchRoutes={materialRoutes.fetchRouteMaterials}
            onReset={() => {
              materialRoutes.reset();
              setSelectedDriver(null);
            }}
            isLoading={materialRoutes.isLoading}
            batchStats={materialRoutes.batchStats}
          />
          
          {materialRoutes.routes.length > 0 && !selectedDriver && (
            <MRDriversTable 
              routes={materialRoutes.routes}
              onSelectDriver={handleSelectDriver}
            />
          )}
          
          {selectedDriver && (
            <>
              <Alert variant="outline" className="bg-muted/50 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm text-foreground">
                  Viewing materials for {selectedDriver.driverName} ({selectedDriver.stops.length} stops)
                </AlertDescription>
              </Alert>
              
              <MRDriverDetail 
                driver={selectedDriver}
                orderDetails={materialRoutes.orderDetails}
                onBack={() => setSelectedDriver(null)}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
