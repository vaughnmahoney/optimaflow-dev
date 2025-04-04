
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar } from "lucide-react";
import { PaginationState } from '../types';
import { format } from 'date-fns';

interface TopPaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onRefresh?: () => Promise<any>;
  isRefreshing?: boolean;
  isShowingToday?: boolean;
}

export const TopPagination = ({ 
  pagination, 
  onPageChange, 
  onRefresh,
  isRefreshing = false,
  isShowingToday = false
}: TopPaginationProps) => {
  return (
    <div className="flex justify-between items-center pb-2">
      <div className="flex items-center">
        {isShowingToday && (
          <div className="flex items-center space-x-1.5 text-sm text-primary mr-3 bg-primary/5 px-3 py-1.5 rounded-md">
            <Calendar size={16} className="text-primary" />
            <span className="font-medium">Today: {format(new Date(), 'MMMM d, yyyy')}</span>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          {pagination.total > 0 ? (
            <>
              Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)}-
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} orders
            </>
          ) : (
            "No orders found"
          )}
        </div>
      </div>
      
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="space-x-1"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </Button>
      )}
    </div>
  );
};
