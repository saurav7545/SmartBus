# SmartBus Backend

This is the Django backend for the SmartBus application.

## Quick Setup (Virtual Environment Already Included)

### 1. Activate Virtual Environment

**Windows:**
```bash
cd backend
bus\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
source bus/bin/activate
```

### 2. Database Setup
- Configure your database settings in `Smartbus/Smartbus/settings.py`
- Run migrations:
```bash
cd Smartbus
python manage.py makemigrations
python manage.py migrate
```

### 3. Run Development Server
```bash
python manage.py runserver
```

## Alternative Setup (If Virtual Environment Issues)

If you face issues with the included virtual environment, you can create a new one:

### 1. Create New Virtual Environment
```bash
cd backend
python -m venv bus_new
```

### 2. Activate and Install Dependencies
```bash
# Windows
bus_new\Scripts\activate

# Linux/Mac
source bus_new/bin/activate

# Install dependencies
pip install -r bus/requirements.txt
```

## Project Structure
```
backend/
├── bus/                    # Virtual environment (included in git)
│   ├── Scripts/           # Activation scripts
│   ├── Lib/               # Installed packages
│   ├── Include/           # Headers
│   ├── pyvenv.cfg         # Virtual environment config
│   └── requirements.txt   # Python dependencies
├── Smartbus/              # Django project
│   ├── bus/               # Bus app
│   ├── mysql_config/      # Database configuration
│   ├── notifications/     # Notifications app
│   ├── users/             # Users app
│   └── Smartbus/          # Main project settings
└── README.md              # This file
```

## Dependencies
- Django 5.2.6
- mysqlclient 2.2.7
- PyMySQL 1.1.2
- sqlparse 0.5.3
- tzdata 2025.2
- asgiref 3.9.2
