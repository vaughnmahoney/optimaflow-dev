
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMRStore } from '@/store/useMRStore';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const MRDateImport = () => {
  const { importDate, setImportDate, isLoading } = useMRStore();

  const handleImport = () => {
    // To be implemented in Edit 2
    alert('Import functionality will be implemented in the next edit');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Route</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !importDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {importDate ? format(importDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={importDate || undefined}
                  onSelect={(date) => setImportDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button 
            disabled={!importDate || isLoading} 
            onClick={handleImport}
          >
            {isLoading ? 'Importing...' : 'Import Route'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
