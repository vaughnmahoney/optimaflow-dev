
import { useMRStore } from "@/store/useMRStore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Truck, Package } from "lucide-react";

interface DriverListProps {
  drivers: any[];
  isLoading: boolean;
}

export const DriverList = ({ drivers, isLoading }: DriverListProps) => {
  const { selectedDrivers, setSelectedDrivers, setSelectedDriver } = useMRStore();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Truck className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg">No drivers available</h3>
        <p className="text-muted-foreground">
          Import material requirements to view drivers
        </p>
      </div>
    );
  }

  const handleSelectDriver = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setSelectedDriver(driver);
    }
  };

  const handleSelectAllDrivers = () => {
    if (selectedDrivers.length === drivers.length) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(drivers.map(d => d.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="select-all"
            checked={selectedDrivers.length > 0 && selectedDrivers.length === drivers.length}
            onCheckedChange={handleSelectAllDrivers}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Select All Drivers
          </label>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDrivers([])}
          disabled={selectedDrivers.length === 0}
        >
          Clear Selection
        </Button>
      </div>
      
      <ScrollArea className="h-[350px]">
        <div className="space-y-2">
          {drivers.map((driver) => (
            <Card
              key={driver.id}
              className={`border cursor-pointer transition-colors ${
                selectedDrivers.includes(driver.id) ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`driver-${driver.id}`}
                    checked={selectedDrivers.includes(driver.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDrivers([...selectedDrivers, driver.id]);
                      } else {
                        setSelectedDrivers(selectedDrivers.filter(id => id !== driver.id));
                      }
                    }}
                  />
                  <div className="flex-1 ml-2" onClick={() => handleSelectDriver(driver.id)}>
                    <p className="font-medium">{driver.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Package className="h-3 w-3 mr-1" />
                      <span>{driver.workOrders?.length || 0} work orders</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSelectDriver(driver.id)}
                >
                  View
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
