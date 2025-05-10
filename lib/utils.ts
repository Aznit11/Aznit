/**
 * Formats a price with currency symbol
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

/**
 * Calculates the sale price after discount
 */
export const calculateSalePrice = (price: number, discount?: number | null): number => {
  if (!discount) return price;
  
  const discountAmount = (price * discount) / 100;
  return price - discountAmount;
};

/**
 * Converts a Google Drive sharing link to a direct image URL
 */
export const convertGoogleDriveLink = (url: string): string => {
  if (!url) return '';
  
  // If already in the correct format, return as is
  if (url.includes('export=view')) {
    return url;
  }
  
  // Extract file ID from various Google Drive URL formats
  let fileId = '';
  
  // Format: https://drive.google.com/file/d/{fileId}/view...
  if (url.includes('/file/d/')) {
    fileId = url.split('/file/d/')[1].split('/')[0];
  } 
  // Format: https://drive.google.com/open?id={fileId}
  else if (url.includes('open?id=')) {
    fileId = url.split('open?id=')[1].split('&')[0];
  }
  // Format: https://drive.google.com/uc?id={fileId}
  else if (url.includes('uc?id=')) {
    fileId = url.split('uc?id=')[1].split('&')[0];
  }
  
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  return url;
}; 