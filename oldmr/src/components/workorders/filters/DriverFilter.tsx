
import { ColumnFilterProps } from "./types";
import { TextFilter } from "./TextFilter";

export const DriverFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  // This uses TextFilter but in a real implementation you might
  // fetch a list of drivers from the API and display them as options
  return (
    <TextFilter
      column={column}
      value={value}
      onChange={onChange}
      onClear={onClear}
    />
  );
};
