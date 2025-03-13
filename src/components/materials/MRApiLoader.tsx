
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MRDatePicker } from './MRDatePicker';
import { useMaterialRoutes } from '@/hooks/materials/useMaterialRoutes';
import { Loader2 } from 'lucide-react';
import { MRDebugPanel } from './MRDebugPanel';

export const MRApiLoader = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(true); // Default to visible for debugging
  const { 
    isLoading, 
    fetchRouteMaterials, 
    reset, 
    rawRoutesResponse, 
    rawOrderDetailsResponse 
  } = useMaterialRoutes();

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleGenerateMR = async () => {
    if (!selectedDate) return;
    
    console.log(`Generating MR for date: ${selectedDate}`);
    
    await fetchRouteMaterials({
      date: selectedDate
    });
  };

  const handleReset = () => {
    setSelectedDate(null);
    reset();
  };

  return (
    <>
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
              {isLoading ? 'Loading...' : 'Generate Requirements'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <MRDebugPanel 
        routesResponse={rawRoutesResponse} 
        orderDetailsResponse={rawOrderDetailsResponse}
        isVisible={showDebug}
      />
    </>
  );
};
