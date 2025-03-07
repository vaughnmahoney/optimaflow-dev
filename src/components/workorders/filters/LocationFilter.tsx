
import { ColumnFilterProps } from "./types";
import { TextFilter } from "./TextFilter";

export const LocationFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  // Similar to TextFilter, but in a real implementation you might
  // fetch a list of locations from the API
  return (
    <TextFilter
      column={column}
      value={value}
      onChange={onChange}
      onClear={onClear}
    />
  );
};
