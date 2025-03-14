
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Search, Truck, User } from 'lucide-react';
import { DriverRoute } from '@/services/optimoroute/getRoutesService';
import { useMRStore } from '@/hooks/materials/useMRStore';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MRDriverListProps {
  routes: DriverRoute[];
  onDriverSelect: (driverSerial: string) => void;
  selectedDrivers: string[];
  onBatchSelect: () => void;
}

export const MRDriverList = ({ 
  routes, 
  onDriverSelect, 
  selectedDrivers,
  onBatchSelect
}: MRDriverListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { clearData } = useMRStore();
  
  // Filter drivers based on search query
  const filteredDrivers = routes.filter(route => 
    route.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.driverSerial.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleDriverClick = (driverSerial: string) => {
    onDriverSelect(driverSerial);
  };
  
  const handleBatchGenerate = () => {
    if (selectedDrivers.length === 0) return;
    onBatchSelect();
  };
  
  // Determine if all drivers are selected
  const allDriversSelected = routes.length > 0 && 
    selectedDrivers.length === routes.length;
  
  // Select all drivers
  const handleSelectAll = () => {
    if (allDriversSelected) {
      // If all are selected, deselect all
      clearData();
      onDriverSelect('');
    } else {
      // Select all drivers
      const allDriverSerials = routes.map(route => route.driverSerial);
      allDriverSerials.forEach(serial => {
        if (!selectedDrivers.includes(serial)) {
          onDriverSelect(serial);
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Truck className="mr-2 h-5 w-5" />
            Drivers
          </span>
          <Badge variant="outline" className="ml-2">
            {routes.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Select drivers to generate material requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        {/* Batch actions */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSelectAll}
            className="text-xs"
          >
            <CheckSquare className="mr-1 h-3.5 w-3.5" />
            {allDriversSelected ? 'Deselect All' : 'Select All'}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            disabled={selectedDrivers.length === 0}
            onClick={handleBatchGenerate}
            className="text-xs"
          >
            Generate for {selectedDrivers.length} selected
          </Button>
        </div>
        
        {/* Driver list */}
        {filteredDrivers.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No drivers match your search
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {filteredDrivers.map((route) => (
                <div
                  key={route.driverSerial}
                  className={`flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors ${
                    selectedDrivers.includes(route.driverSerial)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  }`}
                  onClick={() => handleDriverClick(route.driverSerial)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{route.driverName}</p>
                      <p className="text-xs text-muted-foreground">
                        {route.stops.length} stops
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {selectedDrivers.includes(route.driverSerial) && (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
