
export interface BulkOrdersResponse {
  success?: boolean;
  error?: string;
  orders?: any[];
  totalCount?: number;
  filteredCount?: number; // Count of filtered orders (completed with success)
  searchResponse?: any;
  completionResponse?: any;
}

export interface CompletionStatus {
  status: 'success' | 'failed' | string;
  timestamp?: string;
}

