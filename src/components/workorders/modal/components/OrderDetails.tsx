import { WorkOrder } from "../../types";
import { Link } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderDetailsProps {
  workOrder: WorkOrder;
}

export const OrderDetails = ({ workOrder }: OrderDetailsProps) => {
  const completionData = workOrder?.completion_response?.orders?.[0]?.data;
  const trackingUrl = completionData?.tracking_url || "";
  
  // Format date nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-6">
        {/* Display work order details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Order Information
          </h3>
          <div className="mt-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Order Date:
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {formatDate(completionData?.form?.order_date)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Customer Name:
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {completionData?.form?.customer_name}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Customer Email:
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {completionData?.form?.customer_email}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Customer Phone:
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {completionData?.form?.customer_phone}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Service Address:
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {completionData?.form?.service_address}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                City:
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {completionData?.form?.city}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                State:
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {completionData?.form?.state}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Postal Code:
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {completionData?.form?.postal_code}
              </span>
            </div>
          </div>
        </div>
        
        {/* Tracking URL Button */}
        {trackingUrl && (
          <div className="pt-4 pb-2">
            <Button 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-md shadow-sm flex items-center justify-center"
              onClick={() => window.open(trackingUrl, "_blank")}
            >
              <Link className="mr-2 h-4 w-4" />
              View Tracking URL
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
