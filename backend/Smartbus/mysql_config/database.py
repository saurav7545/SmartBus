# database.py - MySQL configurations
import pymysql
pymysql.install_as_MySQLdb()

def get_db_config():
    return {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'smartbus',
        'USER': 'bususer',
        'PASSWORD': 'buspassword123',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        }
    }

# Fixed credentials for login
FIXED_CREDENTIALS = {
    'user': {
        'email': 'user@busgo.com',
        'password': 'user123',
        'name': 'Demo User'
    },
    'admin': {
        'email': 'admin@busgo.com', 
        'password': 'admin123',
        'name': 'Admin User'
    },
    'driver': {
        'email': 'driver@busgo.com',
        'password': 'driver123',
        'name': 'Demo Driver'
    }
}