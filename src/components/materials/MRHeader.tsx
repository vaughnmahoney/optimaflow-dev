
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export const MRHeader = () => {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-2xl font-bold">
          <Package className="mr-2 h-6 w-6 text-primary" />
          Materials Requirements Generator
        </CardTitle>
        <CardDescription className="text-base">
          Generate material requirements for drivers from OptimoRoute
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Select a date to fetch routes, then choose a driver to view their material requirements.
          You can export requirements to CSV or print them for easy reference.
        </p>
      </CardContent>
    </Card>
  );
};
