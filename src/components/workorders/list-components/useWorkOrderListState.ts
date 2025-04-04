
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SortDirection, SortField } from "../types";

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
      
      // Just change the page, don't select any work order
      onPageChange(newPage);
      
      // We intentionally don't select a work order here, as per the user's request
      // The modal will stay open and wait for the new page data
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
