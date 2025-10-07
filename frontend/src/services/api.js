// API Configuration for SmartBus Backend
const API_BASE_URL = 'http://localhost:8000/api';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login/`,
    REGISTER: `${API_BASE_URL}/auth/register/`,
    CHECK_API: `${API_BASE_URL}/auth/check/`,
    CHECK_DB: `${API_BASE_URL}/auth/db-check/`,
    DB_INFO: `${API_BASE_URL}/auth/db-info/`,
  }
};

// HTTP Request Helper
class ApiService {
  async makeRequest(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      console.log(`🚀 Making request to: ${url}`, config);
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log(`📥 Response from ${url}:`, data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Request failed for ${url}:`, error);
      throw error;
    }
  }

  // GET request
  async get(url, headers = {}) {
    return this.makeRequest(url, {
      method: 'GET',
      headers
    });
  }

  // POST request
  async post(url, data, headers = {}) {
    return this.makeRequest(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(url, data, headers = {}) {
    return this.makeRequest(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(url, headers = {}) {
    return this.makeRequest(url, {
      method: 'DELETE',
      headers
    });
  }
}

// Create and export API service instance
export const apiService = new ApiService();

// Test API connection
export const testApiConnection = async () => {
  try {
    const response = await apiService.get(API_ENDPOINTS.AUTH.CHECK_API);
    console.log('✅ API Connection Test:', response);
    return response;
  } catch (error) {
    console.error('❌ API Connection Failed:', error);
    throw error;
  }
};

// Test Database connection
export const testDatabaseConnection = async () => {
  try {
    const response = await apiService.get(API_ENDPOINTS.AUTH.CHECK_DB);
    console.log('✅ Database Connection Test:', response);
    return response;
  } catch (error) {
    console.error('❌ Database Connection Failed:', error);
    throw error;
  }
};

// Get Database Info
export const getDatabaseInfo = async () => {
  try {
    const response = await apiService.get(API_ENDPOINTS.AUTH.DB_INFO);
    console.log('📊 Database Info:', response);
    return response;
  } catch (error) {
    console.error('❌ Database Info Failed:', error);
    throw error;
  }
};

export default apiService;