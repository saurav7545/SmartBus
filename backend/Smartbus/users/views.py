from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

# Fixed credentials for login
FIXED_CREDENTIALS = {
    'user': {
        'email': 'user@smartbus.com',
        'password': 'user123',
        'name': 'Demo User'
    },
    'admin': {
        'email': 'admin@smartbus.com', 
        'password': 'admin123',
        'name': 'Admin User'
    },
    'driver': {
        'email': 'driver@smartbus.com',
        'password': 'driver123',
        'name': 'Demo Driver'
    },
    'bus': {
        'email': 'bus@smartbus.com',
        'password': 'bus123',
        'name': 'Bus Operator'
    }
}

# ✅ FIXED_LOGIN FUNCTION - YEH IMPORTANT HAI
@csrf_exempt
def fixed_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            user_type = data.get('userType', 'user')
            
            print(f"Login attempt: {email}, {user_type}")
            
            # Check user type exists
            if user_type not in FIXED_CREDENTIALS:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid user type'
                }, status=400)
            
            credentials = FIXED_CREDENTIALS[user_type]
            
            # Validate credentials against fixed ones
            if (email == credentials['email'] and password == credentials['password']):
                return JsonResponse({
                    'success': True,
                    'message': 'Login successful',
                    'user_type': user_type,
                    'name': credentials['name'],
                    'email': email
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid email or password'
                }, status=401)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Server error: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'message': 'Method not allowed'
    }, status=405)

# ✅ CHECK_API FUNCTION
@csrf_exempt
def check_api(request):
    return JsonResponse({
        'message': 'Django API is working!',
        'status': 'success'
    })

# ✅ CHECK_DATABASE FUNCTION
@csrf_exempt
def check_database(request):
    try:
        # Database connection test
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        
        return JsonResponse({
            'success': True,
            'message': 'Database connection successful',
            'test_result': result[0]
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Database error: {str(e)}'
        }, status=500)

# ✅ DATABASE_INFO FUNCTION
@csrf_exempt
def database_info(request):
    try:
        with connection.cursor() as cursor:
            # Current database ka naam
            cursor.execute("SELECT DATABASE()")
            db_name = cursor.fetchone()[0]
            
            # Tables ki list
            cursor.execute("SHOW TABLES")
            tables = [table[0] for table in cursor.fetchall()]
            
        return JsonResponse({
            'database_name': db_name,
            'tables': tables,
            'tables_count': len(tables)
        })
        
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)