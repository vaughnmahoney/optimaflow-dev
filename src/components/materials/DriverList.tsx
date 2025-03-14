
import { useMRStore } from "@/store/useMRStore";
import { Check, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface DriverListProps {
  drivers: any[];
  isLoading: boolean;
}

export const DriverList = ({ drivers, isLoading }: DriverListProps) => {
  const { selectedDriver, setSelectedDriver } = useMRStore();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!drivers || drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">
          No drivers available. Please import data first.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            onClick={() => setSelectedDriver(driver)}
            className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors
              ${
                selectedDriver && selectedDriver.id === driver.id
                  ? "bg-primary/5 border-primary/30"
                  : "hover:bg-muted/50"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-full">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{driver.name}</p>
                <p className="text-xs text-muted-foreground">
                  {driver.workOrders?.length || 0} work orders
                </p>
              </div>
            </div>
            {selectedDriver && selectedDriver.id === driver.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
