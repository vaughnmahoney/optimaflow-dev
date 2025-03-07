
import { TextFilter, TextFilterProps } from "./TextFilter";

export const LocationFilter = (props: TextFilterProps) => {
  // Similar to TextFilter, but in a real implementation you might
  // fetch a list of locations from the API
  return (
    <TextFilter
      {...props}
      placeholder="Filter by location"
    />
  );
};
