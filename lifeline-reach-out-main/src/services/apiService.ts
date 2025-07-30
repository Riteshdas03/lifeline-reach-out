
import { MockApiService } from './mockApiService';
import { RealApiService } from './realApiService';

// Configuration to switch between mock and real API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

// Export the appropriate service based on configuration
export const ApiService = USE_MOCK_API ? MockApiService : RealApiService;

// Also export individual services for explicit use
export { MockApiService, RealApiService };
