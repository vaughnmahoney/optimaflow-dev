
export const ImageEmptyState = () => {
  return (
    <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-800">
      <div className="text-center space-y-4 text-muted-foreground">
        <div className="mx-auto h-16 w-16 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-medium">No images available</p>
        <p className="text-sm">This work order doesn't have any images attached.</p>
      </div>
    </div>
  );
};
