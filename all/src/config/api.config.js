/**
 * Configuration utility for determining the correct backend URL
 * Handles both local development and GitHub Codespaces environments
 */

export const getBackendURL = () => {
  // Get the current frontend URL
  const frontendURL = window.location.origin;
  
  // Check if we're in a GitHub Codespaces environment
  if (frontendURL.includes('github.dev')) {
    // Replace port 3000 with 5000 for the backend
    // e.g., https://username-12345-3000.app.github.dev → https://username-12345-5000.app.github.dev
    return frontendURL.replace(':3000', ':5000').replace('-3000.', '-5000.');
  }
  
  // Local development: use localhost:5000
  return 'http://localhost:5000';
};

export const getWebSocketURL = () => {
  const backendURL = getBackendURL();
  
  // Convert http/https to ws/wss
  if (backendURL.startsWith('https://')) {
    return backendURL.replace('https://', 'wss://');
  }
  
  if (backendURL.startsWith('http://')) {
    return backendURL.replace('http://', 'ws://');
  }
  
  return backendURL;
};

console.log('🔧 Backend URL:', getBackendURL());
console.log('🔧 WebSocket URL:', getWebSocketURL());
