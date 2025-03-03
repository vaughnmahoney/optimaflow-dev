
export interface BulkOrdersResponse {
  success?: boolean;
  error?: string;
  orders?: any[];
  totalCount?: number;
  filteredCount?: number; // Count of filtered orders (completed with success)
  searchResponse?: any;
  completionResponse?: any;
  paginationProgress?: PaginationProgress; // New field for tracking pagination progress
  afterTag?: string; // Direct afterTag at the top level for consistency
}

export interface CompletionStatus {
  status: 'success' | 'failed' | string;
  timestamp?: string;
}

// Interface for tracking pagination progress
export interface PaginationProgress {
  currentPage: number;
  totalPages?: number;
  totalOrdersRetrieved: number;
  isComplete: boolean;
  afterTag?: string; // afterTag stored in pagination progress
}
