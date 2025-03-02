
import React from "react";
import { WorkOrder } from "@/components/workorders/types";
import { formatAddress } from "@/components/workorders/modal/utils/modalUtils";

interface ModalHeaderProps {
  workOrder: WorkOrder;
  isExpanded: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ workOrder, isExpanded }) => {
  const location = workOrder?.location;
  const address = formatAddress(location);
  const orderNo = workOrder?.order_no || "N/A";
  
  return (
    <div className="flex items-center justify-between w-full">
      <div className={`${isExpanded ? 'text-center w-full' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">
            Order #{orderNo}
          </span>
          {!isExpanded && location?.name && (
            <span className="text-gray-600">- {location.name}</span>
          )}
        </div>
        
        {!isExpanded && address && (
          <div className="text-sm text-gray-600">{address}</div>
        )}
      </div>
    </div>
  );
};
