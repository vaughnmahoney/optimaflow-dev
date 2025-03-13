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

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedDrivers([]);
    reset();
  };

  const handleGenerateMR = async () => {
    if (!selectedDate) return;
    
    await fetchRouteMaterials({
      date: selectedDate
    });
  };

  const handleDriverSelect = (driverSerial: string) => {
    setSelectedDrivers(prevSelected => {
      if (prevSelected.includes(driverSerial)) {
        return prevSelected.filter(d => d !== driverSerial);
      } 
      return [...prevSelected, driverSerial];
    });
  };

  const handleBatchGenerate = () => {
    console.log(`Generating materials for ${selectedDrivers.length} drivers`);
  };

  const handleReset = () => {
    setSelectedDate(null);
    setSelectedDrivers([]);
    reset();
  };

  const getSelectedDriver = (): DriverRoute | null => {
    if (selectedDrivers.length !== 1) return null;
    return routes.find(route => route.driverSerial === selectedDrivers[0]) || null;
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
            materials={[]} // This will be filled with material data from the MRStore
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
