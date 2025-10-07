import React, { useState, useEffect } from 'react'
import styles from './ConductorDashboard.module.css';

const AccountCircle = ({ driverName, onClick }) => (
  <div className={styles.accountCircle} onClick={onClick} title="Account">
    <span className={styles.accountLetter}>
      {driverName ? driverName.charAt(0).toUpperCase() : 'U'}
    </span>
  </div>
);

const Sidebar = ({ busInfo, onLogout, onClose }) => (
  <aside className={styles.sidebar}>
    <AccountCircle driverName={busInfo.name || busInfo.driverName} onClick={onClose} />
    <hr className={styles.sidebarLine} />
    <h2 className={styles.sidebarTitle}>Account Details</h2>
    <p><strong>Bus Name:</strong> {busInfo.busName || 'N/A'}</p>
    <p><strong>Bus Number:</strong> {busInfo.busNumber || 'N/A'}</p>
    <p><strong>Route:</strong> {busInfo.route || 'N/A'}</p>
    <p><strong>Operator Name:</strong> {busInfo.name || busInfo.driverName || 'N/A'}</p>
    <p><strong>Email:</strong> {busInfo.email || 'N/A'}</p>
    <div className={styles.sidebarButtons}>
      <button className={styles.closeButton} onClick={onClose}>Close</button>
      <button className={styles.logoutButton} onClick={onLogout}>Logout</button>
    </div>
  </aside>
);

function MapView({ location, onClose }) {
  if (!location) return null;

  return (
    <div className={styles.mapOverlay}>
      <div className={styles.mapContainer}>
        <button onClick={onClose} className={styles.mapCloseButton}>Close</button>
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: '8px' }}
          src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
          allowFullScreen
        />
      </div>
    </div>
  );
}

function Dashboard({ busInfo, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gpsOn, setGpsOn] = useState(false);
  const [location, setLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [serviceRunning, setServiceRunning] = useState(false);
  const [passengerCount, setPassengerCount] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [tripDistance, setTripDistance] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [routeStatus, setRouteStatus] = useState('On Route');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState([]);
  const [weatherInfo, setWeatherInfo] = useState({ temp: 25, condition: 'Clear' });
  const [notifications, setNotifications] = useState([]);
  const [tripReport, setTripReport] = useState({
    totalTrips: 0,
    avgPassengers: 0,
    totalDistance: 0,
    avgSpeed: 0
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleGPS = () => {
    // If turning GPS on
    if (!gpsOn) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setGpsOn(true);
            console.log('GPS enabled:', pos.coords);
          },
          (err) => {
            console.error('GPS error:', err);
            alert('Could not get your location. Please check your GPS settings.');
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    // If turning GPS off
    } else {
      setGpsOn(false);
      setLocation(null);
      setShowMap(false);
      console.log('GPS disabled');
    }
  };

  const toggleService = () => {
    const newStatus = !serviceRunning;
    setServiceRunning(newStatus);
    if (newStatus) {
      // Reset counters when starting service
      setPassengerCount(0);
      setTripDistance(0);
      setSpeed(0);
      simulateRealTimeData();
    }
    console.log('Service status:', newStatus ? 'Started' : 'Stopped');
  };

  const simulateRealTimeData = () => {
    if (serviceRunning) {
      const interval = setInterval(() => {
        setSpeed(Math.floor(Math.random() * 60) + 20); // 20-80 km/h
        setTripDistance(prev => prev + 0.5); // Increase distance
        setLastUpdate(new Date());
        
        // Random passenger boarding/alighting
        if (Math.random() > 0.7) {
          const change = Math.random() > 0.6 ? 1 : -1;
          setPassengerCount(prev => Math.max(0, Math.min(50, prev + change)));
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  };

  const addPassenger = () => {
    setPassengerCount(prev => Math.min(50, prev + 1));
  };

  const removePassenger = () => {
    setPassengerCount(prev => Math.max(0, prev - 1));
  };

  // Emergency alert handler
  const toggleEmergency = () => {
    const newEmergencyMode = !emergencyMode;
    setEmergencyMode(newEmergencyMode);
    
    if (newEmergencyMode) {
      addNotification('🚨 EMERGENCY MODE ACTIVATED', 'emergency');
      setRouteStatus('Emergency Stop');
    } else {
      addNotification('✅ Emergency mode deactivated', 'success');
      setRouteStatus('On Route');
    }
  };

  // Notification system
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Maintenance check
  const checkMaintenance = () => {
    const alerts = [];
    if (tripDistance > 200) alerts.push('Schedule maintenance check');
    if (Math.random() > 0.7) alerts.push('Tire pressure check needed');
    if (Math.random() > 0.8) alerts.push('Engine check required');
    
    setMaintenanceAlerts(alerts);
    if (alerts.length > 0) {
      addNotification(`⚠️ ${alerts.length} maintenance alert(s)`, 'warning');
    }
  };

  // Route status cycling
  const cycleRouteStatus = () => {
    const statuses = ['On Route', 'At Stop', 'Boarding', 'Departing'];
    const currentIndex = statuses.indexOf(routeStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    setRouteStatus(nextStatus);
    addNotification(`Route status: ${nextStatus}`, 'info');
  };

  // Generate trip report
  const generateTripReport = () => {
    const report = {
      totalTrips: Math.floor(tripDistance / 50) + 1,
      avgPassengers: Math.floor((passengerCount + Math.random() * 20)),
      totalDistance: tripDistance.toFixed(1),
      avgSpeed: speed || 0
    };
    setTripReport(report);
    addNotification('📊 Trip report updated', 'success');
  };

  // Start simulation when service starts
  useEffect(() => {
    let cleanup;
    if (serviceRunning) {
      cleanup = simulateRealTimeData();
      
      // Generate initial data
      setTimeout(() => {
        checkMaintenance();
        generateTripReport();
      }, 2000);
    }
    return cleanup;
  }, [serviceRunning]);

  // Periodic maintenance check
  useEffect(() => {
    const interval = setInterval(() => {
      if (serviceRunning) {
        checkMaintenance();
        generateTripReport();
        
        // Simulate weather update
        const conditions = ['Clear', 'Cloudy', 'Rainy', 'Sunny'];
        setWeatherInfo({
          temp: Math.floor(Math.random() * 15) + 20,
          condition: conditions[Math.floor(Math.random() * conditions.length)]
        });
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [serviceRunning, tripDistance]);

  return (
    <div className={styles.container}>
      {/* Account Circle */}
      <AccountCircle driverName={busInfo.name || busInfo.driverName} onClick={toggleSidebar} />

      {sidebarOpen && <Sidebar busInfo={busInfo} onLogout={onLogout} onClose={toggleSidebar} />}

      {/* Main Dashboard Content */}
      <div className={styles.mainContent}>
        <h1 className={styles.dashboardTitle}>Conductor Dashboard</h1>
        <div className={styles.outerBox}>
          <div className={styles.infoBoxes}>
            <div className={styles.busInfoBox}>
              <h2 className={styles.boxTitle}>Bus Information</h2>
              <p><strong>Bus Name:</strong> {busInfo.busName || 'N/A'}</p>
              <p><strong>Route:</strong> {busInfo.route || 'N/A'}</p>
              <p><strong>Bus Number:</strong> {busInfo.busNumber || 'N/A'}</p>
              <p><strong>Status:</strong> 
                <span className={serviceRunning ? styles.statusActive : styles.statusInactive}>
                  {serviceRunning ? '🟢 Active' : '🔴 Stopped'}
                </span>
              </p>
            </div>
            <div className={styles.driverInfoBox}>
              <h2 className={styles.boxTitle}>Operator Information</h2>
              <p><strong>Operator Name:</strong> {busInfo.name || 'N/A'}</p>
              <p><strong>Distance:</strong> {tripDistance.toFixed(1)} km</p>
              <p><strong>Last Update:</strong> {lastUpdate.toLocaleTimeString()}</p>
            </div>
          </div>
          
          {/* Real-time Statistics */}
          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>{passengerCount}</span>
                <span className={styles.statLabel}>Passengers</span>
                <div className={styles.statButtons}>
                  <button onClick={addPassenger} className={styles.statBtnAdd}>+</button>
                  <button onClick={removePassenger} className={styles.statBtnRemove}>-</button>
                </div>
              </div>
            </div>
            
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚡</div>
              <div className={styles.statInfo}>
                <span className={styles.statNumber}>{speed}</span>
                <span className={styles.statLabel}>km/h</span>
              </div>
            </div>
            
          </div>
          
          {/* Advanced Analytics Section */}
          <div className={styles.analyticsSection}>
            <div className={styles.weatherCard}>
              <h3>🌤️ Weather</h3>
              <div className={styles.weatherInfo}>
                <span className={styles.temp}>{weatherInfo.temp}°C</span>
                <span className={styles.condition}>{weatherInfo.condition}</span>
              </div>
            </div>
            
            <div className={styles.routeCard}>
              <h3>🗺️ Route Status</h3>
              <div className={styles.routeStatus}>
                <span className={styles.statusBadge}>{routeStatus}</span>
                <button onClick={cycleRouteStatus} className={styles.statusBtn}>
                  Update Status
                </button>
              </div>
            </div>
            
            <div className={styles.reportCard}>
              <h3>📊 Trip Report</h3>
              <div className={styles.reportStats}>
                <div className={styles.reportStat}>
                  <span className={styles.statValue}>{tripReport.totalTrips}</span>
                  <span className={styles.statLabel}>Trips</span>
                </div>
                <div className={styles.reportStat}>
                  <span className={styles.statValue}>{tripReport.totalDistance} km</span>
                  <span className={styles.statLabel}>Total Distance</span>
                </div>
                <div className={styles.reportStat}>
                  <span className={styles.statValue}>{tripReport.avgPassengers}</span>
                  <span className={styles.statLabel}>Avg Passengers</span>
                </div>
                <div className={styles.reportStat}>
                  <span className={styles.statValue}>{tripReport.avgSpeed} km/h</span>
                  <span className={styles.statLabel}>Avg Speed</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Maintenance Alerts */}
          {maintenanceAlerts.length > 0 && (
            <div className={styles.alertsSection}>
              <h3>⚠️ Maintenance Alerts</h3>
              <div className={styles.alertsList}>
                {maintenanceAlerts.map((alert, index) => (
                  <div key={index} className={styles.alertItem}>
                    {alert}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service and GPS Circles */}
      <div className={styles.controlsContainer}>
        <button
          onClick={toggleService}
          className={`${styles.controlCircle} ${serviceRunning ? styles.serviceOn : styles.serviceOff}`}
          title={serviceRunning ? 'Service Running' : 'Service Stopped'}
        >
          <span>🚍</span>
        </button>
        <button
          onClick={toggleGPS}
          className={`${styles.controlCircle} ${styles.gpsCircle} ${gpsOn ? styles.gpsOn : styles.gpsOff}`}
          title={gpsOn ? 'GPS On' : 'GPS Off'}
        >
          <span style={{ fontSize: gpsOn ? '32px' : '28px', transition: 'all 0.3s ease' }}>
            📍
          </span>
        </button>
        <button
          onClick={toggleEmergency}
          className={`${styles.controlCircle} ${emergencyMode ? styles.emergencyOn : styles.emergencyOff}`}
          title={emergencyMode ? 'Emergency Active' : 'Emergency Alert'}
        >
          <span>🚨</span>
        </button>
        {location && (
          <div className={styles.showMapContainer}>
            <button className={styles.showMapButton} onClick={() => setShowMap(true)}>
              Show on Map
            </button>
          </div>
        )}
      </div>
      
      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className={styles.notificationsPanel}>
          <h4>🔔 Notifications</h4>
          <div className={styles.notificationsList}>
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`${styles.notification} ${styles[notification.type]}`}
              >
                <span className={styles.notificationMessage}>{notification.message}</span>
                <span className={styles.notificationTime}>
                  {notification.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMap && <MapView location={location} onClose={() => setShowMap(false)} />}
    </div>
  )
}

export default Dashboard
