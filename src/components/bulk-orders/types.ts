
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
}

export interface CompletionStatus {
  status: 'success' | 'failed' | string;
  timestamp?: string;
}
