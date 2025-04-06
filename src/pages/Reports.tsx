
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFetchReports } from "@/hooks/useFetchReports";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const Reports = () => {
  const { fetchReports, isLoading, results } = useFetchReports();
  
  return (
    <Layout title="Reports">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Fetch Reports from OptimoRoute</CardTitle>
            <CardDescription>
              Manually trigger the fetch-reports edge function to retrieve data from OptimoRoute
              and store it in the reports table.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={fetchReports} 
                disabled={isLoading}
                className="w-fit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Reports...
                  </>
                ) : (
                  "Fetch Reports Now"
                )}
              </Button>
              
              {results && (
                <div className="mt-4">
                  {typeof results === 'string' ? (
                    <Alert variant={results.includes('Successfully') ? "default" : "destructive"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Function Response</AlertTitle>
                      <AlertDescription>{results}</AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant={results.success ? "default" : "destructive"}>
                      {results.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      <AlertTitle>{results.success ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>
                        {results.success 
                          ? `Successfully updated ${results.count || 'multiple'} reports` 
                          : `Error: ${results.error || 'Unknown error'}`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <p>
              This function calls the OptimoRoute API to fetch route data for today and updates the reports table.
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
