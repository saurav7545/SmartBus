import React, { useState, useEffect } from 'react';
import styles from './FindMyBus.module.css';

const FindMyBus = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('number'); // 'number' or 'route'
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveTracking, setLiveTracking] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [trackingInterval, setTrackingInterval] = useState(null);

  // Mock bus database
  const busDatabase = [
    {
      busNumber: 'DL01AB1234',
      name: 'City Express',
      route: 'Connaught Place → Karol Bagh → Rajouri Garden',
      currentStop: 'Karol Bagh Metro Station',
      nextStop: 'Rajouri Garden',
      stops: ['Connaught Place', 'Karol Bagh Metro Station', 'Patel Nagar', 'Rajouri Garden', 'Tilak Nagar'],
      currentStopIndex: 1,
      status: 'Running On Time',
      delay: 0,
      speed: 35,
      occupancy: 75,
      driver: 'Rajesh Kumar',
      contact: '+91-98765-43210',
      location: { lat: 28.6519, lng: 77.1910 },
      expectedTime: '15:30',
      platformNumber: '2A',
      lastUpdated: new Date(),
      features: ['AC', 'WiFi', 'GPS', 'USB Charging']
    },
    {
      busNumber: 'HR55C9876',
      name: 'Metro Link',
      route: 'ISBT → Red Fort → India Gate → AIIMS',
      currentStop: 'Red Fort',
      nextStop: 'India Gate',
      stops: ['ISBT Kashmere Gate', 'Red Fort', 'Jama Masjid', 'India Gate', 'AIIMS', 'IIT Delhi'],
      currentStopIndex: 1,
      status: 'Delayed',
      delay: 8,
      speed: 28,
      occupancy: 60,
      driver: 'Suresh Singh',
      contact: '+91-87654-32109',
      location: { lat: 28.6562, lng: 77.2410 },
      expectedTime: '16:15',
      platformNumber: '1B',
      lastUpdated: new Date(),
      features: ['Non-AC', 'GPS', 'Emergency Button']
    },
    {
      busNumber: 'UP14T2020',
      name: 'Royal Rider',
      route: 'Ghaziabad → Anand Vihar → CP → Airport',
      currentStop: 'Anand Vihar Terminal',
      nextStop: 'Connaught Place',
      stops: ['Ghaziabad ISBT', 'Anand Vihar Terminal', 'Yamuna Bank', 'Connaught Place', 'Airport Terminal 3'],
      currentStopIndex: 1,
      status: 'Running Early',
      delay: -5,
      speed: 42,
      occupancy: 85,
      driver: 'Amit Sharma',
      contact: '+91-76543-21098',
      location: { lat: 28.6469, lng: 77.2761 },
      expectedTime: '14:45',
      platformNumber: '3C',
      lastUpdated: new Date(),
      features: ['Luxury', 'AC', 'WiFi', 'Entertainment System', 'Reclining Seats']
    }
  ];

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
          console.error('Location error:', err);
          setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
        }
      );
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Search for bus
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let foundBus = null;
      
      if (searchType === 'number') {
        foundBus = busDatabase.find(bus => 
          bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        foundBus = busDatabase.find(bus => 
          bus.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bus.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (foundBus && userLocation) {
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          foundBus.location.lat, foundBus.location.lng
        );
        foundBus.distanceFromUser = distance.toFixed(2);
      }
      
      setBusData(foundBus);
      setLoading(false);
    }, 1500);
  };

  // Start live tracking
  const startLiveTracking = () => {
    if (!busData) return;
    
    setLiveTracking(true);
    
    const interval = setInterval(() => {
      setBusData(prevData => {
        if (!prevData) return null;
        
        // Simulate bus movement
        const newLat = prevData.location.lat + (Math.random() - 0.5) * 0.001;
        const newLng = prevData.location.lng + (Math.random() - 0.5) * 0.001;
        
        // Update other dynamic data
        const newSpeed = Math.max(15, Math.min(60, prevData.speed + (Math.random() - 0.5) * 10));
        const newOccupancy = Math.max(20, Math.min(100, prevData.occupancy + (Math.random() - 0.5) * 20));
        
        let newDistance = prevData.distanceFromUser;
        if (userLocation) {
          newDistance = calculateDistance(
            userLocation.lat, userLocation.lng,
            newLat, newLng
          ).toFixed(2);
        }
        
        return {
          ...prevData,
          location: { lat: newLat, lng: newLng },
          speed: Math.round(newSpeed),
          occupancy: Math.round(newOccupancy),
          distanceFromUser: newDistance,
          lastUpdated: new Date()
        };
      });
    }, 5000); // Update every 5 seconds
    
    setTrackingInterval(interval);
  };

  // Stop live tracking
  const stopLiveTracking = () => {
    setLiveTracking(false);
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Running On Time': return '#28a745';
      case 'Delayed': return '#dc3545';
      case 'Running Early': return '#007bff';
      default: return '#6c757d';
    }
  };

  // Get occupancy color
  const getOccupancyColor = (occupancy) => {
    if (occupancy < 50) return '#28a745';
    if (occupancy < 80) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>🚌 Find My Bus</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Search Section */}
        <div className={styles.searchSection}>
          <div className={styles.searchToggle}>
            <button 
              className={`${styles.toggleBtn} ${searchType === 'number' ? styles.active : ''}`}
              onClick={() => setSearchType('number')}
            >
              Bus Number
            </button>
            <button 
              className={`${styles.toggleBtn} ${searchType === 'route' ? styles.active : ''}`}
              onClick={() => setSearchType('route')}
            >
              Route/Name
            </button>
          </div>
          
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder={searchType === 'number' ? 'Enter bus number (e.g., DL01AB1234)' : 'Enter route or bus name'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
            <button 
              className={styles.searchBtn}
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? '🔍' : '🔎'}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Searching for your bus...</p>
          </div>
        )}

        {/* Bus Data */}
        {busData && (
          <div className={styles.busInfo}>
            <div className={styles.busHeader}>
              <div>
                <h3>{busData.name}</h3>
                <p className={styles.busNumber}>{busData.busNumber}</p>
              </div>
              <div className={styles.liveStatus}>
                {liveTracking ? (
                  <button className={styles.stopTrackingBtn} onClick={stopLiveTracking}>
                    🔴 Stop Live
                  </button>
                ) : (
                  <button className={styles.startTrackingBtn} onClick={startLiveTracking}>
                    📍 Start Live
                  </button>
                )}
              </div>
            </div>

            <div className={styles.routeInfo}>
              <h4>📍 Route Information</h4>
              <p className={styles.routePath}>{busData.route}</p>
              
              <div className={styles.stopProgress}>
                {busData.stops.map((stop, index) => (
                  <div 
                    key={index} 
                    className={`${styles.stop} ${
                      index <= busData.currentStopIndex ? styles.completed : styles.upcoming
                    } ${index === busData.currentStopIndex ? styles.current : ''}`}
                  >
                    <div className={styles.stopDot}></div>
                    <span className={styles.stopName}>{stop}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.liveData}>
              <div className={styles.dataGrid}>
                <div className={styles.dataCard}>
                  <span className={styles.dataLabel}>Current Status</span>
                  <span 
                    className={styles.dataValue}
                    style={{ color: getStatusColor(busData.status) }}
                  >
                    {busData.status}
                  </span>
                </div>
                
                <div className={styles.dataCard}>
                  <span className={styles.dataLabel}>Speed</span>
                  <span className={styles.dataValue}>{busData.speed} km/h</span>
                </div>
                
                <div className={styles.dataCard}>
                  <span className={styles.dataLabel}>Occupancy</span>
                  <span 
                    className={styles.dataValue}
                    style={{ color: getOccupancyColor(busData.occupancy) }}
                  >
                    {busData.occupancy}%
                  </span>
                </div>
                
                <div className={styles.dataCard}>
                  <span className={styles.dataLabel}>Distance from You</span>
                  <span className={styles.dataValue}>
                    📍 {busData.distanceFromUser} km
                  </span>
                </div>
                
                <div className={styles.dataCard}>
                  <span className={styles.dataLabel}>Delay</span>
                  <span className={styles.dataValue}>
                    {busData.delay > 0 ? `+${busData.delay}` : busData.delay} min
                  </span>
                </div>
                
                <div className={styles.dataCard}>
                  <span className={styles.dataLabel}>Platform</span>
                  <span className={styles.dataValue}>{busData.platformNumber}</span>
                </div>
              </div>
            </div>

            <div className={styles.driverInfo}>
              <h4>👨‍✈️ Driver Information</h4>
              <div className={styles.driverDetails}>
                <p><strong>Name:</strong> {busData.driver}</p>
                <p><strong>Contact:</strong> {busData.contact}</p>
                <p><strong>Last Updated:</strong> {busData.lastUpdated.toLocaleTimeString()}</p>
              </div>
            </div>

            <div className={styles.features}>
              <h4>✨ Bus Features</h4>
              <div className={styles.featuresList}>
                {busData.features.map((feature, index) => (
                  <span key={index} className={styles.featureTag}>{feature}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !busData && searchQuery && (
          <div className={styles.noResults}>
            <p>🚌 No bus found matching your search</p>
            <p>Please check the bus number or route and try again</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindMyBus;