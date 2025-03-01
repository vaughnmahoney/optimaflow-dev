
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, Flag, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { WorkOrder } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortDirection = 'asc' | 'desc' | null;
type SortField = 'order_no' | 'service_date' | 'driver' | 'location' | 'status' | null;

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
}

export const WorkOrderTable = ({ 
  workOrders: initialWorkOrders, 
  onStatusUpdate,
  onImageView,
  onDelete,
  sortField: externalSortField,
  sortDirection: externalSortDirection,
  onSort: externalOnSort
}: WorkOrderTableProps) => {
  const [sortField, setSortField] = useState<SortField>(externalSortField || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(externalSortDirection || null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);

  useEffect(() => {
    if (externalSortField !== undefined) {
      setSortField(externalSortField);
    }
    if (externalSortDirection !== undefined) {
      setSortDirection(externalSortDirection);
    }
  }, [externalSortField, externalSortDirection]);

  useEffect(() => {
    let sortedWorkOrders = [...initialWorkOrders];
    
    if (sortField && sortDirection) {
      sortedWorkOrders.sort((a, b) => {
        let valueA: any;
        let valueB: any;
        
        switch (sortField) {
          case 'order_no':
            valueA = a.order_no || '';
            valueB = b.order_no || '';
            break;
          case 'service_date':
            valueA = a.service_date ? new Date(a.service_date).getTime() : 0;
            valueB = b.service_date ? new Date(b.service_date).getTime() : 0;
            break;
          case 'driver':
            valueA = getDriverName(a).toLowerCase();
            valueB = getDriverName(b).toLowerCase();
            break;
          case 'location':
            valueA = getLocationName(a).toLowerCase();
            valueB = getLocationName(b).toLowerCase();
            break;
          case 'status':
            valueA = a.status || '';
            valueB = b.status || '';
            break;
          default:
            return 0;
        }
        
        // For strings, use localeCompare for proper string comparison
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        
        // For numbers and dates (already converted to timestamps)
        return sortDirection === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
      });
    }
    
    setWorkOrders(sortedWorkOrders);
  }, [initialWorkOrders, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = null;
    
    if (field === sortField) {
      // Cycle through: null -> asc -> desc -> null
      if (sortDirection === null) newDirection = 'asc';
      else if (sortDirection === 'asc') newDirection = 'desc';
      else newDirection = null;
    } else {
      // New field, start with ascending
      newDirection = 'asc';
    }
    
    setSortField(newDirection === null ? null : field);
    setSortDirection(newDirection);
    
    if (externalOnSort) {
      externalOnSort(newDirection === null ? null : field, newDirection);
    }
  };

  const getLocationName = (order: WorkOrder): string => {
    if (!order.location) return 'N/A';
    return order.location.name || order.location.locationName || 'N/A';
  };

  const getDriverName = (order: WorkOrder): string => {
    return order.search_response?.scheduleInformation?.driverName || 'No Driver Assigned';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              sortable
              sortDirection={sortField === 'order_no' ? sortDirection : null}
              onSort={() => handleSort('order_no')}
            >
              Order #
            </TableHead>
            <TableHead 
              sortable
              sortDirection={sortField === 'service_date' ? sortDirection : null}
              onSort={() => handleSort('service_date')}
            >
              Service Date
            </TableHead>
            <TableHead 
              sortable
              sortDirection={sortField === 'driver' ? sortDirection : null}
              onSort={() => handleSort('driver')}
            >
              Driver
            </TableHead>
            <TableHead 
              sortable
              sortDirection={sortField === 'location' ? sortDirection : null}
              onSort={() => handleSort('location')}
            >
              Location
            </TableHead>
            <TableHead 
              sortable
              sortDirection={sortField === 'status' ? sortDirection : null}
              onSort={() => handleSort('status')}
            >
              Status
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                No work orders found. Import orders from OptimoRoute to get started.
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((workOrder) => (
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
                      <DropdownMenuContent align="end">
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
