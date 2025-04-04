import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SortDirection, SortField } from "../components/workorders/types";

export const useWorkOrderListState = () => {
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isNavigatingPages, setIsNavigatingPages] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    direction: 'next' | 'previous';
    page: number;
  } | null>(null);
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

  // Effect to handle work order selection after data has loaded from a page change
  useEffect(() => {
    if (isNavigatingPages && pendingNavigation && transformedData) {
      // Use a slightly longer timeout to ensure data is fully loaded
      const timer = setTimeout(() => {
        const { direction } = pendingNavigation;
        
        // Get the latest work orders data from the component props
        const workOrdersData = queryClient.getQueryData<any>(["workOrders"]);
        const workOrders = workOrdersData?.data || [];
        
        console.log(`Data loaded after page navigation, opening modal for direction: ${direction}`);
        console.log(`Available work orders: ${workOrders.length}`);
        
        if (workOrders.length > 0) {
          const indexToSelect = direction === 'next' ? 0 : workOrders.length - 1;
          const selectedId = workOrders[indexToSelect]?.id;
          
          if (selectedId) {
            console.log(`Selecting work order at index ${indexToSelect}: ${selectedId}`);
            setSelectedWorkOrder(selectedId);
            setIsImageModalOpen(true);
          }
        }
        
        // Reset navigation state
        setIsNavigatingPages(false);
        setPendingNavigation(null);
      }, 500); // Longer timeout to ensure data is fully loaded
      
      return () => clearTimeout(timer);
    }
  }, [isNavigatingPages, pendingNavigation, transformedData, queryClient]);

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
      setPendingNavigation({ direction, page: newPage });
      
      // Keep the modal open during transition
      // setIsImageModalOpen(true);
      
      // Change the page - this will trigger a data refetch
      onPageChange(newPage);
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
