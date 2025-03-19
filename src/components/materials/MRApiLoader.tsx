
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MRDatePicker } from './MRDatePicker';
import { useMaterialRoutes } from '@/hooks/materials/useMaterialRoutes';
import { Loader2 } from 'lucide-react';
import { MRDebugPanel } from './MRDebugPanel';
import { MRDriverList } from './MRDriverList';
import { MRDriverOrders } from './MRDriverOrders';
import { DriverRoute } from '@/services/optimoroute/getRoutesService';
import { FetchProgressBar } from '../bulk-orders/FetchProgressBar';
import { useMRStore } from '@/hooks/materials/useMRStore';
import { toast } from 'sonner';

export const MRApiLoader = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const { 
    isLoading, 
    routes,
    orderDetails,
    fetchRouteMaterials, 
    reset,
    rawRoutesResponse, 
    rawOrderDetailsResponse,
    batchStats
  } = useMaterialRoutes();
  
  const { 
    materialsData, 
    setSelectedDrivers: storeSaveSelectedDrivers,
    clearSelectedDrivers
  } = useMRStore();

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedDrivers([]);
    clearSelectedDrivers();
    reset();
  };

  const handleGenerateMR = async () => {
    if (!selectedDate) return;
    
    await fetchRouteMaterials({
      date: selectedDate
    });
  };

  const handleDriverSelect = (driverName: string) => {
    setSelectedDrivers(prevSelected => {
      if (prevSelected.includes(driverName)) {
        return prevSelected.filter(d => d !== driverName);
      } 
      return [...prevSelected, driverName];
    });
  };

  const handleBatchGenerate = () => {
    if (selectedDrivers.length === 0) {
      toast.error("Please select at least one driver");
      return;
    }
    
    // Save the selected drivers to the MR store
    storeSaveSelectedDrivers(selectedDrivers);
    
    // Show success message with count of materials
    const driverMaterialsCount = materialsData.filter(
      item => item.driverName && selectedDrivers.includes(item.driverName)
    ).length;
    
    if (driverMaterialsCount > 0) {
      toast.success(`Generated material requirements for ${selectedDrivers.length} drivers (${driverMaterialsCount} items)`);
    } else {
      toast.warning(`No materials found for the selected ${selectedDrivers.length} drivers`);
    }
    
    console.log(`Generated materials for ${selectedDrivers.length} drivers`);
  };

  const handleReset = () => {
    setSelectedDate(null);
    setSelectedDrivers([]);
    clearSelectedDrivers();
    reset();
  };

  const getSelectedDriver = (): DriverRoute | null => {
    if (selectedDrivers.length !== 1) return null;
    return routes.find(route => route.driverName === selectedDrivers[0]) || null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate from OptimoRoute</CardTitle>
          <CardDescription>
            Fetch material requirements from upcoming routes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <MRDatePicker onDateSelect={handleDateSelect} disabled={isLoading} />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateMR} 
              disabled={!selectedDate || isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Loading...' : 'Fetch Routes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDebug(!showDebug)}
            >
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </Button>
          </div>
          
          {isLoading && batchStats && (
            <FetchProgressBar 
              processing={isLoading}
              stats={batchStats}
            />
          )}
        </CardContent>
      </Card>
      
      {routes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MRDriverList 
            routes={routes} 
            onDriverSelect={handleDriverSelect}
            selectedDrivers={selectedDrivers}
            onBatchSelect={handleBatchGenerate}
          />
          
          <MRDriverOrders 
            selectedDriver={getSelectedDriver()}
            orderDetails={orderDetails}
            materials={materialsData.filter(
              material => material.driverName === getSelectedDriver()?.driverName
            )}
          />
        </div>
      )}
      
      {showDebug && (
        <MRDebugPanel 
          routesResponse={rawRoutesResponse} 
          orderDetailsResponse={rawOrderDetailsResponse}
          isVisible={showDebug}
        />
      )}
    </div>
  );
};
