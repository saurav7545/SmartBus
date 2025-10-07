// Authentication Service for SmartBus
import { apiService, API_ENDPOINTS } from './api.js';

// User Authentication Class
class AuthService {
  constructor() {
    this.currentUser = this.getCurrentUser();
  }

  // Login user
  async login(email, password, userType = 'user') {
    try {
      console.log(`🔐 Attempting login: ${email} as ${userType}`);
      
      const loginData = {
        email: email,
        password: password,
        userType: userType
      };

      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, loginData);
      
      if (response.success) {
        // Store user data in localStorage
        const userData = {
          email: response.email,
          name: response.name,
          userType: response.user_type,
          isAuthenticated: true,
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('smartbus_user', JSON.stringify(userData));
        this.currentUser = userData;
        
        console.log('✅ Login successful:', userData);
        return {
          success: true,
          user: userData,
          message: response.message
        };
      }
      
      return {
        success: false,
        message: response.message || 'Login failed'
      };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.'
      };
    }
  }

  // Register new user (Bus Operator)
  async register(userData) {
    try {
      console.log('📝 Attempting registration:', userData);
      
      const registrationData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        userType: userData.userType || 'bus',
        busName: userData.busName,
        busNumber: userData.busNumber,
        route: userData.route
      };

      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, registrationData);
      
      if (response.success) {
        console.log('✅ Registration successful:', response);
        return {
          success: true,
          message: response.message,
          data: {
            user_id: response.user_id,
            bus_id: response.bus_id,
            name: response.name,
            email: response.email,
            busName: response.bus_name,
            busNumber: response.bus_number,
            route: response.route
          }
        };
      }
      
      return {
        success: false,
        message: response.message || 'Registration failed'
      };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.'
      };
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('smartbus_user');
    this.currentUser = null;
    console.log('👋 User logged out');
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('smartbus_user');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('👤 Current user:', user);
        return user;
      }
    } catch (error) {
      console.error('Error reading user data:', error);
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null && this.currentUser.isAuthenticated;
  }

  // Get user type
  getUserType() {
    return this.currentUser?.userType || null;
  }

  // Check if user is bus operator
  isBusOperator() {
    return this.getUserType() === 'bus' || this.getUserType() === 'driver';
  }

  // Check if user is regular user
  isRegularUser() {
    return this.getUserType() === 'user';
  }

  // Check if user is admin
  isAdmin() {
    return this.getUserType() === 'admin';
  }

  // Update user data
  updateUserData(newData) {
    if (this.currentUser) {
      const updatedUser = { ...this.currentUser, ...newData };
      localStorage.setItem('smartbus_user', JSON.stringify(updatedUser));
      this.currentUser = updatedUser;
      return updatedUser;
    }
    return null;
  }

  // Get demo credentials for testing
  getDemoCredentials() {
    return {
      user: {
        email: 'user@smartbus.com',
        password: 'user123',
        userType: 'user'
      },
      admin: {
        email: 'admin@smartbus.com',
        password: 'admin123',
        userType: 'admin'
      },
      driver: {
        email: 'driver@smartbus.com',
        password: 'driver123',
        userType: 'driver'
      },
      bus: {
        email: 'bus@smartbus.com',
        password: 'bus123',
        userType: 'bus'
      }
    };
  }

  // Get user display info
  getUserDisplayInfo() {
    if (!this.currentUser) return null;
    
    return {
      name: this.currentUser.name,
      email: this.currentUser.email,
      userType: this.currentUser.userType,
      initials: this.currentUser.name ? this.currentUser.name.charAt(0).toUpperCase() : 'U'
    };
  }
}

// Create and export auth service instance
export const authService = new AuthService();

// Export convenience functions
export const login = (email, password, userType) => authService.login(email, password, userType);
export const register = (userData) => authService.register(userData);
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const getUserType = () => authService.getUserType();
export const isBusOperator = () => authService.isBusOperator();
export const isRegularUser = () => authService.isRegularUser();
export const isAdmin = () => authService.isAdmin();
export const getDemoCredentials = () => authService.getDemoCredentials();
export const getUserDisplayInfo = () => authService.getUserDisplayInfo();

export default authService;