# SmartBus

SmartBus is a full-stack bus tracking and operations platform with a Django API, a React passenger and operator web app, and a separate live-tracking demo client.

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

## Architecture
```
[Frontend (Vite)] --> /api/* --> [Django API] --> [MySQL]
[Tracker (CRA)] reads localStorage set by Frontend
```

## Tech Stack
- Backend: Django 5.x, PyMySQL, django-cors-headers, geopy
- Frontend: React 19, Vite, CSS Modules
- Tracker: React (Create React App), Leaflet
- Database: MySQL

## Quick Start

### Backend (Django API)
1. Create and activate a virtual environment.
2. Install dependencies and run migrations.

```bash
cd backend/Smartbus
python -m venv .venv
# Windows
.\.venv\Scripts\Activate.ps1
# Linux or macOS
source .venv/bin/activate

pip install django django-cors-headers PyMySQL geopy
python manage.py makemigrations
python manage.py migrate
```

3. (Optional) Load sample data.

```bash
python manage.py add_sample_routes --clear
```

4. Start the API server.

```bash
python manage.py runserver
```

### Frontend (Passenger and Operator UI)
```bash
cd frontend
npm install
npm run dev
```

### Live Tracker Demo
```bash
cd smartbus-tracker
npm install
npm start
```

The tracker runs on port 3001 as configured in `smartbus-tracker/.env`.

## Configuration
- Database settings: `backend/Smartbus/Smartbus/settings.py`
- API base URL: `frontend/src/services/api.js`
- Tracker port: `smartbus-tracker/.env`

## Demo Credentials
Fixed demo credentials are defined in `backend/Smartbus/users/views.py`.
- user: `user@smartbus.com` / `user123`
- admin: `admin@smartbus.com` / `admin123`
- driver: `driver@smartbus.com` / `driver123`
- bus: `bus@smartbus.com` / `bus123`

## API Overview
Base URL: `http://localhost:8000/api`

Authentication
- POST `/auth/login/`
- POST `/auth/register/`
- GET `/auth/check/`
- GET `/auth/db-check/`
- GET `/auth/db-info/`

Routes and search
- GET `/routes/`
- GET `/routes/<route_id>/`
- GET `/routes/search/?source=...&destination=...`
- GET `/routes/find-bus/?route_name=...`

Live tracking
- POST `/routes/driver/location/update/`
- POST `/routes/driver/status/update/`
- GET `/routes/live/<bus_number>/`
- GET `/routes/live/route/<route_name>/`
- GET `/routes/tracking/<bus_route_id>/`
- POST `/routes/tracking/update/`

User features
- POST `/routes/favorites/add/`
- GET `/routes/favorites/user/?user_email=...`
- PUT `/routes/favorites/<favorite_id>/update/`
- DELETE `/routes/favorites/<favorite_id>/remove/`
- GET `/routes/alerts/user/?user_email=...`
- POST `/routes/alerts/create/`
- GET `/routes/notifications/arrivals/?user_email=...`
- GET `/routes/analytics/<route_name>/`

Health
- GET `/health/`
- GET `/routes/health/`

## Testing
Backend tests can be run with:
```bash
cd backend/Smartbus
python manage.py test
```

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
