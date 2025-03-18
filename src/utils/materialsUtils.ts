
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
 * Get badge variant based on material type - only using valid variants
 * The valid variants are: "default", "destructive", "outline", "secondary"
 */
export const getBadgeVariant = (type: string): "default" | "destructive" | "outline" | "secondary" => {
  if (type === 'CONDCOIL') {
    return 'default'; // Was 'success', now 'default'
  } else if (type === 'REFRIGERATOR_COILS' || type.includes('FREEZER') || type.includes('FREEZECOOL') || type.includes('COOLER')) {
    return 'secondary'; // Was 'info', now 'secondary'
  } else if (type.startsWith('S') && type.endsWith('MEND')) {
    return 'destructive';  // Was 'purple', now 'destructive'
  } else if (type.startsWith('S')) {
    return 'default'; // Was 'warning', now 'default'
  } else if (type.startsWith('G') && type.endsWith('B')) {
    return 'secondary'; // Was 'secondary', kept as 'secondary'
  } else if (type.startsWith('P') && type.includes('INS')) {
    return 'default'; // Was 'primary', now 'default'
  } else if (type.startsWith('F')) {
    return 'destructive'; // Was 'destructive', kept as 'destructive'
  } else if (type === 'PRODUCE') {
    return 'default'; // Was 'default', kept as 'default'
  } else {
    return 'outline'; // Was 'outline', kept as 'outline'
  }
};
