# SmartBus Backend

This is the Django backend for the SmartBus application.

## Setup Instructions

### 1. Create Virtual Environment
```bash
cd backend
python -m venv bus
```

### 2. Activate Virtual Environment

**Windows:**
```bash
bus\Scripts\activate
```

**Linux/Mac:**
```bash
source bus/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r bus/requirements.txt
```

### 4. Database Setup
- Configure your database settings in `Smartbus/Smartbus/settings.py`
- Run migrations:
```bash
cd Smartbus
python manage.py makemigrations
python manage.py migrate
```

### 5. Run Development Server
```bash
python manage.py runserver
```

## Project Structure
```
backend/
├── bus/                    # Virtual environment (excluded from git)
├── Smartbus/              # Django project
│   ├── bus/               # Bus app
│   ├── mysql_config/      # Database configuration
│   ├── notifications/     # Notifications app
│   ├── users/             # Users app
│   └── Smartbus/          # Main project settings
└── requirements.txt       # Python dependencies
```

## Dependencies
- Django 5.2.6
- mysqlclient 2.2.7
- PyMySQL 1.1.2
- sqlparse 0.5.3
- tzdata 2025.2
- asgiref 3.9.2
