
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportTypesStep } from './ReportTypesStep';
import { DateRangeStep } from './DateRangeStep';
import { FiltersStep } from './FiltersStep';
import { ReviewStep } from './ReviewStep';
import { ReportResults } from '../report-builder/ReportResults';
import { KpiSection } from '../kpis/KpiSection';
import { StatusBreakdownChart } from '../StatusBreakdownChart';
import { ArrowLeft, ArrowRight, FileBarChart, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

interface ReportWizardProps {
  onClose?: () => void;
}

const STEPS = [
  { id: 'report-types', label: 'Select Report Types' },
  { id: 'date-range', label: 'Select Date Range' },
  { id: 'filters', label: 'Refine Filters' },
  { id: 'review', label: 'Review' }
];

export const ReportWizard: React.FC<ReportWizardProps> = ({ onClose }) => {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedCustomerGroups, setSelectedCustomerGroups] = useState<string[]>([]);
  const [selectedCustomerNames, setSelectedCustomerNames] = useState<string[]>([]);
  
  // Results state
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  const handleNext = () => {
    // Validate current step
    if (currentStep === 0 && selectedReportTypes.length === 0) {
      toast.error("Please select at least one report type");
      return;
    }
    
    if (currentStep === 1 && !dateRange?.from) {
      toast.error("Please select a date range");
      return;
    }
    
    // Proceed to next step
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleGenerateReport();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      toast.success("Report generated successfully");
    }, 1500);
  };
  
  // Return to form view
  const handleEditReport = () => {
    setReportGenerated(false);
    setCurrentStep(0);
  };
  
  if (reportGenerated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Report Results</h2>
            <p className="text-muted-foreground">
              Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <Button onClick={handleEditReport} variant="outline">
            Edit Report Criteria
          </Button>
        </div>
        
        <ReportResults>
          <KpiSection
            reportDate={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null}
            selectedDrivers={selectedDrivers}
            selectedCustomerGroups={selectedCustomerGroups}
            selectedCustomerNames={selectedCustomerNames}
          />
          
          <StatusBreakdownChart 
            chartSelectedDate={dateRange?.from}
            selectedDrivers={selectedDrivers}
            selectedCustomerGroups={selectedCustomerGroups}
            selectedCustomerNames={selectedCustomerNames} 
          />
        </ReportResults>
      </div>
    );
  }
  
  return (
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileBarChart className="h-5 w-5" />
          Generate Report
        </CardTitle>
        <CardDescription>
          Create a custom report by following these steps
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Step indicator */}
        <div className="relative mb-8">
          <div className="absolute top-2.5 w-full h-0.5 bg-muted"></div>
          <ol className="relative flex justify-between">
            {STEPS.map((step, index) => (
              <li key={step.id} className="flex flex-col items-center">
                <div 
                  className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full 
                   ${index < currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : index === currentStep
                      ? 'bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary'
                      : 'bg-muted text-muted-foreground'}`}
                >
                  {index < currentStep ? (
                    <span className="text-xs">✓</span>
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span className={`mt-2 text-xs ${index === currentStep ? 'font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
        
        {/* Step content */}
        <div className="mt-6">
          {currentStep === 0 && (
            <ReportTypesStep 
              selectedReportTypes={selectedReportTypes}
              setSelectedReportTypes={setSelectedReportTypes}
            />
          )}
          
          {currentStep === 1 && (
            <DateRangeStep 
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          )}
          
          {currentStep === 2 && (
            <FiltersStep 
              selectedDrivers={selectedDrivers}
              setSelectedDrivers={setSelectedDrivers}
              selectedCustomerGroups={selectedCustomerGroups}
              setSelectedCustomerGroups={setSelectedCustomerGroups}
              selectedCustomerNames={selectedCustomerNames}
              setSelectedCustomerNames={setSelectedCustomerNames}
            />
          )}
          
          {currentStep === 3 && (
            <ReviewStep 
              selectedReportTypes={selectedReportTypes}
              dateRange={dateRange}
              selectedDrivers={selectedDrivers}
              selectedCustomerGroups={selectedCustomerGroups}
              selectedCustomerNames={selectedCustomerNames}
            />
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button onClick={handleNext} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : currentStep === STEPS.length - 1 ? (
            'Generate Report'
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
