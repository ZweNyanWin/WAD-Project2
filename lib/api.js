// Utility function to get the correct API base path
export function getApiPath(endpoint) {
  // In the browser, check if we're running with a basePath
  if (typeof window !== 'undefined') {
    // Get the current path to detect if we're running with basePath
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/Project02')) {
      return `/Project02/api${endpoint}`;
    }
  }
  // For server-side or when no basePath is detected
  return `/api${endpoint}`;
}

// Utility function to get the correct image path
export function getImagePath(imagePath) {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // In the browser, check if we're running with a basePath
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/Project02')) {
      // If the image path doesn't already include Project02, add it
      if (!imagePath.startsWith('/Project02')) {
        return `/Project02${imagePath}`;
      }
    }
  }
  
  return imagePath;
}

// Wrapper function for fetch with correct API path
export async function apiCall(endpoint, options = {}) {
  const url = getApiPath(endpoint);
  return fetch(url, options);
}