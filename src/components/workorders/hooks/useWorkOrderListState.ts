
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SortDirection, SortField } from "../types";

export const useWorkOrderListState = () => {
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isNavigatingPages, setIsNavigatingPages] = useState(false);
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
      
      // Set navigation in progress
      setIsNavigatingPages(true);
      
      // Change the page - this will trigger a data refetch
      onPageChange(newPage);
      
      // Reset the navigation state after a short delay
      setTimeout(() => {
        setIsNavigatingPages(false);
      }, 800);
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
    isNavigatingPages,
    handleImageView,
    handleCloseImageModal,
    handleSortChange,
    handlePageBoundary
  };
};
