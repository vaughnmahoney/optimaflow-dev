
export interface BulkOrdersResponse {
  success?: boolean;
  error?: string;
  orders?: any[];
  totalCount?: number;
  filteredCount?: number; // Count of filtered orders (completed with success)
  isComplete?: boolean;
  rawDataSamples?: {
    searchSample?: any;
    completionSample?: any;
  };
  filteringMetadata?: {
    unfilteredOrderCount: number;
    filteredOrderCount: number;
    completionDetailCount?: number;
  };
  // Add these optional properties to match what ApiResponseDisplay.tsx expects
  paginationProgress?: {
    isComplete?: boolean;
    totalOrdersRetrieved?: number;
    afterTag?: string; // Added missing afterTag property
  };
  after_tag?: string;
  searchResponse?: any;
  completionResponse?: any;
  // Add batchStats property to fix TypeScript error
  batchStats?: BatchProcessingStats;
}

export interface CompletionStatus {
  status: 'success' | 'failed' | 'rejected' | string;
  timestamp?: string;
}

// New interface for batched completion processing
export interface BatchProcessingStats {
  totalBatches: number;
  completedBatches: number;
  successfulBatches: number;
  failedBatches: number;
  totalOrdersProcessed: number;
  errors?: string[];
}
