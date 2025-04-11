
import React, { useState } from "react";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { SearchBar } from "./search/SearchBar";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./table/EmptyState";
import { Button } from "@/components/ui/button";
import { History, Search } from "lucide-react";

export const OrderHistoryContent = () => {
  const { searchResults, isLoading, noResults, searchByLocation } = useLocationSearch();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    searchByLocation(value);
  };

  const EmptySearchState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <History className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">Search Order History</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        Enter a location name to search through previous work orders
      </p>
    </div>
  );

  const NoResultsState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Search className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No orders found</h3>
      <p className="text-muted-foreground mt-2">
        No work orders match "{searchQuery}"
      </p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={() => handleSearch("")}
      >
        Clear search
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <SearchBar 
              initialValue={searchQuery} 
              onSearch={handleSearch}
              placeholder="Search by location name..." 
            />
          </div>
          
          {isLoading ? (
            <LoadingSkeleton />
          ) : searchResults.length > 0 ? (
            <WorkOrderTable 
              workOrders={searchResults}
              onStatusUpdate={() => {}}
              onImageView={() => {}}
              onDelete={() => {}}
              filters={{
                status: null,
                dateRange: { from: null, to: null },
                driver: null,
                location: null,
                orderNo: null,
                optimoRouteStatus: null
              }}
              onColumnFilterChange={() => {}}
              onColumnFilterClear={() => {}}
              onClearAllFilters={() => {}}
            />
          ) : noResults ? (
            <NoResultsState />
          ) : (
            <EmptySearchState />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
