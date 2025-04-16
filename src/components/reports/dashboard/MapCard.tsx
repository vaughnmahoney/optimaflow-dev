
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const MapCard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Simulate loading the map
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="overflow-hidden h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle>Service Locations</CardTitle>
        <CardDescription>Work order distribution by location</CardDescription>
      </CardHeader>
      <CardContent className="p-0 h-[330px] relative">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="h-full bg-slate-100 relative">
            {/* Placeholder world map with dots */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 p-4">
              <div className="w-full h-full relative">
                {/* World map placeholder */}
                <img 
                  src="/lovable-uploads/b13aeb86-cedb-4aa2-9113-964555920084.png" 
                  alt="World map placeholder"
                  className="opacity-10 w-full h-full object-contain"
                />
                
                {/* Sample location markers */}
                <div className="absolute top-1/4 left-1/4 h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="absolute top-1/3 left-1/2 h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/3 h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="absolute top-2/3 left-2/3 h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <Alert className="w-auto bg-white/90 backdrop-blur-sm shadow-md">
                    <MapPin className="h-4 w-4" />
                    <AlertDescription>
                      Map will display real location data from the API.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
