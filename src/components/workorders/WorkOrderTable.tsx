
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, Flag, Trash2, MoreVertical, Filter } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { WorkOrder } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
}

export const WorkOrderTable = ({ 
  workOrders, 
  onStatusUpdate,
  onImageView,
  onDelete
}: WorkOrderTableProps) => {
  // Add state for column filters
  const [filters, setFilters] = useState({
    order_no: "",
    service_date: "",
    driver: "",
    location: "",
    status: "",
  });

  const getLocationName = (order: WorkOrder): string => {
    if (!order.location) return 'N/A';
    return order.location.name || order.location.locationName || 'N/A';
  };

  const getDriverName = (order: WorkOrder): string => {
    return order.search_response?.scheduleInformation?.driverName || 'No Driver Assigned';
  };

  // Filter work orders based on all filters
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((order) => {
      // Check if order passes all filters
      const orderNoMatch = order.order_no?.toLowerCase().includes(filters.order_no.toLowerCase()) || filters.order_no === "";
      
      const serviceDateMatch = !filters.service_date || 
        (order.service_date && order.service_date.toLowerCase().includes(filters.service_date.toLowerCase()));
      
      const driverNameMatch = getDriverName(order).toLowerCase().includes(filters.driver.toLowerCase()) || filters.driver === "";
      
      const locationNameMatch = getLocationName(order).toLowerCase().includes(filters.location.toLowerCase()) || filters.location === "";
      
      const statusMatch = !filters.status || (order.status && order.status.includes(filters.status));
      
      return orderNoMatch && serviceDateMatch && driverNameMatch && locationNameMatch && statusMatch;
    });
  }, [workOrders, filters]);

  // Handle filter change
  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Column filter component
  const ColumnFilter = ({ column }: { column: keyof typeof filters }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 ml-1 hover:bg-muted"
            aria-label={`Filter ${column}`}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3 shadow-md bg-card" align="start">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Filter {column.replace('_', ' ')}</h4>
            <Input
              placeholder={`Filter by ${column.replace('_', ' ')}...`}
              value={filters[column]}
              onChange={(e) => handleFilterChange(column, e.target.value)}
              className="h-9"
            />
            {filters[column] && (
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">
                  Showing results for: <strong>{filters[column]}</strong>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => handleFilterChange(column, "")}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="flex items-center">
              Order #
              <ColumnFilter column="order_no" />
            </TableHead>
            <TableHead className="flex items-center">
              Service Date
              <ColumnFilter column="service_date" />
            </TableHead>
            <TableHead className="flex items-center">
              Driver
              <ColumnFilter column="driver" />
            </TableHead>
            <TableHead className="flex items-center">
              Location
              <ColumnFilter column="location" />
            </TableHead>
            <TableHead className="flex items-center">
              Status
              <ColumnFilter column="status" />
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredWorkOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                {workOrders.length === 0 
                  ? "No work orders found. Import orders from OptimoRoute to get started." 
                  : "No matching work orders found. Try adjusting your filters."}
              </TableCell>
            </TableRow>
          ) : (
            filteredWorkOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell>{workOrder.order_no || 'N/A'}</TableCell>
                <TableCell>
                  {workOrder.service_date ? format(new Date(workOrder.service_date), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {getDriverName(workOrder)}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {getLocationName(workOrder)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={workOrder.status || 'pending_review'} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="View Proof of Service"
                      onClick={() => onImageView(workOrder.id)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 z-50">
                        <DropdownMenuItem 
                          onClick={() => onStatusUpdate(workOrder.id, "approved")}
                          className={workOrder.status === 'approved' ? 'text-green-600' : ''}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onStatusUpdate(workOrder.id, "flagged")}
                          className={workOrder.status === 'flagged' ? 'text-red-600' : ''}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Flag for Review
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(workOrder.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
