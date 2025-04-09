
import React from 'react';
import { REPORT_TYPES, ReportType } from './ReportTypesStep';
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Check, AlertCircle } from "lucide-react";

interface ReviewStepProps {
  selectedReportTypes: string[];
  dateRange: { from: Date | undefined; to: Date | undefined };
  selectedDrivers: string[];
  selectedCustomerGroups: string[];
  selectedCustomerNames: string[];
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  selectedReportTypes,
  dateRange,
  selectedDrivers,
  selectedCustomerGroups,
  selectedCustomerNames
}) => {
  // Find selected report type objects
  const selectedReports = REPORT_TYPES.filter(report => 
    selectedReportTypes.includes(report.id)
  );
  
  // Check if we have all required data
  const hasReportTypes = selectedReportTypes.length > 0;
  const hasDateRange = dateRange.from !== undefined;
  const hasFilters = selectedDrivers.length > 0 || 
                    selectedCustomerGroups.length > 0 || 
                    selectedCustomerNames.length > 0;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Review Report Settings</h3>
      <p className="text-sm text-muted-foreground">
        Review and confirm your report configuration before generating
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium flex items-center mb-2">
              Report Types
              {hasReportTypes ? (
                <Check className="h-4 w-4 text-green-500 ml-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 ml-2" />
              )}
            </h4>
            
            {hasReportTypes ? (
              <ul className="space-y-2">
                {selectedReports.map(report => (
                  <li key={report.id} className="flex items-center space-x-2">
                    <span className="p-1.5 rounded bg-muted flex items-center justify-center">
                      {report.icon}
                    </span>
                    <span>{report.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No report types selected</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium flex items-center mb-2">
              Date Range
              {hasDateRange ? (
                <Check className="h-4 w-4 text-green-500 ml-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 ml-2" />
              )}
            </h4>
            
            {hasDateRange ? (
              <div>
                <p className="font-medium">
                  {dateRange.from && format(dateRange.from, "MMMM d, yyyy")}
                </p>
                {dateRange.to && dateRange.from && dateRange.to.getTime() !== dateRange.from.getTime() && (
                  <>
                    <p className="text-xs text-muted-foreground my-1">to</p>
                    <p className="font-medium">
                      {format(dateRange.to, "MMMM d, yyyy")}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No date range selected</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium flex items-center mb-2">
              Filters
              {hasFilters ? (
                <Check className="h-4 w-4 text-green-500 ml-2" />
              ) : (
                <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
              )}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-1">Technicians</h5>
                {selectedDrivers.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {selectedDrivers.map(driver => (
                      <li key={driver}>{driver}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">All technicians</p>
                )}
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-1">Customer Groups</h5>
                {selectedCustomerGroups.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {selectedCustomerGroups.map(group => (
                      <li key={group}>{group}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">All groups</p>
                )}
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-1">Customers</h5>
                {selectedCustomerNames.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {selectedCustomerNames.map(customer => (
                      <li key={customer}>{customer}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">All customers</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
