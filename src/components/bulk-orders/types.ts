
export interface BulkOrdersResponse {
  success?: boolean;
  error?: string;
  orders?: any[];
  totalCount?: number;
  filteredCount?: number; // Count of filtered orders (completed with success)
  searchResponse?: any;
  completionResponse?: any;
  paginationProgress?: PaginationProgress; // New field for tracking pagination progress
}

export interface CompletionStatus {
  status: 'success' | 'failed' | string;
  timestamp?: string;
}

// New interface for tracking pagination progress
export interface PaginationProgress {
  currentPage: number;
  totalPages?: number;
  totalOrdersRetrieved: number;
  isComplete: boolean;
}
