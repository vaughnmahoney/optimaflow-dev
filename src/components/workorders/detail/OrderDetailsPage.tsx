
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, User, Calendar, Clock, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { WorkOrder, ImageType } from "@/components/workorders/types";
import { transformWorkOrderData } from "@/utils/work-orders/transformUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const OrderDetailsPage = () => {
  const { orderNo } = useParams<{ orderNo: string }>();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [images, setImages] = useState<ImageType[]>([]);

  useEffect(() => {
    const fetchWorkOrder = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("work_orders")
          .select("*")
          .eq("order_no", orderNo)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const transformedWorkOrder = transformWorkOrderData(data);
          setWorkOrder(transformedWorkOrder);
          
          // Extract images from completion response
          const extractedImages: ImageType[] = [];
          
          if (transformedWorkOrder.completion_response &&
              transformedWorkOrder.completion_response.orders &&
              transformedWorkOrder.completion_response.orders[0] &&
              transformedWorkOrder.completion_response.orders[0].data &&
              transformedWorkOrder.completion_response.orders[0].data.form &&
              transformedWorkOrder.completion_response.orders[0].data.form.images) {
            
            const imageArray = transformedWorkOrder.completion_response.orders[0].data.form.images;
            if (Array.isArray(imageArray)) {
              imageArray.forEach((img) => {
                if (img.url) {
                  extractedImages.push({ 
                    url: img.url,
                    type: img.type || 'unknown'
                  });
                }
              });
            }
          }
          
          setImages(extractedImages);
        }
      } catch (error: any) {
        console.error("Error fetching work order:", error);
        toast.error(`Error fetching work order: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderNo) {
      fetchWorkOrder();
    }
  }, [orderNo]);

  const handleImageNav = (index: number) => {
    setActiveImageIndex(index);
  };

  if (isLoading) {
    return (
      <Layout title={`Order Details - ${orderNo || 'Loading...'}`}>
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/work-orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Work Orders
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6">
          <Skeleton className="h-[250px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!workOrder) {
    return (
      <Layout title="Order Not Found">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The work order {orderNo} could not be found in the database.
          </p>
          <Button asChild>
            <Link to="/work-orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Work Orders
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Order ${workOrder.order_no}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/work-orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Work Orders
          </Link>
        </Button>
        <Badge variant={
          workOrder.status === "approved" ? "success" :
          workOrder.status === "flagged" ? "destructive" :
          workOrder.status === "pending_review" ? "outline" : "default"
        }>
          {workOrder.status}
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Header card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{workOrder.order_no}</CardTitle>
                <CardDescription>
                  {workOrder.service_date && (
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(workOrder.service_date).toLocaleDateString()}
                    </span>
                  )}
                </CardDescription>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  {workOrder.optimoroute_status && (
                    <Badge variant="outline">{workOrder.optimoroute_status}</Badge>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground mt-1">
                  {workOrder.end_time && (
                    <span className="flex items-center justify-end">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(workOrder.end_time).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Location and driver info */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Location & Driver</CardTitle>
            </CardHeader>
            <CardContent>
              {workOrder.location && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </h3>
                  <div className="text-sm border rounded-md p-3 bg-muted/50">
                    <p className="font-medium">{workOrder.location.name || 'N/A'}</p>
                    <p className="text-muted-foreground">{workOrder.location.address || 'No address provided'}</p>
                    {workOrder.location.city && workOrder.location.state && (
                      <p className="text-muted-foreground">
                        {workOrder.location.city}, {workOrder.location.state} {workOrder.location.zip || ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {workOrder.driver && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Driver / Technician
                  </h3>
                  <div className="text-sm border rounded-md p-3 bg-muted/50">
                    <p>{workOrder.driver.name || 'N/A'}</p>
                    {workOrder.driver.id && <p className="text-xs text-muted-foreground">ID: {workOrder.driver.id}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes section */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Notes & Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Service Notes */}
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Service Notes
                  </h3>
                  <div className="text-sm border rounded-md p-3 bg-muted/50">
                    {workOrder.service_notes || 'No service notes provided.'}
                  </div>
                </div>
                
                {/* Technician Notes */}
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Technician Notes
                  </h3>
                  <div className="text-sm border rounded-md p-3 bg-muted/50">
                    {workOrder.tech_notes || 'No technician notes provided.'}
                  </div>
                </div>
                
                {/* QC Notes if present */}
                {workOrder.qc_notes && (
                  <div>
                    <h3 className="text-sm font-medium mb-1 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Quality Control Notes
                    </h3>
                    <div className="text-sm border rounded-md p-3 bg-muted/50">
                      {workOrder.qc_notes}
                    </div>
                  </div>
                )}
                
                {/* Resolution Notes if present */}
                {workOrder.resolution_notes && (
                  <div>
                    <h3 className="text-sm font-medium mb-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Resolution Notes
                    </h3>
                    <div className="text-sm border rounded-md p-3 bg-muted/50">
                      {workOrder.resolution_notes}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Images section */}
          {images.length > 0 && (
            <Card className="md:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Images ({images.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  {/* Main image viewer */}
                  <div className="bg-black rounded-md flex justify-center items-center p-2 min-h-[400px]">
                    <img 
                      src={images[activeImageIndex]?.url} 
                      alt={`Work order image ${activeImageIndex + 1}`} 
                      className="max-h-[400px] object-contain"
                    />
                  </div>
                  
                  {/* Thumbnails */}
                  <ScrollArea className="h-24">
                    <div className="flex space-x-2">
                      {images.map((image, index) => (
                        <div 
                          key={index}
                          className={`cursor-pointer rounded border-2 h-20 w-20 ${
                            index === activeImageIndex ? 'border-primary' : 'border-transparent'
                          }`}
                          onClick={() => handleImageNav(index)}
                        >
                          <img 
                            src={image.url} 
                            alt={`Thumbnail ${index + 1}`} 
                            className="h-full w-full object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* JSON Data section - collapsed by default */}
          <Card className="md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Raw Data</CardTitle>
              <CardDescription>Technical details for debugging</CardDescription>
            </CardHeader>
            <CardContent>
              <details className="text-xs">
                <summary className="cursor-pointer text-sm font-medium mb-2">Show Raw JSON Data</summary>
                <div className="mt-2 p-4 bg-muted rounded-md overflow-auto max-h-[400px]">
                  <pre>{JSON.stringify(workOrder, null, 2)}</pre>
                </div>
              </details>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetailsPage;
