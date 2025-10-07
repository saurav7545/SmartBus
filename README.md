# SmartBus - Professional Bus Tracking & Management System

> A comprehensive real-time bus tracking and management system inspired by Indian Railways' FindMyTrain app, designed for modern public transportation needs.

![SmartBus](https://img.shields.io/badge/SmartBus-v2.0-blue.svg)
![Django](https://img.shields.io/badge/Django-4.x-green.svg)
![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🚌 Overview

SmartBus is a modern, feature-rich bus tracking and management system that provides real-time location tracking, route management, and passenger convenience features. Built with Django REST Framework, it offers a comprehensive API ecosystem for mobile apps and web interfaces.

## ✨ Key Features

### For Passengers
- 🔍 **Intelligent Route Search**: Find buses with fuzzy matching and smart suggestions
- 📍 **Real-Time Live Tracking**: Track bus locations with GPS precision
- ⏰ **ETA Calculations**: Accurate arrival time predictions
- ❤️ **Favorite Routes**: Save frequently used routes
- 🔔 **Smart Notifications**: Bus arrival alerts and service updates
- 📊 **Route Analytics**: Peak time analysis and delay statistics
- 🎯 **Location-Based Search**: Find nearby buses and stops

### For Drivers
- 📱 **Driver Mobile API**: Real-time GPS location updates
- 🚦 **Status Management**: Update bus status (active, delayed, breakdown, etc.)
- 🛣️ **Route Progress**: Track current stop and route completion
- 📋 **Trip Management**: Start/end trips with automatic logging

### For Administrators
- 🖥️ **Advanced Admin Panel**: Comprehensive bus and route management
- 📈 **Analytics Dashboard**: Performance metrics and usage statistics
- ⚠️ **Alert System**: Manage system-wide notifications
- 🗺️ **Route Management**: Create and modify bus routes and stops
- 👥 **Operator Management**: Handle multiple bus operators
- 🔧 **System Monitoring**: Track API performance and usage

## 🏗️ System Architecture

```
SmartBus/
├── backend/Smartbus/          # Django Backend
│   ├── Smartbus/             # Main project configuration
│   ├── route/                # Route management app
│   │   ├── models.py         # Route, Stop, BusRoute models
│   │   ├── views.py          # Route search and validation APIs
│   │   ├── live_tracking_views.py  # Live tracking APIs
│   │   ├── user_features_views.py  # User feature APIs
│   │   └── admin.py          # Enhanced admin interfaces
│   ├── bus/                  # Bus management app
│   │   ├── models.py         # Bus, BusStatus, tracking models
│   │   └── views.py          # Bus-related APIs
│   └── manage.py             # Django management
├── test_smartbus_complete.py # Comprehensive API testing
├── sample_data_generator.py  # Generate test data
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Django 4.x
- Django REST Framework
- SQLite (default) or PostgreSQL/MySQL

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SmartBus.git
   cd SmartBus
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv smartbus_env
   # On Windows
   smartbus_env\Scripts\activate
   # On Linux/Mac
   source smartbus_env/bin/activate
   ```

3. **Install dependencies**
   ```bash
   cd backend/Smartbus
   pip install django djangorestframework django-cors-headers
   ```

4. **Database setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Load sample data**
   ```bash
   python manage.py generate_sample_routes
   ```

6. **Run the server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - API Base URL: `http://localhost:8000/api/`
   - Admin Panel: `http://localhost:8000/admin/`

## 📚 API Documentation

### Core Endpoints

#### Route Management
```http
GET /api/route/search/?from={source}&to={destination}
# Search routes between locations

GET /api/route/validate/?from={source}&to={destination}
# Validate and suggest route corrections

GET /api/routes/
# List all available routes
```

#### Live Tracking (Driver APIs)
```http
POST /api/driver/update-location/
# Update bus GPS location
{
    "bus_id": 1,
    "driver_id": 1,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "speed": 45.5
}

POST /api/driver/update-status/
# Update bus status
{
    "bus_id": 1,
    "driver_id": 1,
    "status": "active"
}
```

#### User Features
```http
GET /api/live-location/{bus_id}/
# Get real-time bus location

POST /api/favorites/
# Add route to favorites
{
    "route_id": 1
}

GET /api/analytics/route/{route_id}/
# Get route analytics and statistics

POST /api/alerts/
# Create user alert
{
    "bus_route_id": 1,
    "alert_type": "arrival",
    "stop_name": "Central Station"
}
```

### Sample API Responses

**Route Search Response:**
```json
{
    "status": "success",
    "routes": [
        {
            "id": 1,
            "name": "Route 101",
            "from_location": "Central Station",
            "to_location": "Airport Terminal",
            "distance": 25.5,
            "duration": "45 mins",
            "buses": [
                {
                    "bus_number": "DL01AB1234",
                    "operator": "Delhi Transport Corp",
                    "next_arrival": "5 mins"
                }
            ]
        }
    ],
    "suggestions": []
}
```

**Live Location Response:**
```json
{
    "status": "success",
    "data": {
        "bus_id": 1,
        "bus_number": "DL01AB1234",
        "current_location": {
            "latitude": 28.6139,
            "longitude": 77.2090,
            "address": "Connaught Place, New Delhi"
        },
        "status": "active",
        "eta": "12 mins",
        "distance_to_user": 2.3,
        "next_stops": [
            "India Gate",
            "Red Fort",
            "Chandni Chowk"
        ]
    }
}
```

## 🧪 Testing

### Run Comprehensive Tests
```bash
python test_smartbus_complete.py
```

The test suite covers:
- ✅ Route search and validation
- ✅ Live tracking functionality
- ✅ Driver APIs
- ✅ User features (favorites, alerts)
- ✅ Analytics and statistics
- ✅ Error handling
- ✅ Performance testing
- ✅ Load testing with concurrent requests

### Manual Testing
1. **Admin Panel**: Access `/admin/` to manage routes, buses, and view analytics
2. **API Browser**: Use `/api/` to interact with REST endpoints
3. **Route Search**: Test with various source-destination combinations
4. **Live Tracking**: Simulate driver location updates

## 🛠️ Technology Stack

### Backend
- **Django 4.x**: Web framework and ORM
- **Django REST Framework**: API development
- **SQLite/PostgreSQL**: Database options
- **Django CORS Headers**: Cross-origin support

### Key Python Libraries
- **datetime**: Time handling and calculations
- **math**: Geographical distance calculations
- **threading**: Concurrent testing support
- **requests**: HTTP client for API testing

### Planned Integrations
- **Google Maps API**: Route visualization and real ETA
- **WebSocket**: Real-time notifications
- **Redis**: Caching and session management
- **Celery**: Background task processing

## 📊 Sample Data

The system includes rich sample data:
- **50+ Routes**: Covering major Indian cities
- **Multiple Operators**: Various transport corporations
- **Realistic Schedules**: Peak and off-peak timings
- **GPS Coordinates**: Accurate location data

### Sample Routes Include:
- Delhi Metro Feeder Routes
- Mumbai Local Bus Services
- Bangalore City Bus Routes
- Chennai MTC Routes
- Inter-city Highway Routes

## 📱 Mobile Integration

### Android/iOS Integration
```java
// Android Example
String apiUrl = "http://your-server.com/api/live-location/1/";
// Make HTTP request and parse JSON response
```

```swift
// iOS Example
let apiUrl = "http://your-server.com/api/live-location/1/"
// Use URLSession to fetch data
```

### React Native Integration
```javascript
// React Native Example
const trackBus = async (busId) => {
  const response = await fetch(`${API_BASE}/live-location/${busId}/`);
  const data = await response.json();
  return data;
};
```

## 🔐 Security Features

- **API Key Authentication**: Secure API access
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all user inputs
- **CORS Configuration**: Secure cross-origin requests
- **Admin Access Control**: Role-based permissions

## 🗺️ Roadmap

### Phase 1: ✅ Completed
- [x] Route management system
- [x] Live tracking APIs
- [x] User features (favorites, alerts)
- [x] Advanced admin panel
- [x] Comprehensive testing suite

### Phase 2: 🚧 In Progress
- [ ] Google Maps integration
- [ ] Professional UI/UX interface
- [ ] WebSocket real-time updates
- [ ] Mobile app development

### Phase 3: 📋 Planned
- [ ] Payment integration
- [ ] Seat reservation system
- [ ] Multi-language support
- [ ] Offline capabilities
- [ ] Advanced analytics dashboard

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- Follow PEP 8 for Python code
- Write comprehensive tests
- Update documentation
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team & Support

### Core Team
- **Backend Development**: Django REST API
- **Frontend Development**: React/React Native
- **Mobile Development**: Android/iOS
- **DevOps**: Deployment and scaling

### Support
- 📧 Email: support@smartbus.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/SmartBus/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/SmartBus/discussions)
- 📖 Documentation: [Wiki](https://github.com/yourusername/SmartBus/wiki)

## 🌟 Acknowledgments

- Inspired by Indian Railways' FindMyTrain app
- Thanks to Django and DRF communities
- Special thanks to public transport authorities for route data inspiration

---

**Made with ❤️ for better public transportation**

*SmartBus - Making bus travel smarter, one route at a time.*