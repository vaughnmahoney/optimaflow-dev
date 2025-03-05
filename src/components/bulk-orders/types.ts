
export interface BulkOrdersResponse {
  success?: boolean;
  error?: string;
  orders?: any[];
  totalCount?: number;
  filteredCount?: number; // Count of filtered orders (completed with success)
  searchResponse?: any;
  completionResponse?: any;
  paginationProgress?: PaginationProgress; // For tracking pagination progress
  after_tag?: string; // Direct after_tag from API response (snake_case as per API docs)
  rawDataSamples?: { // Add this property to fix the build error
    searchSample?: any;
    completionSample?: any;
  };
  deduplicationStats?: {
    originalCount: number;
    uniqueCount: number;
    removedCount: number;
  };
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
  afterTag?: string; // We still use camelCase internally for consistency
}
