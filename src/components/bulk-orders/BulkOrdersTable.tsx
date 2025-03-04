
import { WorkOrder } from "@/components/workorders/types";
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from "@/components/ui/table";
import { format } from "date-fns";
import { Eye, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/workorders/StatusBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BulkOrdersTableProps {
  orders: WorkOrder[];
  isLoading: boolean;
}

export const BulkOrdersTable = ({ orders, isLoading }: BulkOrdersTableProps) => {
  console.log("BulkOrdersTable received orders:", orders.length);
  
  if (isLoading) {
    return (
      <div className="rounded-md border p-8">
        <div className="flex justify-center">
          <div className="animate-pulse text-muted-foreground">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    console.log("No orders found to display");
    return (
      <div className="rounded-md border p-8">
        <div className="flex justify-center">
          <div className="text-muted-foreground">No orders found</div>
        </div>
      </div>
    );
  }

  // Helper function to safely get location name with fallbacks
  const getLocationName = (order: WorkOrder): string => {
    if (!order.location) return 'N/A';
    
    if (typeof order.location === 'object') {
      return order.location.name || 'N/A';
    }
    
    if (typeof order.location === 'string') {
      return order.location;
    }
    
    return 'N/A';
  };

  // Helper function to safely get driver name with fallbacks
  const getDriverName = (order: WorkOrder): string => {
    if (!order.driver) return 'No Driver';
    
    if (typeof order.driver === 'object') {
      return order.driver.name || 'No Name';
    }
    
    if (typeof order.driver === 'string') {
      return order.driver;
    }
    
    return 'No Driver';
  };

  // Extract completion details (image count, signature status)
  const getImageCount = (order: WorkOrder): number => {
    if (!order.completion_response?.orders?.[0]?.data?.form?.images) {
      return 0;
    }
    return order.completion_response.orders[0].data.form.images.length;
  };

  // Determine image status for display
  const getImageStatus = (order: WorkOrder): { text: string, hasImages: boolean } => {
    const imageCount = getImageCount(order);
    
    if (imageCount > 0) {
      return { text: `${imageCount} images`, hasImages: true };
    }
    
    return { text: "No", hasImages: false };
  };

  // Handle opening the tracking URL
  const openTrackingUrl = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Service Date</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Images</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tracking</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const imageStatus = getImageStatus(order);
            const completionStatus = order.completion_status || 'unknown';
            
            return (
              <TableRow key={order.id || order.order_no}>
                <TableCell className="font-medium">{order.order_no}</TableCell>
                <TableCell>
                  {order.service_date ? format(new Date(order.service_date), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {getDriverName(order)}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">{getLocationName(order)}</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{getLocationName(order)}</p>
                        {order.location?.address && <p className="text-xs">{order.location.address}</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  {imageStatus.hasImages ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  ) : (
                    imageStatus.text
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status || "imported"} />
                  {completionStatus !== "unknown" && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({completionStatus})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {order.tracking_url ? (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-blue-500"
                      onClick={() => openTrackingUrl(order.tracking_url as string)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm" side="left">
                        <div className="space-y-1 text-xs">
                          <div><strong>Service Notes:</strong> {order.service_notes || "None"}</div>
                          <div><strong>Tech Notes:</strong> {order.tech_notes || "None"}</div>
                          <div><strong>Has Signature:</strong> {order.signature_url ? "Yes" : "No"}</div>
                          <div><strong>Status:</strong> {completionStatus}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="p-4 text-sm text-muted-foreground">
        Showing {orders.length} orders
      </div>
    </div>
  );
};
