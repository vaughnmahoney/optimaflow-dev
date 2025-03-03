
export interface BulkOrdersResponse {
  success?: boolean;
  error?: string;
  orders?: any[];
  totalCount?: number;
  searchResponse?: any;
  completionResponse?: any;
}
