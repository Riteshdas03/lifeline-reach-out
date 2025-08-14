
import { MockApiService } from './mockApiService';
import { RealApiService } from './realApiService';

// Smart API service selection logic
const getApiService = () => {
  const forceUseMock = import.meta.env.VITE_USE_MOCK_API === 'true';
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Force mock API if explicitly requested
  if (forceUseMock) {
    console.log('🔧 Using Mock API (forced by VITE_USE_MOCK_API=true)');
    return MockApiService;
  }
  
  // Use real API if URL is provided and valid
  if (apiUrl && apiUrl.trim() !== '') {
    try {
      const url = new URL(apiUrl);
      // Check if it's not localhost when in production
      if (window.location.hostname !== 'localhost' && url.hostname === 'localhost') {
        console.warn('⚠️ Localhost API detected in production, falling back to Mock API');
        return MockApiService;
      }
      console.log(`🌐 Using Real API: ${apiUrl}`);
      return RealApiService;
    } catch (error) {
      console.warn('⚠️ Invalid API URL, falling back to Mock API:', error);
      return MockApiService;
    }
  }
  
  // Default to Mock API if no valid configuration
  console.log('📱 Using Mock API (default fallback)');
  return MockApiService;
};

// Export the selected service
export const ApiService = getApiService();

// Also export individual services for explicit use
export { MockApiService, RealApiService };

// Export a function to check current service type
export const getCurrentApiType = (): 'mock' | 'real' => {
  return ApiService === MockApiService ? 'mock' : 'real';
};
