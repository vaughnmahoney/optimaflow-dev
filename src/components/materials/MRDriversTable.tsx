
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverRoute } from "@/services/optimoroute/getRoutesService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Truck, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface MRDriversTableProps {
  routes: DriverRoute[];
  onSelectDriver: (driver: DriverRoute) => void;
}

export const MRDriversTable = ({ routes, onSelectDriver }: MRDriversTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter drivers based on search query
  const filteredDrivers = routes.filter(route => 
    route.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.driverSerial.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="mr-2 h-5 w-5" />
          Available Drivers
          <Badge variant="outline" className="ml-2">
            {routes.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[400px] w-full pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead className="text-right">Stops</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                      No drivers match your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrivers.map((route) => (
                    <TableRow 
                      key={route.driverSerial}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelectDriver(route)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{route.driverName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {route.driverSerial}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{route.stops.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDriver(route);
                          }}
                        >
                          View Materials
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
