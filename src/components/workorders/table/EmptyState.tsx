
import { Card, CardContent } from "@/components/ui/card";

export const EmptyState = () => {
  return (
    <Card className="w-full">
      <CardContent className="flex justify-center items-center p-8 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">No work orders found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search criteria or filters to find what you're looking for.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
