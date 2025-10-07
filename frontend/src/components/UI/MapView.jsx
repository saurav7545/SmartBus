import React, { useState, useEffect } from 'react';
import styles from './MapView.module.css';

function MapView({ userLocation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showFullMap, setShowFullMap] = useState(false);

  // Handle keyboard events for full map modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showFullMap) {
        setShowFullMap(false);
      }
    };

    if (showFullMap) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showFullMap]);

  // Use userLocation prop or default
  const userPosition = userLocation || { lat: 30.3165, lng: 78.0322 };

  // Set loading state based on user location
  useEffect(() => {
    setIsLoading(!userLocation);
  }, [userLocation]);




  return (
    <div className={styles.container}>
      {/* Background Google Maps */}
      <div className={styles.mapWrapper}>
        <iframe
          title="SmartBus Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${userPosition.lat},${userPosition.lng}&z=13&output=embed`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className={styles.map}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Loading your location...</p>
          </div>
        )}
        
        {/* User Location Marker */}
        <div className={styles.userMarker} style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 15
        }}>
          📍
        </div>
        
        {/* Map controls overlay */}
        <div className={styles.mapControls}>
          {/* View Large Map Button */}
          <button 
            className={styles.fullMapBtn}
            onClick={() => setShowFullMap(true)}
            title="View Large Map"
          >
            🗺️ View Large Map
          </button>
        </div>
      </div>
      
      {/* Full Map Modal */}
      {showFullMap && (
        <div className={styles.fullMapOverlay} onClick={() => setShowFullMap(false)}>
          <div className={styles.fullMapContainer} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.mapCloseButton}
              onClick={() => setShowFullMap(false)}
            >
              ✕ Close
            </button>
            
            {/* Full Size Map */}
            <iframe
              title="SmartBus Full Map View"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${userPosition.lat},${userPosition.lng}&z=13&output=embed`}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            
            {/* Full Map Info Panel */}
            <div className={styles.mapOverlayInfo}>
              <div className={styles.locationCard}>
                <h3>📍 Your Location</h3>
                <p>Latitude: {userPosition.lat.toFixed(6)}</p>
                <p>Longitude: {userPosition.lng.toFixed(6)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;
