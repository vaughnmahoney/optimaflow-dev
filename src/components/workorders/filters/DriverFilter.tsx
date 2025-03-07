
import { TextFilter, TextFilterProps } from "./TextFilter";

export const DriverFilter = (props: TextFilterProps) => {
  // Similar to TextFilter, but in a real implementation you might
  // fetch a list of drivers from the API and display them as options
  return (
    <TextFilter
      {...props}
      placeholder="Filter by driver name"
    />
  );
};
