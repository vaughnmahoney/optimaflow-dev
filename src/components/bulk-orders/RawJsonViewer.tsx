
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RawJsonViewerProps {
  data: any;
  label?: string;
}

export const RawJsonViewer = ({ data, label = "View Raw JSON" }: RawJsonViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Raw JSON Data</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full mt-4 border rounded-md">
          <pre className="p-4 text-xs whitespace-pre-wrap break-all">
            {JSON.stringify(data, null, 2)}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
