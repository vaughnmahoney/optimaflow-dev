
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
  };
  after_tag?: string;
  searchResponse?: any;
  completionResponse?: any;
}

export interface CompletionStatus {
  status: 'success' | 'failed' | 'rejected' | string;
  timestamp?: string;
}
