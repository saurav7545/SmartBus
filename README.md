# SmartBus

SmartBus is a full-stack bus tracking web page  and operations platform with a Django API, a React passenger and operator web page, and a separate live-tracking demo client.

## Components
- Django API in `backend/Smartbus`
- React web app (passenger and operator UI) in `frontend`
- Live tracking demo client in `smartbus-tracker`

## Highlights
- Route catalog with stops, fares, schedules, and route types
- Intelligent route search with validation and suggestions
- Live tracking APIs for drivers and riders with ETA and delay status
- Favorites, alerts, arrival notifications, and route analytics
- Passenger web UI with map view, route search, and bus discovery
- Operator dashboard with service controls and operational stats (simulated)
- Leaflet-based tracking demo with animated bus movement and progress


## Tech Stack
- Backend: Django 5.x, PyMySQL, django-cors-headers, geopy
- Frontend: React 19, Vite, CSS Modules
- Database: MySQL


## Configuration
- Database settings: `backend/Smartbus/Smartbus/settings.py`
- API base URL: `frontend/src/services/api.js`
- Tracker port: `smartbus-tracker/.env`


## Project Structure
```
SmartBus/
|-- backend/
|   |-- Smartbus/
|       |-- Smartbus/        # Django settings and URLs
|       |-- route/           # Routes, live tracking, favorites, alerts
|       |-- users/           # Auth and registration endpoints
|       |-- manage.py
|-- frontend/                # Vite React app
|-- smartbus-tracker/        # Live tracking demo client
|-- INTEGRATION_GUIDE.md
|-- PROJECT_STATUS.md
```

## Notes
- The frontend currently uses the route search API but simulates bus positions in the UI.
- The tracker client animates movement along a fixed sample route and reads bus info from localStorage.
- The Django API supports real tracking updates and analytics endpoints, but the live UI wiring can be extended.

## License
No license has been specified yet.
