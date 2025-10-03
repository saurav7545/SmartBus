from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json
import hashlib
import uuid

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

# ✅ REGISTRATION FUNCTION
@csrf_exempt
def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Extract form data
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '').strip()
            user_type = data.get('userType', 'bus')
            bus_name = data.get('busName', '').strip()
            bus_number = data.get('busNumber', '').strip()
            route_from = data.get('routeFrom', '').strip()
            route_to = data.get('routeTo', '').strip()
            travel_agency = data.get('travelAgency', '').strip()
            phone_number = data.get('phoneNumber', '').strip()
            license_number = data.get('licenseNumber', '').strip()
            
            # Validation
            if not all([name, email, password, bus_name, bus_number, route_from, route_to, travel_agency, phone_number, license_number]):
                return JsonResponse({
                    'success': False,
                    'message': 'All fields are required'
                }, status=400)
            
            # Email validation
            if '@' not in email or '.' not in email:
                return JsonResponse({
                    'success': False,
                    'message': 'Please enter a valid email address'
                }, status=400)
            
            # Password validation
            if len(password) < 6:
                return JsonResponse({
                    'success': False,
                    'message': 'Password must be at least 6 characters long'
                }, status=400)
            
            # Phone validation
            if not phone_number.isdigit() or len(phone_number) != 10:
                return JsonResponse({
                    'success': False,
                    'message': 'Please enter a valid 10-digit phone number'
                }, status=400)
            
            # Check if email already exists
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM users WHERE email = %s", [email])
                if cursor.fetchone()[0] > 0:
                    return JsonResponse({
                        'success': False,
                        'message': 'Email already registered'
                    }, status=400)
                
                # Create user record
                user_id = str(uuid.uuid4())
                hashed_password = hashlib.sha256(password.encode()).hexdigest()
                
                cursor.execute("""
                    INSERT INTO users (id, name, email, password, user_type, phone_number, license_number, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                """, [user_id, name, email, hashed_password, user_type, phone_number, license_number])
                
                # Create bus record
                bus_id = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO buses (id, user_id, bus_name, bus_number, route_from, route_to, travel_agency, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                """, [bus_id, user_id, bus_name, bus_number, route_from, route_to, travel_agency])
                
                connection.commit()
                
                print(f"Registration successful: {email}, {name}, {bus_name}")
                
                return JsonResponse({
                    'success': True,
                    'message': 'Registration successful',
                    'user_id': user_id,
                    'bus_id': bus_id,
                    'name': name,
                    'email': email,
                    'bus_name': bus_name,
                    'bus_number': bus_number,
                    'route': f"{route_from} → {route_to}"
                })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': f'Registration failed: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'message': 'Method not allowed'
    }, status=405)