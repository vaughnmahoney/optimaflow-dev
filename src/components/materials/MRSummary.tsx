
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Filter, Wind, Truck, Clipboard } from "lucide-react";

interface MRSummaryProps {
  summary: {
    totalFilters: number;
    totalCoils: number;
    totalDrivers: number;
    totalWorkOrders: number;
  };
}

export const MRSummary = ({ summary }: MRSummaryProps) => {
  const { totalFilters, totalCoils, totalDrivers, totalWorkOrders } = summary;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5" /> 
          Material Requirements Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Filters</p>
              <p className="text-2xl font-bold">{totalFilters}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Wind className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Coils</p>
              <p className="text-2xl font-bold">{totalCoils}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Drivers</p>
              <p className="text-2xl font-bold">{totalDrivers}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clipboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Work Orders</p>
              <p className="text-2xl font-bold">{totalWorkOrders}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
