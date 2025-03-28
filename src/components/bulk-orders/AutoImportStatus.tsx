
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface AutoImportStatusProps {
  className?: string;
}

interface ImportLog {
  execution_time: string;
  result: {
    success: boolean;
    dateRange?: {
      start: string;
      end: string;
    };
    fetched?: number;
    imported?: number;
    duplicates?: number;
    errors?: number;
    error?: string;
    errorDetails?: string[];
  };
}

interface StatusResponse {
  success: boolean;
  lastRun: ImportLog | null;
  nextScheduledRun: string;
  scheduledInterval: string;
  error?: string;
}

export function AutoImportStatus({ className }: AutoImportStatusProps) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      // Fix: Use the correct way to invoke an edge function with a path
      const { data, error } = await supabase.functions.invoke(
        'auto-import-orders/status'
      );

      if (error) {
        throw error;
      }

      setStatus(data);
    } catch (error) {
      console.error('Error fetching auto-import status:', error);
      toast.error('Failed to fetch auto-import status');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualImport = async () => {
    setTriggerLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-import-orders');
      
      if (error) {
        throw error;
      }
      
      toast.success('Manual import triggered successfully');
      // Refetch status after a short delay to allow processing
      setTimeout(fetchStatus, 1000);
    } catch (error) {
      console.error('Error triggering manual import:', error);
      toast.error('Failed to trigger manual import');
    } finally {
      setTriggerLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Refresh status every minute
    const intervalId = setInterval(fetchStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading && !status) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Auto Import Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status?.success) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Auto Import Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {status?.error || 'Failed to load auto-import status'}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const lastRun = status?.lastRun;
  const nextRun = status?.nextScheduledRun ? new Date(status.nextScheduledRun) : null;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Auto Import Status
          </div>
          <Badge variant="outline" className="ml-2">
            {status.scheduledInterval}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastRun ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Last Run:</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(lastRun.execution_time), { addSuffix: true })}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Status:</span>
              <div className="flex items-center">
                {lastRun.result.success ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">Success</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-600 font-medium">Failed</span>
                  </>
                )}
              </div>
            </div>

            {lastRun.result.success && lastRun.result.dateRange && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Date Range:</span>
                  <span>{lastRun.result.dateRange.start} to {lastRun.result.dateRange.end}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Results:</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Fetched: {lastRun.result.fetched || 0}
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Imported: {lastRun.result.imported || 0}
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Duplicates: {lastRun.result.duplicates || 0}
                    </Badge>
                  </div>
                </div>
              </>
            )}

            {!lastRun.result.success && lastRun.result.error && (
              <div className="text-sm text-red-600 mt-1">
                Error: {lastRun.result.error || 'Unknown error'}
              </div>
            )}
            
            {!lastRun.result.success && lastRun.result.errorDetails && lastRun.result.errorDetails.length > 0 && (
              <div className="text-sm text-red-600 mt-1 space-y-1">
                <div>Error Details:</div>
                <ul className="list-disc pl-5">
                  {lastRun.result.errorDetails.slice(0, 3).map((detail, idx) => (
                    <li key={idx} className="text-xs">{detail}</li>
                  ))}
                  {lastRun.result.errorDetails.length > 3 && (
                    <li className="text-xs italic">...and {lastRun.result.errorDetails.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No import has been executed yet
          </div>
        )}

        {nextRun && (
          <div className="flex justify-between items-center text-sm pt-2 border-t">
            <span className="text-muted-foreground">Next Run:</span>
            <div className="flex flex-col items-end">
              <span className="font-medium">
                {formatDistanceToNow(nextRun, { addSuffix: true })}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(nextRun, 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatus}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={triggerManualImport}
            disabled={triggerLoading}
          >
            {triggerLoading ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Clock className="h-4 w-4 mr-1" />
            )}
            Run Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
