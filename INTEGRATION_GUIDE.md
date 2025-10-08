# SmartBus - Track Now Integration Guide 🚌

## Overview
इस integration में SmartBus के main application का **"Track Now"** button smartbus-tracker के साथ connected है। जब user bus search करके "Track Now" पर click करता है, तो live tracking map एक नई window में open हो जाती है।

## How It Works

### 1. User Flow:
1. **User Dashboard** में bus search करें (source से destination)
2. Available buses की list में **"Track Now"** button दिखेगा
3. Track Now पर click करने पर:
   - Bus की information localStorage में store हो जाती है
   - smartbus-tracker नई window में खुलता है (http://localhost:3001)
   - Live map पर bus की real-time location show होती है

### 2. Technical Implementation:

#### Main App (UserDashboard.jsx):
```javascript
const handleTrackBus = (bus) => {
  // Store bus data in localStorage
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
  
  // Open tracker in new window
  const trackerUrl = 'http://localhost:3001';
  window.open(trackerUrl, '_blank', 'width=1200,height=800');
};
```

#### Tracker App (App.js):
```javascript
// Load bus data from localStorage
useEffect(() => {
  const storedData = localStorage.getItem('smartbus_tracking_data');
  if (storedData) {
    const trackingData = JSON.parse(storedData);
    setBusData(trackingData);
    
    // Use bus location as starting position
    if (trackingData.currentLocation) {
      setBusPos([trackingData.currentLocation.lat, trackingData.currentLocation.lng]);
    }
  }
}, []);
```

## Features

### 🎯 Main Features:
- **Real-time Bus Tracking** on interactive map
- **Bus Information Display** in header
- **Welcome Popup** showing bus details when tracking starts  
- **Live Distance Calculation** from user location
- **ETA Estimation** based on current position
- **Route Progress** with circular progress indicator
- **Play/Pause Tracking** controls
- **Reset Tracking** functionality

### 📱 UI Components:
- **Interactive Map** using Leaflet and React-Leaflet
- **Bus Markers** with custom icons
- **User Location** marker
- **Route Polyline** showing path
- **Floating Control Buttons**
- **Info Circle** with live stats

## Port Configuration

### Applications run on:
- **Main SmartBus App**: http://localhost:5173 (Vite)
- **Backend API**: http://localhost:8000 (Django)
- **Live Tracker**: http://localhost:3001 (React)

### Start All Applications:
```bash
# Run this command to start all services
start.bat
```

## File Structure

```
SmartBus/
├── frontend/
│   └── src/
│       └── pages/Dashboard/
│           └── UserDashboard.jsx    # Track Now button integration
├── smartbus-tracker/
│   ├── .env                         # PORT=3001 configuration  
│   └── src/
│       ├── App.js                   # Main tracker component
│       └── App.css                  # Tracker styles
├── start.bat                        # Launch all services
└── INTEGRATION_GUIDE.md            # This file
```

## Usage Instructions

### For Users:
1. **Start Application**: Double-click `start.bat`
2. **Search Bus**: Enter source and destination in search bar
3. **Select Bus**: Choose from available buses list
4. **Track Live**: Click "🔴 Track Now" button
5. **View Map**: Live tracking opens in new window
6. **Control Tracking**: Use play/pause/reset buttons

### For Developers:
1. **Main App Development**: `cd frontend && npm run dev`
2. **Tracker Development**: `cd smartbus-tracker && npm start`  
3. **Backend Development**: `cd backend/Smartbus && python manage.py runserver`

## Data Flow

```
UserDashboard → localStorage → smartbus-tracker
     ↓               ↓              ↓
1. Bus Search   2. Store Data   3. Load Data
2. Track Click  2. Open Window  3. Show Map
3. Success      3. Bus Info     3. Live Track
```

## Browser Compatibility

### Supported Browsers:
- ✅ Chrome (recommended)
- ✅ Firefox  
- ✅ Safari
- ✅ Edge

### Required Features:
- localStorage support
- Popup window support
- Geolocation API
- Modern JavaScript (ES6+)

## Troubleshooting

### Common Issues:

#### 1. Popup Blocked:
**Problem**: Browser blocks the tracker window  
**Solution**: Allow popups for localhost or manually open http://localhost:3001

#### 2. Port Already in Use:
**Problem**: Port 3001 is occupied  
**Solution**: Change PORT in smartbus-tracker/.env file

#### 3. No Bus Data:
**Problem**: Tracker shows "No bus data available"  
**Solution**: Click "Track Now" from main app first

#### 4. Location Not Found:
**Problem**: User location not detected  
**Solution**: Allow location access in browser settings

## Future Enhancements

### Planned Features:
- 🔄 **Auto-refresh** tracking data every 30 seconds
- 📱 **Mobile responsive** tracker interface  
- 🔔 **Push notifications** for bus arrival
- 🚏 **Stop-wise tracking** with ETA for each stop
- 📊 **Historical data** and route analytics
- 🌙 **Dark mode** for tracker interface

---

## Quick Start Commands

```bash
# Clone and setup
git clone <repository>
cd SmartBus

# Install dependencies
cd frontend && npm install
cd ../smartbus-tracker && npm install

# Start all services
start.bat
```

**Happy Tracking! 🚌✨**