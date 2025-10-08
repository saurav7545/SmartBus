import React, { useState, useEffect } from 'react';
import MapView from '../../components/UI/MapView';
import SearchBar from '../../components/UI/SearchBar';
import UserAccount from '../../components/UI/UserAccount';
import BusCount from '../../components/UI/BusCount';
import FindMyBus from '../../components/UI/FindMyBus';
import { ToastContainer, useToast } from '../../components/common/Toast';
import styles from './UserDashboard.module.css';


function UserDashboard({ onLogout }) {
  const [showBuses, setShowBuses] = useState(false);
  const [buses, setBuses] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showFindMyBus, setShowFindMyBus] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude 
          });
        },
        (err) => {
          console.error('Error getting location:', err);
          // Set default location (Dehradun) if can't get user location
          setUserLocation({ lat: 30.3165, lng: 78.0322 });
        }
      );
    }
    
  }, []);

  // Calculate real distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const calculateETA = (departureTime) => {
    const departure = new Date();
    const [hours, minutes] = departureTime.split(/[:\s]/);
    const period = departureTime.split(' ')[1];
    
    departure.setHours(
      period === 'PM' && hours !== '12' ? parseInt(hours) + 12 : parseInt(hours),
      parseInt(minutes) || 0, 0, 0
    );
    
    const now = new Date();
    const diffMs = departure - now;
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    
    return diffMins;
  };

  const handleSearch = async (currentLocation, destination) => {
    // Validate input parameters
    if (!currentLocation || !destination || 
        currentLocation.trim().length < 3 || destination.trim().length < 3) {
      addToast('❌ Please enter valid source and destination (minimum 3 characters)', 'error');
      return;
    }
    
    try {
      // Call actual backend API to validate route
      const response = await fetch(`http://localhost:8000/api/routes/search/?source=${encodeURIComponent(currentLocation)}&destination=${encodeURIComponent(destination)}`);
      const data = await response.json();
      
      if (response.ok && data.success && data.routes && data.routes.length > 0) {
        // Valid route found - show buses
        const validRoute = data.routes[0];
        
        const mockBuses = [
          {
            id: 1,
            name: validRoute.buses[0]?.bus_name || 'City Express',
            route: `${validRoute.source} to ${validRoute.destination}`,
            departureTime: validRoute.buses[0]?.departure_time || '10:00',
            arrivalTime: validRoute.buses[0]?.arrival_time || '12:00',
            eta: calculateETA(validRoute.buses[0]?.departure_time || '10:00 AM'),
            busNumber: validRoute.buses[0]?.bus_number || 'DL01AB1234',
            type: validRoute.buses[0]?.bus_name || 'AC Deluxe',
            currentLocation: {
              lat: userLocation ? userLocation.lat + (Math.random() - 0.5) * 0.05 : 30.3165 + (Math.random() - 0.5) * 0.05,
              lng: userLocation ? userLocation.lng + (Math.random() - 0.5) * 0.05 : 78.0322 + (Math.random() - 0.5) * 0.05
            }
          }
        ];
        
        // Add more buses if available
        if (validRoute.buses.length > 1) {
          for (let i = 1; i < Math.min(validRoute.buses.length, 3); i++) {
            const bus = validRoute.buses[i];
            mockBuses.push({
              id: i + 1,
              name: bus.bus_name,
              route: `${validRoute.source} to ${validRoute.destination}`,
              departureTime: bus.departure_time,
              arrivalTime: bus.arrival_time,
              eta: calculateETA(bus.departure_time || '2:00 PM'),
              busNumber: bus.bus_number,
              type: bus.bus_name,
              currentLocation: {
                lat: userLocation ? userLocation.lat + (Math.random() - 0.5) * 0.08 : 30.3165 + (Math.random() - 0.5) * 0.08,
                lng: userLocation ? userLocation.lng + (Math.random() - 0.5) * 0.08 : 78.0322 + (Math.random() - 0.5) * 0.08
              }
            });
          }
        }
        
        // Calculate distance from user location to each bus
        const busesWithDistance = mockBuses.map(bus => ({
          ...bus,
          distance: userLocation ? calculateDistance(
            userLocation.lat, userLocation.lng,
            bus.currentLocation.lat, bus.currentLocation.lng
          ).toFixed(2) : 'N/A'
        }));
        
        setBuses(busesWithDistance);
        setShowBuses(true);
        
        // Show search success toast
        addToast(`✅ Found ${busesWithDistance.length} buses from ${validRoute.source} to ${validRoute.destination}`, 'success');
        
      } else {
        // Invalid route or no buses
        setBuses([]);
        setShowBuses(false);
        
        if (data.error) {
          addToast(`❌ ${data.error}`, 'error', 5000);
          
          // Show suggestions if available
          if (data.suggestions && data.suggestions.length > 0) {
            setTimeout(() => {
              const suggestions = data.suggestions.slice(0, 3).join(', ');
              addToast(`💡 Try: ${suggestions}`, 'info', 8000);
            }, 2000);
          }
        } else {
          addToast(`❌ No routes found from ${currentLocation} to ${destination}`, 'error', 4000);
        }
      }
      
    } catch (error) {
      console.error('Route search error:', error);
      setBuses([]);
      setShowBuses(false);
      addToast('❌ Unable to search routes. Please check your connection.', 'error');
    }
  };

  const handleCloseBuses = () => {
    setShowBuses(false);
  };



  const handleTrackBus = (bus) => {
    try {
      // Store bus info in localStorage for smartbus-tracker
      const busTrackingData = {
        busNumber: bus.busNumber,
        busName: bus.name,
        route: bus.route,
        currentLocation: bus.currentLocation,
        distance: bus.distance,
        eta: bus.eta,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('smartbus_tracking_data', JSON.stringify(busTrackingData));
      
      // Show tracking started message
      addToast(`🚌 Starting live tracking for ${bus.name} (${bus.busNumber})`, 'success', 3000);
      
      // Open smartbus-tracker in new window/tab
      const trackerUrl = 'http://localhost:3001'; // smartbus-tracker default port
      const trackerWindow = window.open(trackerUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      
      if (!trackerWindow) {
        // If popup blocked, try direct navigation
        addToast('⚠️ Popup blocked. Opening tracker in new tab...', 'warning', 3000);
        setTimeout(() => {
          window.open(trackerUrl, '_blank');
        }, 1000);
      } else {
        // Success message
        setTimeout(() => {
          addToast('📍 Live tracking opened in new window. You can track your bus in real-time!', 'info', 5000);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error opening bus tracker:', error);
      addToast('❌ Error opening live tracker. Please ensure smartbus-tracker is running on port 3001.', 'error', 5000);
    }
  };
  
  
  const handleFindMyBus = (query, searchType) => {
    // Integrate Find My Bus functionality
    setShowFindMyBus(true);
    
    // Pass the search data to Find My Bus component
    // This will be handled by the Find My Bus component itself
    addToast(`🔍 Searching for ${searchType === 'number' ? 'bus number' : 'route'}: ${query}`, 'info', 3000);
  };
  

  return (
    <div className={styles.busContainer}>
      <MapView 
        userLocation={userLocation}
      />
      <SearchBar onSearch={handleSearch} onFindMyBus={handleFindMyBus} />
      <UserAccount onLogout={onLogout} />
      

      
      {showBuses && (
        <BusCount 
          buses={buses} 
          onClose={handleCloseBuses}
          onTrackBus={handleTrackBus}
        />)}
      
      {/* Find My Bus Modal */}
      {showFindMyBus && (
        <FindMyBus onClose={() => setShowFindMyBus(false)} />
      )}
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default UserDashboard;
