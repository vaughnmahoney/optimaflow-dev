
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronRight,
  FileText,
  Search,
  CheckSquare
} from "lucide-react";
import { useMRStore } from "@/store/useMRStore";
import { DriverRoute } from "./types";

interface MRDriverListProps {
  onGenerateMR: () => void;
}

export const MRDriverList = ({ onGenerateMR }: MRDriverListProps) => {
  const [driverSearch, setDriverSearch] = useState("");
  const [selectMultiple, setSelectMultiple] = useState(false);
  
  const drivers = useMRStore(state => state.drivers);
  const toggleDriverSelection = useMRStore(state => state.toggleDriverSelection);
  const toggleDriverExpanded = useMRStore(state => state.toggleDriverExpanded);
  const selectAllDrivers = useMRStore(state => state.selectAllDrivers);
  const materialItems = useMRStore(state => state.materialItems);
  
  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(driver => 
    driver.driverName.toLowerCase().includes(driverSearch.toLowerCase())
  );
  
  // Get driver's material items
  const getDriverMaterialCount = (driverSerial: string): number => {
    return materialItems.filter(item => item.driverSerial === driverSerial)
      .reduce((sum, item) => sum + item.quantity, 0);
  };
  
  // Handle select all checkbox change
  const handleSelectAllChange = (checked: boolean) => {
    selectAllDrivers(checked);
  };
  
  // Handle multiple selection toggle
  const handleSelectMultipleChange = (checked: boolean) => {
    setSelectMultiple(checked);
    if (!checked) {
      // Deselect all drivers when turning off multiple selection
      selectAllDrivers(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Driver Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search drivers..."
          className="pl-9"
          value={driverSearch}
          onChange={(e) => setDriverSearch(e.target.value)}
        />
      </div>
      
      {/* Driver Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                {selectMultiple && (
                  <Checkbox 
                    checked={drivers.every(d => d.selected) && drivers.length > 0}
                    onCheckedChange={handleSelectAllChange}
                  />
                )}
              </TableHead>
              <TableHead>Driver Name</TableHead>
              <TableHead>Total Stops</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead className="text-right">View Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No drivers found
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <>
                  <TableRow key={driver.driverSerial}>
                    <TableCell>
                      <Checkbox 
                        checked={driver.selected}
                        onCheckedChange={() => toggleDriverSelection(driver.driverSerial)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {driver.driverName}
                    </TableCell>
                    <TableCell>
                      {driver.totalStops}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50">
                        {getDriverMaterialCount(driver.driverSerial)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDriverExpanded(driver.driverSerial)}
                      >
                        {driver.expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded order details */}
                  {driver.expanded && (
                    <ExpandedDriverDetails driver={driver} materialItems={materialItems} />
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="select-multiple" 
            checked={selectMultiple} 
            onCheckedChange={handleSelectMultipleChange}
          />
          <label 
            htmlFor="select-multiple" 
            className="text-sm cursor-pointer"
          >
            Select Multiple Drivers
          </label>
        </div>
        
        <Button 
          onClick={onGenerateMR}
          disabled={drivers.filter(d => d.selected).length === 0 && !selectMultiple}
        >
          <FileText className="mr-2 h-4 w-4" />
          Generate MR
        </Button>
      </div>
    </div>
  );
};

interface ExpandedDriverDetailsProps {
  driver: DriverRoute;
  materialItems: any[];
}

const ExpandedDriverDetails = ({ driver, materialItems }: ExpandedDriverDetailsProps) => {
  // Group materials by workOrderId (which is the store/location)
  const orderMaterialsMap: Record<string, { storeName: string; totalFilters: number }> = {};
  
  materialItems
    .filter(item => item.driverSerial === driver.driverSerial)
    .forEach(item => {
      if (!item.workOrderId) return;
      
      if (!orderMaterialsMap[item.workOrderId]) {
        orderMaterialsMap[item.workOrderId] = {
          storeName: item.storeName || 'Unknown Location',
          totalFilters: 0
        };
      }
      
      orderMaterialsMap[item.workOrderId].totalFilters += item.quantity;
    });
  
  return (
    <TableRow className="bg-slate-50">
      <TableCell colSpan={5} className="p-0">
        <div className="p-4">
          {Object.keys(orderMaterialsMap).length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No materials found for this driver
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(orderMaterialsMap).map(([orderNo, data]) => (
                <div key={orderNo} className="flex items-center py-1 px-4 text-sm">
                  <ChevronRight className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span className="flex-1">
                    {data.storeName} - Filters: <Badge variant="outline" className="ml-1 bg-white">
                      {data.totalFilters}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
