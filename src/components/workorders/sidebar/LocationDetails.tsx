
import { LocationDetailsProps } from "../types/sidebar";

export const LocationDetails = ({ location, address }: LocationDetailsProps) => (
  <div>
    <h4 className="text-sm font-medium text-muted-foreground mb-2">Location Details</h4>
    <div className="space-y-1">
      <div>
        <span className="text-sm">Name: </span>
        <span className="text-sm">
          {typeof location === 'object' 
            ? location?.name || location?.locationName 
            : location || 'Not available'}
        </span>
      </div>
      <div>
        <span className="text-sm">Address: </span>
        <span className="text-sm">
          {typeof location === 'object' 
            ? location?.address 
            : address || 'Not available'}
        </span>
      </div>
    </div>
  </div>
);
