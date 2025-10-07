import React, { useState, useMemo } from 'react'
import styles from './dashboard.module.css'

const AccountCircle = ({ driverName, onClick }) => (
  <div className={styles.accountCircle} onClick={onClick} title="Account">
    <span className={styles.accountLetter}>{driverName ? driverName.charAt(0).toUpperCase() : 'A'}</span>
  </div>
);

const Sidebar = ({ busInfo, onLogout, onClose }) => (
  <aside className={styles.sidebar}>
    <AccountCircle driverName={busInfo.driverName} onClick={onClose} />
    <hr className={styles.sidebarLine} />
    <h2 className={styles.sidebarTitle}>Account Details</h2>
    <p><strong>Bus Name:</strong> {busInfo.busName || 'N/A'}</p>
    <p><strong>Driver Name:</strong> {busInfo.driverName || 'N/A'}</p>
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleGPS = () => {
    // If turning GPS on
    if (!gpsOn) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsOn(true);
        },
        (err) => {
          console.error('GPS error:', err);
        }
      );
    // If turning GPS off
    } else {
      setGpsOn(false);
      setLocation(null);
      setShowMap(false);
    }
  };

  const toggleService = () => {
    setServiceRunning(!serviceRunning);
  };

  return (
    <div className={styles.container}>
      {/* Account Circle */}
      <AccountCircle driverName={busInfo.driverName} onClick={toggleSidebar} />

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
            </div>
            <div className={styles.driverInfoBox}>
              <h2 className={styles.boxTitle}>Operator Information</h2>
              <p><strong>Operator Name:</strong> {busInfo.name || 'N/A'}</p>
            </div>
          </div>
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
          <span>📍</span>
        </button>
        {location && (
          <div className={styles.showMapContainer}>
            <button className={styles.showMapButton} onClick={() => setShowMap(true)}>
              Show on Map
            </button>
          </div>
        )}
      </div>

      {showMap && <MapView location={location} onClose={() => setShowMap(false)} />}
    </div>
  )
}

export default Dashboard
