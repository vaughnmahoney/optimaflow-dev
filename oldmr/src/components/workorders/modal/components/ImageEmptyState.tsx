
import React from "react";

export const ImageEmptyState = () => {
  return (
    <div className="text-center text-muted-foreground p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="h-16 w-16 mx-auto mb-4 text-gray-400 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
        <span className="text-2xl">×</span>
      </div>
      <p className="text-lg font-medium">No images available</p>
      <p className="text-sm">This work order doesn't have any uploaded images.</p>
    </div>
  );
};
