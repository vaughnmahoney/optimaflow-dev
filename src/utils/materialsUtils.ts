
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

/**
 * Get badge variant based on material type
 */
export const getBadgeVariant = (type: string): string => {
  if (type === 'CONDCOIL') {
    return 'success';
  } else if (type === 'REFRIGERATOR_COILS' || type.includes('FREEZER') || type.includes('FREEZECOOL') || type.includes('COOLER')) {
    return 'info';
  } else if (type.startsWith('S') && type.endsWith('MEND')) {
    return 'purple'; // For Poly MEND filters
  } else if (type.startsWith('S')) {
    return 'warning'; // For regular Poly filters
  } else if (type.startsWith('G') && type.endsWith('B')) {
    return 'secondary'; // For Fiberglass filters
  } else if (type.startsWith('P') && type.includes('INS')) {
    return 'primary'; // For Pleated filters
  } else if (type.startsWith('F')) {
    return 'destructive'; // For Frames
  } else if (type === 'PRODUCE') {
    return 'default'; // For Produce Coils
  } else {
    return 'outline';
  }
};
