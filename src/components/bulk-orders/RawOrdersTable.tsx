
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RawJsonViewer } from "./RawJsonViewer";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/workorders/StatusBadge";
import { useBulkOrderStatus } from "@/hooks/bulk-orders/useBulkOrderStatus";
import { Button } from "@/components/ui/button";
import { useBulkOrderImport } from "@/hooks/bulk-orders/useBulkOrderImport";
import { Loader2, Database, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface RawOrdersTableProps {
  orders: any[];
  isLoading: boolean;
  originalCount?: number;
}

export const RawOrdersTable = ({ orders, isLoading, originalCount }: RawOrdersTableProps) => {
  const { getCompletionStatus, getQcStatus } = useBulkOrderStatus();
  const { importOrders, isImporting, importResult, importProgress } = useBulkOrderImport();
  
  // State for limiting displayed orders
  const [displayLimit, setDisplayLimit] = useState(20);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return <div className="py-8 text-center">Loading orders...</div>;
  }

  if (!orders || orders.length === 0) {
    return <div className="py-8 text-center">No orders found</div>;
  }

  // Limit the number of orders displayed to prevent performance issues
  const displayedOrders = showAll ? orders : orders.slice(0, displayLimit);

  // Extract basic info to display in the table
  const getOrderNo = (order: any) => {
    return order.data?.orderNo || 
           order.orderNo || 
           (order.completionDetails && order.completionDetails.orderNo) ||
           'N/A';
  };

  const getServiceDate = (order: any) => {
    const date = order.data?.date ||
                 order.service_date || 
                 (order.searchResponse && order.searchResponse.data && order.searchResponse.data.date) ||
                 null;
    
    if (date) {
      try {
        return format(new Date(date), "MMM d, yyyy");
      } catch (e) {
        return date;
      }
    }
    return 'N/A';
  };

  const getDriverName = (order: any) => {
    if (order.driver && typeof order.driver === 'object' && order.driver.name) {
      return order.driver.name;
    }
    
    if (order.scheduleInformation && order.scheduleInformation.driverName) {
      return order.scheduleInformation.driverName;
    }
    
    if (order.searchResponse && order.searchResponse.scheduleInformation && 
        order.searchResponse.scheduleInformation.driverName) {
      return order.searchResponse.scheduleInformation.driverName;
    }
    
    return 'N/A';
  };

  const hasImages = (order: any) => {
    return !!(order.completionDetails?.data?.form?.images?.length > 0);
  };

  // Handle importing ALL orders, not just the displayed ones
  const handleImport = async () => {
    await importOrders(orders);
  };

  // Toggle between showing limited orders and all orders
  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <div className="space-y-4">
      {/* Stats section */}
      <div className="text-sm bg-slate-50 p-3 rounded border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="font-medium">
              Found <span className="text-green-600 font-bold">{orders.length}</span> orders
            </span>
            <p className="text-muted-foreground text-xs">
              Displaying {displayedOrders.length} of {orders.length} orders to improve performance
            </p>
          </div>
          
          {originalCount !== undefined && originalCount !== orders.length && (
            <div className="text-muted-foreground">
              <span className="font-medium">Deduplication applied:</span> {orders.length} unique orders from {originalCount} total entries.
              <span className="ml-2 text-green-600">
                ({originalCount - orders.length} duplicates removed)
              </span>
            </div>
          )}
          
          <Button 
            className="ml-auto"
            onClick={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Save to Database
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Import progress indicator */}
      {isImporting && importProgress.total > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Importing orders in batches...</span>
            <span>{importProgress.current} of {importProgress.total} ({importProgress.percentage}%)</span>
          </div>
          <Progress value={importProgress.percentage} className="h-2" />
        </div>
      )}
      
      {/* Import result alert */}
      {importResult && (
        <Alert variant={importResult.success ? "default" : "destructive"} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {importResult.success 
              ? "Import Successful" 
              : "Import Completed with Issues"}
          </AlertTitle>
          <AlertDescription>
            {importResult.imported} orders imported successfully, 
            {importResult.duplicates} duplicates skipped,
            {importResult.errors} errors encountered.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Display toggle button only if there are more orders than the limit */}
      {orders.length > displayLimit && !showAll && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleShowAll}
          className="w-full flex items-center justify-center text-sm"
        >
          {showAll ? (
            <>Show Less <ChevronUp className="ml-2 h-4 w-4" /></>
          ) : (
            <>Show All Orders <ChevronDown className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Images</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedOrders.map((order, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{getOrderNo(order)}</TableCell>
                <TableCell>{getServiceDate(order)}</TableCell>
                <TableCell>{getDriverName(order)}</TableCell>
                <TableCell>
                  <StatusBadge 
                    status={getQcStatus(order)}
                    completionStatus={getCompletionStatus(order)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  {hasImages(order) ? (
                    <Badge variant="outline" className="bg-slate-100">
                      {order.completionDetails?.data?.form?.images?.length || 0}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400">None</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <RawJsonViewer data={order} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Warning message when showing limited orders */}
      {!showAll && orders.length > displayLimit && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Showing {displayedOrders.length} of {orders.length} orders</p>
          <p>Limited display for better performance</p>
          <Button 
            variant="link" 
            onClick={toggleShowAll}
            className="h-6 p-0"
          >
            Show All
          </Button>
        </div>
      )}
      
      {/* Display toggle button at the bottom too */}
      {showAll && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleShowAll}
          className="w-full flex items-center justify-center text-sm"
        >
          <ChevronUp className="mr-2 h-4 w-4" />
          Show Less
        </Button>
      )}
    </div>
  );
};
