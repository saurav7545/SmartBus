/**
 * Route Service - Frontend integration with SmartBus Route API
 * Handles intelligent route validation and bus search functionality
 */

import { apiRequest } from './api.js';

const ROUTE_ENDPOINTS = {
    SEARCH_ROUTES: '/routes/search/',
    FIND_BUS_BY_NAME: '/routes/find-bus/',
    GET_ALL_ROUTES: '/routes/',
    GET_ROUTE_DETAILS: '/routes/',
    HEALTH_CHECK: '/routes/health/'
};

/**
 * Search routes by source and destination
 * @param {string} source - Source city
 * @param {string} destination - Destination city
 * @returns {Promise<Object>} Route search results
 */
export const searchRoutes = async (source, destination) => {
    try {
        const params = {};
        if (source) params.source = source.trim();
        if (destination) params.destination = destination.trim();

        const response = await apiRequest(ROUTE_ENDPOINTS.SEARCH_ROUTES, 'GET', null, params);
        
        if (response.success) {
            return {
                success: true,
                routes: response.routes || [],
                totalFound: response.total_found || 0,
                searchParams: response.search_params || {}
            };
        } else {
            return {
                success: false,
                error: response.error || 'Search failed',
                message: response.message || '',
                suggestions: response.suggestions || []
            };
        }
    } catch (error) {
        console.error('❌ Route search error:', error);
        return {
            success: false,
            error: 'Unable to search routes. Please check your connection.',
            suggestions: []
        };
    }
};

/**
 * Find buses by route name with intelligent validation
 * @param {string} routeName - Route name to search
 * @returns {Promise<Object>} Bus search results
 */
export const findBusByRouteName = async (routeName) => {
    try {
        if (!routeName || !routeName.trim()) {
            return {
                success: false,
                error: 'Please enter a route name',
                suggestions: []
            };
        }

        const response = await apiRequest(ROUTE_ENDPOINTS.FIND_BUS_BY_NAME, 'GET', null, {
            route_name: routeName.trim()
        });

        if (response.success) {
            return {
                success: true,
                message: response.message || 'Buses found successfully',
                routeInfo: response.route_info || {},
                buses: response.buses || [],
                totalBuses: response.total_buses || 0
            };
        } else {
            return {
                success: false,
                error: response.error || 'Route not found',
                message: response.message || '',
                suggestions: response.suggestions || []
            };
        }
    } catch (error) {
        console.error('❌ Find bus error:', error);
        return {
            success: false,
            error: 'Unable to find buses. Please check your connection.',
            suggestions: []
        };
    }
};

/**
 * Get all available routes with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 10)
 * @param {Object} filters - Search filters
 * @returns {Promise<Object>} All routes data
 */
export const getAllRoutes = async (page = 1, pageSize = 10, filters = {}) => {
    try {
        const params = {
            page: page,
            page_size: pageSize
        };

        // Add filters
        if (filters.type) params.type = filters.type;
        if (filters.source) params.source = filters.source;
        if (filters.destination) params.destination = filters.destination;

        const response = await apiRequest(ROUTE_ENDPOINTS.GET_ALL_ROUTES, 'GET', null, params);

        if (response.success) {
            return {
                success: true,
                routes: response.routes || [],
                pagination: response.pagination || {}
            };
        } else {
            return {
                success: false,
                error: response.error || 'Failed to fetch routes',
                routes: []
            };
        }
    } catch (error) {
        console.error('❌ Get all routes error:', error);
        return {
            success: false,
            error: 'Unable to load routes. Please try again.',
            routes: []
        };
    }
};

/**
 * Get detailed information about a specific route
 * @param {number} routeId - Route ID
 * @returns {Promise<Object>} Route details
 */
export const getRouteDetails = async (routeId) => {
    try {
        const response = await apiRequest(`${ROUTE_ENDPOINTS.GET_ROUTE_DETAILS}${routeId}/`, 'GET');

        if (response.success) {
            return {
                success: true,
                route: response.route || {}
            };
        } else {
            return {
                success: false,
                error: response.error || 'Route details not found'
            };
        }
    } catch (error) {
        console.error('❌ Get route details error:', error);
        return {
            success: false,
            error: 'Unable to load route details. Please try again.'
        };
    }
};

/**
 * Get popular cities for autocomplete
 * @returns {Promise<Array>} List of popular cities
 */
export const getPopularCities = async () => {
    try {
        // Get cities from available routes
        const routesResponse = await getAllRoutes(1, 50);
        
        if (routesResponse.success && routesResponse.routes) {
            const cities = new Set();
            
            routesResponse.routes.forEach(route => {
                cities.add(route.source);
                cities.add(route.destination);
            });
            
            return Array.from(cities).sort();
        }
        
        // Fallback to common Indian cities
        return [
            'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 
            'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'
        ];
    } catch (error) {
        console.error('❌ Get popular cities error:', error);
        return [
            'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 
            'Hyderabad', 'Pune', 'Ahmedabad'
        ];
    }
};

/**
 * Get available route names for autocomplete
 * @returns {Promise<Array>} List of route names
 */
export const getAvailableRouteNames = async () => {
    try {
        const routesResponse = await getAllRoutes(1, 50);
        
        if (routesResponse.success && routesResponse.routes) {
            return routesResponse.routes.map(route => route.route_name).sort();
        }
        
        return [];
    } catch (error) {
        console.error('❌ Get route names error:', error);
        return [];
    }
};

/**
 * Validate route name before search
 * @param {string} routeName - Route name to validate
 * @returns {Promise<Object>} Validation result
 */
export const validateRouteName = async (routeName) => {
    if (!routeName || !routeName.trim()) {
        return {
            valid: false,
            error: 'Please enter a route name',
            suggestions: await getAvailableRouteNames()
        };
    }

    try {
        // Quick validation by trying to find the route
        const result = await findBusByRouteName(routeName);
        
        return {
            valid: result.success,
            error: result.success ? null : result.error,
            suggestions: result.suggestions || []
        };
    } catch (error) {
        return {
            valid: false,
            error: 'Unable to validate route name',
            suggestions: []
        };
    }
};

/**
 * Save recent search to localStorage
 * @param {Object} searchData - Search data to save
 * @param {string} searchType - Type of search ('route' or 'find_bus')
 */
export const saveRecentSearch = (searchData, searchType = 'route') => {
    try {
        const key = `recent_${searchType}_searches`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Add new search to beginning, remove duplicates
        const updated = [searchData, ...existing.filter(item => 
            JSON.stringify(item) !== JSON.stringify(searchData)
        )].slice(0, 10); // Keep only last 10 searches
        
        localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
        console.error('❌ Save recent search error:', error);
    }
};

/**
 * Get recent searches from localStorage
 * @param {string} searchType - Type of search ('route' or 'find_bus')
 * @returns {Array} Recent searches
 */
export const getRecentSearches = (searchType = 'route') => {
    try {
        const key = `recent_${searchType}_searches`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
        console.error('❌ Get recent searches error:', error);
        return [];
    }
};

/**
 * Clear recent searches
 * @param {string} searchType - Type of search ('route' or 'find_bus')
 */
export const clearRecentSearches = (searchType = 'route') => {
    try {
        const key = `recent_${searchType}_searches`;
        localStorage.removeItem(key);
    } catch (error) {
        console.error('❌ Clear recent searches error:', error);
    }
};

/**
 * Health check for route service
 * @returns {Promise<boolean>} Service health status
 */
export const checkRouteServiceHealth = async () => {
    try {
        const response = await apiRequest(ROUTE_ENDPOINTS.HEALTH_CHECK, 'GET');
        return response.success === true;
    } catch (error) {
        console.error('❌ Route service health check failed:', error);
        return false;
    }
};

// Default export with all functions
const routeService = {
    searchRoutes,
    findBusByRouteName,
    getAllRoutes,
    getRouteDetails,
    getPopularCities,
    getAvailableRouteNames,
    validateRouteName,
    saveRecentSearch,
    getRecentSearches,
    clearRecentSearches,
    checkRouteServiceHealth
};

export default routeService;