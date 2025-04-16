
import React from 'react';
import { Package, User, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MaterialSummary } from '@/types/material-requirements';

interface MRSummaryProps {
  summary: MaterialSummary;
}

export const MRSummary = ({ summary }: MRSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Drivers</p>
              <p className="text-2xl font-bold">{summary.totalDrivers}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Work Orders</p>
              <p className="text-2xl font-bold">{summary.totalWorkOrders}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Filters</p>
              <p className="text-2xl font-bold">{summary.totalFilters}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Coils</p>
              <p className="text-2xl font-bold">{summary.totalCoils}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
