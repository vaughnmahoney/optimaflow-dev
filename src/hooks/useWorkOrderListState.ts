import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SortDirection, SortField } from "../components/workorders/types";

export const useWorkOrderListState = () => {
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleImageView = (workOrderId: string) => {
    setSelectedWorkOrder(workOrderId);
    setIsImageModalOpen(true);
    return workOrderId;
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
  };

  const handleSortChange = (onSort: ((field: SortField, direction: SortDirection) => void) | undefined) => 
    (field: SortField, direction: SortDirection) => {
      if (onSort) {
        // Refresh data when sort changes
        queryClient.invalidateQueries({ queryKey: ["workOrders"] });
        onSort(field, direction);
      }
    };

  const handlePageBoundary = (
    pagination: any,
    onPageChange: ((page: number) => void) | undefined,
    workOrders: any[]
  ) => (direction: 'next' | 'previous') => {
    if (!pagination || !onPageChange) {
      console.log("Cannot handle page boundary: pagination or onPageChange is undefined");
      return;
    }
    
    console.log(`Handling page boundary: ${direction}, current page: ${pagination.page}`);
    
    const newPage = direction === 'next' 
      ? pagination.page + 1 
      : Math.max(1, pagination.page - 1);
    
    const hasMorePages = direction === 'next' 
      ? pagination.page < Math.ceil(pagination.total / pagination.pageSize)
      : pagination.page > 1;
    
    if (hasMorePages) {
      console.log(`Navigating to page ${newPage}`);
      
      // Ensure modal stays open during page transition
      // by not closing it here, and explicitly keeping isImageModalOpen=true
      
      // Change the page
      onPageChange(newPage);
      
      // After page is changed, select the first or last item on the new page
      setTimeout(() => {
        if (workOrders.length > 0) {
          const indexToSelect = direction === 'next' ? 0 : workOrders.length - 1;
          console.log(`Selecting work order at index ${indexToSelect}`);
          setSelectedWorkOrder(workOrders[indexToSelect]?.id || null);
          
          // Ensure modal is open (in case it somehow closed during transition)
          setIsImageModalOpen(true);
        } else {
          console.log("No work orders to select on new page");
          // If there are no work orders on the new page, only then close the modal
          setIsImageModalOpen(false);
        }
      }, 300); // Slightly longer timeout to ensure data is loaded
    } else {
      console.log(`Cannot navigate ${direction}: at the ${direction === 'next' ? 'last' : 'first'} page`);
    }
  };

  return {
    searchResponse,
    setSearchResponse,
    transformedData,
    setTransformedData,
    selectedWorkOrder,
    setSelectedWorkOrder,
    isImageModalOpen,
    setIsImageModalOpen,
    handleImageView,
    handleCloseImageModal,
    handleSortChange,
    handlePageBoundary
  };
};
