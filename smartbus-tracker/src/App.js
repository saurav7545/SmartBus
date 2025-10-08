import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

// 🚌 Bus Icon - use project logo image from public/
const getBusIcon = (isMoving) => {
  // Use a regular image icon so it displays the logo in the map marker
  return L.icon({
    // change to image.png as requested — place your image at public/image.png
    iconUrl: '/image.png',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -18],
    className: isMoving ? 'custom-bus-marker moving' : 'custom-bus-marker'
  });
};

// 📍 User Icon
const userIcon = L.divIcon({
  html: `<div class="user-marker"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: "custom-user-marker",
});

// 🗺️ Route Coordinates
const routeCoords = [
  [30.3165, 78.0322],
  [29.8661, 77.8945],
  [29.4727, 77.7085],
  [29.2100, 77.0400],
  [28.6139, 77.2090],
];

// Map auto-move helper
function MoveMapToBus({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true, duration: 0.8 });
  }, [position, map]);
  return null;
}

// When tracking starts, slightly zoom/focus the map to include both bus and user
function StartZoom({ tracking, busPos, userPos }) {
  const map = useMap();
  useEffect(() => {
    if (!tracking) return;

    // If we have both positions, fit bounds so both are visible with padding
    if (userPos) {
      try {
        const bounds = L.latLngBounds([busPos, userPos]);
        map.fitBounds(bounds, { padding: [120, 120], maxZoom: 16, animate: true });
      } catch (e) {
        // fallback: just set view to bus
        map.setView(busPos, Math.min(16, Math.max(12, map.getZoom())), { animate: true });
      }
    } else {
      // No user position yet — zoom a bit closer to the bus
      map.setView(busPos, Math.min(13, Math.max(10, map.getZoom())), { animate: true });
    }
  }, [tracking, busPos, userPos, map]);

  return null;
}

function App() {
  const [busPos, setBusPos] = useState(routeCoords[0]);
  const [userPos, setUserPos] = useState(null);
  const [distance, setDistance] = useState("0.0");
  const [eta, setEta] = useState("-- min");
  const [progress, setProgress] = useState(0);
  const indexRef = useRef(0);
  const [tracking, setTracking] = useState(false);
  const intervalRef = useRef(null);
  const [busData, setBusData] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Load bus data from localStorage (from SmartBus main app)
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('smartbus_tracking_data');
      if (storedData) {
        const trackingData = JSON.parse(storedData);
        setBusData(trackingData);
        setIsDataLoaded(true);
        
        // If bus has current location, use it as starting position
        if (trackingData.currentLocation) {
          setBusPos([trackingData.currentLocation.lat, trackingData.currentLocation.lng]);
        }
        
        console.log('📍 Bus tracking data loaded:', trackingData);
        
        // Show welcome popup for 3 seconds
        setShowWelcome(true);
        setTimeout(() => {
          setShowWelcome(false);
        }, 3000);
        
      } else {
        console.log('⚠️ No bus tracking data found in localStorage');
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error('Error loading bus tracking data:', error);
    }
  }, []);

  // User location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setUserPos([28.6139, 77.2090])
    );
  }, []);

  // Distance calc
  const calcDist = (a, b) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
  };

  // Distance + ETA
  useEffect(() => {
    if (userPos) {
      const d = calcDist(userPos, busPos);
      setDistance(d.toFixed(1));
      setEta(Math.round(d / 0.7) + " min");
    }
  }, [busPos, userPos]);

  // Start
  const startTracking = useCallback(() => {
    setTracking(true);
    intervalRef.current = setInterval(() => {
      const next = indexRef.current + 1;
      if (next < routeCoords.length) {
        indexRef.current = next;
        setBusPos(routeCoords[next]);
        setProgress((next / (routeCoords.length - 1)) * 100);
      } else {
        clearInterval(intervalRef.current);
        setTracking(false);
      }
    }, 3000);
  }, []);

  // Stop
  const stopTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTracking(false);
  };

  // Reset
  const resetTracking = () => {
    stopTracking();
    indexRef.current = 0;
    setBusPos(routeCoords[0]);
    setProgress(0);
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <h2>🟧 Live Bus Tracking</h2>
          {busData && (
            <div className="bus-header-info">
              <div className="bus-title">
                <strong>🚌 {busData.busName || 'Bus Service'}</strong>
                <span className="bus-number">({busData.busNumber || 'N/A'})</span>
              </div>
              <div className="route-info">
                <strong>Route:</strong> {busData.route || 'Unknown Route'}
              </div>
              {busData.distance && (
                <div className="live-stats">
                  <span>📏 {busData.distance} km away</span>
                  {busData.eta && <span> • ⏱️ ETA: {busData.eta} mins</span>}
                </div>
              )}
            </div>
          )}
          {!busData && isDataLoaded && (
            <div className="no-bus-info">
              <em>⚠️ No bus data available. Please start tracking from SmartBus app.</em>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={busPos}
        zoom={7}
        style={{ height: "100vh", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={routeCoords} color="#f39c12" weight={4} opacity={0.7} />
        <Marker position={busPos} icon={getBusIcon(tracking)}>
          <Popup>🚌 Live Bus Position</Popup>
        </Marker>
        {userPos && <Marker position={userPos} icon={userIcon}><Popup>📍 You</Popup></Marker>}
        <MoveMapToBus position={busPos} />
        <StartZoom tracking={tracking} busPos={busPos} userPos={userPos} />
      </MapContainer>

      {/* Floating Circle Info */}
      <div className="info-circle">
        <div className="circle-progress" style={{ background: `conic-gradient(#f39c12 ${progress * 3.6}deg, #ddd 0deg)` }}>
          <div className="circle-inner">
            <div className="circle-item">📍 {distance} km</div>
            <div className="circle-item">⏱ {eta}</div>
            <div className="circle-item">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>

      {/* Floating Buttons */}
      <div className="buttons">
        <button className="fab start" onClick={tracking ? stopTracking : startTracking}>
          {tracking ? "⏸" : "▶️"}
        </button>
        <button className="fab reset" onClick={resetTracking}>🔄</button>
      </div>
      
      {/* Welcome Popup */}
      {showWelcome && busData && (
        <div className="welcome-popup">
          <div className="welcome-content">
            <div className="welcome-icon">🚌</div>
            <h3>Bus Tracking Started!</h3>
            <p><strong>{busData.busName}</strong> ({busData.busNumber})</p>
            <p>{busData.route}</p>
            <div className="welcome-stats">
              {busData.distance && <span>📏 {busData.distance} km away</span>}
              {busData.eta && <span> • ⏱️ {busData.eta} mins</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
