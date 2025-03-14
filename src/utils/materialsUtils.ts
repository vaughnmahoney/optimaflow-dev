/**
 * Format a material type to be more readable
 * @param type The material type code
 * @returns Formatted material type string
 */
export const formatMaterialType = (type: string): string => {
  // Handle coil items
  if (type === 'CONDCOIL') return 'Condenser Coil';
  if (type === 'REFRIGERATOR_COILS') return 'Refrigerator Coil';
  if (type === 'PRODUCE') return 'Produce Coil';
  if (type === 'FREEZER' || type === 'COOLER') return 'Refrigerator Coil';
  if (type === 'P-TRAP') return 'P-Trap';
  
  // Handle filter types
  if (type.startsWith('S') && type.endsWith('MEND')) {
    // Extract size from code like "S16X20X1MEND"
    const sizeMatch = type.match(/S(\d+)X(\d+)X(\d+)MEND/);
    if (sizeMatch) {
      const [_, width, height, depth] = sizeMatch;
      return `Polyester MEND Filter ${width}x${height}x${depth}`;
    }
    return 'Polyester MEND Filter';
  }
  
  if (type.startsWith('S')) {
    // Extract size from code like "S16X20X1"
    const sizeMatch = type.match(/S(\d+)X(\d+)X(\d+)/);
    if (sizeMatch) {
      const [_, width, height, depth] = sizeMatch;
      return `Polyester Filter ${width}x${height}x${depth}`;
    }
    return 'Polyester Filter';
  }
  
  if (type.startsWith('G') && type.endsWith('B')) {
    // Extract size from code like "G20X25X2B"
    const sizeMatch = type.match(/G(\d+)X(\d+)X(\d+)B/);
    if (sizeMatch) {
      const [_, width, height, depth] = sizeMatch;
      return `Fiberglass Filter ${width}x${height}x${depth}`;
    }
    return 'Fiberglass Filter';
  }
  
  if (type.startsWith('P') && type.includes('INS')) {
    // Extract size from code like "P16X25X2INS"
    const sizeMatch = type.match(/P(\d+)X(\d+)X(\d+)INS/);
    if (sizeMatch) {
      const [_, width, height, depth] = sizeMatch;
      return `Pleated Filter ${width}x${height}x${depth}`;
    }
    return 'Pleated Filter';
  }
  
  if (type.startsWith('F')) {
    // Extract size from code like "F16X20X1"
    const sizeMatch = type.match(/F(\d+)X(\d+)X(\d+)/);
    if (sizeMatch) {
      const [_, width, height, depth] = sizeMatch;
      return `Frame ${width}x${height}x${depth}`;
    }
    return 'Frame';
  }
  
  // Return the original type if no formatting rules match
  return type;
};

/**
 * Group materials by type for summary display
 * @param materials List of material items
 * @returns Record with grouped counts by category
 */
export const groupMaterialsByCategory = (materials: any[]): Record<string, number> => {
  const result: Record<string, number> = {};
  
  materials.forEach(item => {
    const type = item.type;
    const quantity = item.quantity;
    
    // Group refrigerator coils types together
    if (type === 'FREEZER' || type === 'COOLER') {
      result['REFRIGERATOR_COILS'] = (result['REFRIGERATOR_COILS'] || 0) + quantity;
      return;
    }
    
    // Group other types
    if (type.startsWith('S') && type.endsWith('MEND')) {
      result['POLY_MEND'] = (result['POLY_MEND'] || 0) + quantity;
    } else if (type.startsWith('S')) {
      result['POLY'] = (result['POLY'] || 0) + quantity;
    } else if (type.startsWith('G') && type.endsWith('B')) {
      result['FIBERGLASS'] = (result['FIBERGLASS'] || 0) + quantity;
    } else if (type.startsWith('P') && type.includes('INS')) {
      result['PLEATED'] = (result['PLEATED'] || 0) + quantity;
    } else if (type.startsWith('F')) {
      result['FRAMES'] = (result['FRAMES'] || 0) + quantity;
    } else {
      // Keep other types as-is
      result[type] = (result[type] || 0) + quantity;
    }
  });
  
  return result;
};
