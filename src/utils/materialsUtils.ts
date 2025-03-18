
/**
 * Format material type codes into human-readable strings
 */
export const formatMaterialType = (type: string): string => {
  // Handle Polyester MEND filters
  if (type.startsWith('S') && type.endsWith('MEND')) {
    // Extract the size part (between S and MEND)
    const sizeCode = type.substring(1, type.length - 4);
    return `Poly MEND: ${formatSizeCode(sizeCode)}`;
  } 
  // Handle regular Polyester filters
  else if (type.startsWith('S')) {
    // Extract the size part (after S)
    const sizeCode = type.substring(1);
    return `Poly: ${formatSizeCode(sizeCode)}`;
  } 
  // Handle Fiberglass filters 
  else if (type.startsWith('G') && type.endsWith('B')) {
    // Extract the size part (between G and B)
    const sizeCode = type.substring(1, type.length - 1);
    return `Fiberglass: ${formatSizeCode(sizeCode)}`;
  }
  // Handle Pleated filters
  else if (type.startsWith('P') && type.includes('INS')) {
    // Extract the size part (after P until INS)
    const sizeCode = type.substring(1, type.indexOf('INS'));
    return `Pleated: ${formatSizeCode(sizeCode)}`;
  }
  // Handle Frames
  else if (type.startsWith('F')) {
    // Extract the size part (after F)
    const sizeCode = type.substring(1);
    return `Frame: ${formatSizeCode(sizeCode)}`;
  }
  // Handle other material types
  else if (type === 'REFRIGERATOR_COILS') {
    return 'Refrigerator Coils';
  } else if (type.includes('FREEZER') || type.includes('FREEZECOOL') || type.includes('COOLER')) {
    return 'Refrigerator Coils';
  } else if (type === 'CONDCOIL') {
    return 'Condenser Coil';
  } else if (type === 'P-TRAP') {
    return 'P-Trap';
  } else if (type === 'PRODUCE') {
    return 'Produce Coil';
  } else {
    return type;
  }
};

/**
 * Format size codes into dimensions (e.g., "24242" becomes "24x24x2")
 */
export const formatSizeCode = (sizeCode: string): string => {
  let formattedSize = sizeCode;
  if (sizeCode.length === 5) { // e.g., 24242 for 24x24x2
    formattedSize = `${sizeCode.substring(0, 2)}x${sizeCode.substring(2, 4)}x${sizeCode.substring(4, 5)}`;
  } else if (sizeCode.length === 4) { // e.g., 2025 for 20x25
    formattedSize = `${sizeCode.substring(0, 2)}x${sizeCode.substring(2, 4)}`;
  }
  return formattedSize;
};

// Define valid badge variants as a string union type that satisfies the UI component requirements
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

/**
 * Get badge variant based on material type
 */
export const getBadgeVariant = (type: string): BadgeVariant => {
  // Only return variants that are compatible with the Badge component
  if (type === 'CONDCOIL') {
    return 'secondary';
  } else if (type === 'REFRIGERATOR_COILS' || type.includes('FREEZER') || type.includes('FREEZECOOL') || type.includes('COOLER')) {
    return 'secondary';
  } else if (type.startsWith('S') && type.endsWith('MEND')) {
    return 'default';  // For Poly MEND filters
  } else if (type.startsWith('S')) {
    return 'outline'; // For regular Poly filters
  } else if (type.startsWith('G') && type.endsWith('B')) {
    return 'secondary'; // For Fiberglass filters
  } else if (type.startsWith('P') && type.includes('INS')) {
    return 'default'; // For Pleated filters
  } else if (type.startsWith('F')) {
    return 'destructive'; // For Frames
  } else if (type === 'PRODUCE') {
    return 'default'; // For Produce Coils
  } else {
    return 'outline';
  }
};

/**
 * Determine if a material is a filter type
 */
export const isFilterType = (type: string): boolean => {
  // Only include filter types (Poly MEND, regular Polyester, Fiberglass, Pleated, and Frames)
  return (
    (type.startsWith('S') && type.endsWith('MEND')) || // Poly MEND
    (type.startsWith('S') && !type.endsWith('MEND')) || // Regular Polyester
    (type.startsWith('G') && type.endsWith('B')) || // Fiberglass
    (type.startsWith('P') && type.includes('INS')) || // Pleated
    type.startsWith('F') // Frames
  );
};

/**
 * Get the filter category for a material type
 */
export const getFilterCategory = (type: string): string => {
  if (type.startsWith('S') && type.endsWith('MEND')) {
    return 'Polyester MEND';
  } else if (type.startsWith('S')) {
    return 'Polyester';
  } else if (type.startsWith('G') && type.endsWith('B')) {
    return 'Fiberglass';
  } else if (type.startsWith('P') && type.includes('INS')) {
    return 'Pleated';
  } else if (type.startsWith('F')) {
    return 'Frame';
  } else {
    return 'Other';
  }
};

/**
 * Get the packaging info for a filter category
 */
export const getPackagingInfo = (category: string, count: number): string => {
  switch (category) {
    case 'Polyester MEND':
      // Each bag has 44 filters
      const bags = Math.ceil(count / 44);
      return `${bags} bag${bags > 1 ? 's' : ''} (${count} filters)`;
    case 'Fiberglass':
      // Each box has ~46 filters (based on the image)
      const boxes = Math.ceil(count / 46);
      return `${boxes} box${boxes > 1 ? 'es' : ''} (${count} filters)`;
    case 'Pleated':
      // Each bundle has ~44 filters (based on the image)
      const bundles = Math.ceil(count / 44);
      return `${bundles} bundle${bundles > 1 ? 's' : ''} (${count} filters)`;
    case 'Frame':
      return `${count} frame${count > 1 ? 's' : ''}`;
    default:
      return `${count} unit${count > 1 ? 's' : ''}`;
  }
};

