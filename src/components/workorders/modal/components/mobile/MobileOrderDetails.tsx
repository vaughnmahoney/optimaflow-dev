
import { Card } from "@/components/ui/card";
import { WorkOrder } from "../../../types";
import { MapPin, Clock, Package, User, FileSignature } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface MobileOrderDetailsProps {
  workOrder: WorkOrder;
}

export const MobileOrderDetails = ({
  workOrder
}: MobileOrderDetailsProps) => {
  const completionData = workOrder.completion_response?.orders?.[0]?.data;
  const searchData = workOrder.search_response?.data;
  const signatureUrl = completionData?.form?.signature?.url;
  
  // Driver info
  const driverName = workOrder.search_response?.scheduleInformation?.driverName || workOrder.driver?.name || 'No Driver Assigned';
  
  // Format date function
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Get formatted start and end times
  const startTime = completionData?.startTime?.localTime 
    ? formatDate(completionData.startTime.localTime) 
    : "Not recorded";
  
  const endTime = completionData?.endTime?.localTime 
    ? formatDate(completionData.endTime.localTime) 
    : "Not recorded";

  // Location information
  const location = workOrder.location || {};
  const locationName = location.name || location.locationName || "N/A";
  const address = location.address || "N/A";
  const city = location.city || "";
  const state = location.state || "";
  const zip = location.zip || "";
  
  // Format full address
  const fullAddress = [
    address,
    [city, state, zip].filter(Boolean).join(", ")
  ].filter(part => part && part !== "N/A").join(", ");

  // Extract material quantity
  const materialQuantity = searchData?.customField3 || "N/A";
  
  // Format LDS information
  const ldsRaw = searchData?.customField5 || workOrder.lds || "N/A";
  const ldsInfo = ldsRaw !== "N/A" && ldsRaw.includes(" ") 
    ? ldsRaw.split(" ")[0] // Take only the date part from "2024-10-17 00:00"
    : ldsRaw;

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid grid-cols-3 mb-2 w-full">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="signature">Signature</TabsTrigger>
      </TabsList>
      
      {/* Details Tab */}
      <TabsContent value="details" className="mt-0">
        <Card className="border-gray-100">
          <div className="space-y-4">
            {/* Driver Section */}
            <div className="space-y-1.5 px-4 pt-4">
              <div className="flex items-center gap-1.5 text-gray-700 mb-1">
                <User className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-medium">Driver</h3>
              </div>
              <p className="text-sm pl-5.5">{driverName}</p>
            </div>
            
            {/* Location Section */}
            <div className="space-y-1.5 px-4">
              <div className="flex items-center gap-1.5 text-gray-700 mb-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-medium">Location</h3>
              </div>
              <div className="pl-5.5 space-y-1">
                <p className="text-sm font-medium">{locationName}</p>
                <p className="text-xs text-gray-600">{fullAddress}</p>
              </div>
            </div>
            
            {/* Time Details Section */}
            <div className="space-y-1.5 px-4 pb-4">
              <div className="flex items-center gap-1.5 text-gray-700 mb-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-medium">Time Details</h3>
              </div>
              <div className="pl-5.5 space-y-0.5">
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="text-xs text-gray-500">Start Time:</span>
                  <span className="text-xs">{startTime}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="text-xs text-gray-500">End Time:</span>
                  <span className="text-xs">{endTime}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="text-xs text-gray-500">LDS:</span>
                  <span className="text-xs">{ldsInfo}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>
      
      {/* Notes Tab */}
      <TabsContent value="notes" className="mt-0">
        <Card className="border-gray-100">
          <div className="space-y-4 px-4 py-4">
            {/* Materials Section */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-gray-700 mb-1">
                <Package className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-medium">Materials</h3>
              </div>
              <div className="pl-5.5 space-y-0.5">
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="text-xs text-gray-500">Quantity:</span>
                  <span className="text-xs">{materialQuantity}</span>
                </div>
              </div>
            </div>
            
            {/* Render different note types */}
            {renderNotesSection(workOrder, completionData, searchData)}
          </div>
        </Card>
      </TabsContent>
      
      {/* Signature Tab */}
      <TabsContent value="signature" className="mt-0">
        {signatureUrl ? (
          <Card className="border-gray-100">
            <div className="px-4 py-4 space-y-2">
              <div className="flex items-center gap-1.5 text-gray-700">
                <FileSignature className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-medium">Customer Signature</h3>
              </div>
              
              <div className="flex justify-center">
                <div className="border border-gray-100 rounded-md bg-gray-50 p-2 w-full flex justify-center">
                  <img 
                    src={signatureUrl} 
                    alt="Signature" 
                    className="max-w-full max-h-[200px] object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTQgM3Y0YTEgMSAwIDAgMCAxIDFoNCI+PC9wYXRoPjxwYXRoIGQ9Ik0xNyAyMWgtMTBhMiAyIDAgMCAxLTItMnYtMTRhMiAyIDAgMCAxIDItMmg3bDUgNXYxMWEyIDIgMCAwIDEtMiAyeiI+PC9wYXRoPjxwYXRoIGQ9Ik05IDlsNiA2Ij48L3BhdGg+PHBhdGggZD0iTTE1IDlsLTYgNiI+PC9wYXRoPjwvc3ZnPg==';
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border-gray-100">
            <div className="p-4">
              <div className="text-center py-10">
                <FileSignature className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No signature available</p>
                <p className="text-xs text-gray-400 mt-1">This work order doesn't have a signature attached</p>
              </div>
            </div>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

// Helper function to render notes sections
function renderNotesSection(workOrder: WorkOrder, completionData: any, searchData: any) {
  const techNotes = completionData?.form?.note;
  const serviceNotes = workOrder.service_notes;
  const additionalNotes = searchData?.customField1;
  
  return (
    <>
      {/* Tech Notes */}
      <div className="space-y-1 border-t pt-3 first:border-t-0 first:pt-0">
        <div className="flex items-center gap-1.5 text-gray-700 mb-1">
          <h3 className="text-sm font-medium">Tech Notes</h3>
        </div>
        <div>
          {techNotes ? (
            <p className="text-xs whitespace-pre-wrap text-gray-700">{techNotes}</p>
          ) : (
            <p className="text-xs text-gray-500 italic">No tech notes available</p>
          )}
        </div>
      </div>
      
      {/* Service Notes */}
      <div className="space-y-1 border-t pt-3">
        <div className="flex items-center gap-1.5 text-gray-700 mb-1">
          <h3 className="text-sm font-medium">Service Notes</h3>
        </div>
        <div>
          {serviceNotes ? (
            <p className="text-xs whitespace-pre-wrap text-gray-700">{serviceNotes}</p>
          ) : (
            <p className="text-xs text-gray-500 italic">No service notes available</p>
          )}
        </div>
      </div>
      
      {/* Additional Notes */}
      <div className="space-y-1 border-t pt-3">
        <div className="flex items-center gap-1.5 text-gray-700 mb-1">
          <h3 className="text-sm font-medium">Additional Notes</h3>
        </div>
        <div>
          {additionalNotes ? (
            <p className="text-xs whitespace-pre-wrap text-gray-700">{additionalNotes}</p>
          ) : (
            <p className="text-xs text-gray-500 italic">No additional notes available</p>
          )}
        </div>
      </div>
    </>
  );
}
