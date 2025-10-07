"""
SmartBus Live Tracking API Views
Professional-grade real-time bus tracking system like FindMyTrain
"""

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.db import transaction
from datetime import datetime, timedelta
import json
import logging
import math
from geopy.distance import geodesic

from .models import (
    Route, RouteStop, BusRoute, LiveRouteTracking, 
    BusStatus, FavoriteRoute, BusAlert
)
from users.models import Bus

logger = logging.getLogger(__name__)

# ====== DRIVER MOBILE APP APIs ======

@csrf_exempt
@require_http_methods(["POST"])
def driver_update_location(request):
    """
    Driver Mobile App: Update bus location in real-time
    Professional GPS tracking with automatic ETA calculation
    """
    try:
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['bus_number', 'latitude', 'longitude']
        for field in required_fields:
            if field not in data or data[field] is None:
                return JsonResponse({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }, status=400)
        
        # Get bus and active route
        bus = get_object_or_404(Bus, bus_number=data['bus_number'])
        active_bus_route = bus.assigned_routes.filter(is_operational=True).first()
        
        if not active_bus_route:
            return JsonResponse({
                'success': False,
                'error': f'No active route found for bus {data["bus_number"]}'
            }, status=404)
        
        # Extract GPS data
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        speed = float(data.get('speed', 0))
        bearing = float(data.get('bearing', 0))
        accuracy = float(data.get('accuracy', 0))
        altitude = float(data.get('altitude', 0))
        
        # Calculate movement and progress
        current_location = (latitude, longitude)
        is_moving = speed > 5  # Moving if speed > 5 km/h
        
        # Get or create live tracking record
        with transaction.atomic():
            tracking, created = LiveRouteTracking.objects.get_or_create(
                bus_route=active_bus_route,
                defaults={
                    'current_latitude': latitude,
                    'current_longitude': longitude,
                    'current_speed': speed,
                    'is_active': True,
                    'trip_start_time': timezone.now() if is_moving else None
                }
            )
            
            # Update tracking data
            old_location = (tracking.current_latitude, tracking.current_longitude)
            tracking.current_latitude = latitude
            tracking.current_longitude = longitude
            tracking.current_speed = speed
            tracking.bearing = bearing
            tracking.accuracy = accuracy
            tracking.altitude = altitude
            tracking.is_moving = is_moving
            tracking.engine_status = data.get('engine_on', True)
            tracking.last_updated = timezone.now()
            
            if is_moving:
                tracking.last_movement = timezone.now()
                if not tracking.trip_start_time:
                    tracking.trip_start_time = timezone.now()
            
            # Calculate distance and progress
            if not created:
                distance_moved = geodesic(old_location, current_location).kilometers
                tracking.distance_covered += distance_moved
                
                # Update average speed
                if tracking.trip_start_time:
                    trip_duration_hours = (timezone.now() - tracking.trip_start_time).total_seconds() / 3600
                    if trip_duration_hours > 0:
                        tracking.average_speed = tracking.distance_covered / trip_duration_hours
            
            # Find nearest stop and calculate progress
            route_stops = active_bus_route.route.stops.all().order_by('stop_sequence')
            nearest_stop = None
            min_distance = float('inf')
            
            for stop in route_stops:
                if stop.latitude and stop.longitude:
                    stop_location = (stop.latitude, stop.longitude)
                    distance = geodesic(current_location, stop_location).kilometers
                    if distance < min_distance:
                        min_distance = distance
                        nearest_stop = stop
            
            if nearest_stop:
                tracking.current_stop = nearest_stop
                # Calculate route progress percentage
                total_stops = route_stops.count()
                if total_stops > 0:
                    tracking.route_progress_percent = (nearest_stop.stop_sequence / total_stops) * 100
                
                # Find next stop
                next_stop = route_stops.filter(
                    stop_sequence__gt=nearest_stop.stop_sequence
                ).first()
                if next_stop:
                    tracking.next_stop = next_stop
                    
                    # Calculate ETA to next stop
                    if next_stop.latitude and next_stop.longitude:
                        next_stop_location = (next_stop.latitude, next_stop.longitude)
                        distance_to_next = geodesic(current_location, next_stop_location).kilometers
                        tracking.distance_remaining = distance_to_next
                        
                        # ETA calculation based on current speed
                        if speed > 0:
                            eta_hours = distance_to_next / speed
                            tracking.estimated_arrival_next_stop = timezone.now() + timedelta(hours=eta_hours)
            
            # Calculate delay
            if active_bus_route.departure_time:
                scheduled_time = datetime.combine(timezone.now().date(), active_bus_route.departure_time)
                scheduled_time = timezone.make_aware(scheduled_time)
                current_delay = (timezone.now() - scheduled_time).total_seconds() / 60
                tracking.delay_minutes = int(current_delay)
                tracking.is_delayed = current_delay > 5
            
            # Update traffic condition based on speed
            if speed < 10:
                tracking.traffic_condition = 'heavy'
            elif speed < 20:
                tracking.traffic_condition = 'moderate'
            else:
                tracking.traffic_condition = 'light'
            
            tracking.save()
            
            # Update bus status
            bus_status, _ = BusStatus.objects.get_or_create(
                bus=bus,
                defaults={'current_status': 'active'}
            )
            
            if is_moving:
                bus_status.current_status = 'active'
            else:
                bus_status.current_status = 'idle'
            
            bus_status.driver_name = data.get('driver_name', bus_status.driver_name)
            bus_status.driver_phone = data.get('driver_phone', bus_status.driver_phone)
            bus_status.passenger_count = data.get('passenger_count', bus_status.passenger_count)
            bus_status.fuel_level = data.get('fuel_level', bus_status.fuel_level)
            bus_status.save()
            
            # Create delay alert if needed
            if tracking.is_delayed and tracking.delay_minutes > 10:
                create_delay_alert(active_bus_route, tracking.delay_minutes)
        
        # Response data
        response_data = {
            'success': True,
            'message': 'Location updated successfully',
            'tracking_data': {
                'bus_number': bus.bus_number,
                'route_name': active_bus_route.route.route_name,
                'current_location': {
                    'latitude': tracking.current_latitude,
                    'longitude': tracking.current_longitude
                },
                'current_stop': tracking.current_stop.stop_name if tracking.current_stop else 'En Route',
                'next_stop': tracking.next_stop.stop_name if tracking.next_stop else 'Destination',
                'speed': tracking.current_speed,
                'progress_percent': tracking.route_progress_percent,
                'eta_next_stop': tracking.eta_display,
                'delay_minutes': tracking.delay_minutes,
                'delay_status': tracking.delay_status,
                'is_moving': tracking.is_moving,
                'last_updated': tracking.last_updated.isoformat()
            }
        }
        
        return JsonResponse(response_data)
        
    except Bus.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': f'Bus {data.get("bus_number", "unknown")} not found'
        }, status=404)
    
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    
    except Exception as e:
        logger.error(f"Driver location update error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to update location'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def driver_update_status(request):
    """
    Driver Mobile App: Update bus operational status
    """
    try:
        data = json.loads(request.body)
        
        bus_number = data.get('bus_number')
        new_status = data.get('status')  # active, idle, breakdown, maintenance
        
        if not bus_number or not new_status:
            return JsonResponse({
                'success': False,
                'error': 'Missing bus_number or status'
            }, status=400)
        
        bus = get_object_or_404(Bus, bus_number=bus_number)
        bus_status, _ = BusStatus.objects.get_or_create(bus=bus)
        
        old_status = bus_status.current_status
        bus_status.current_status = new_status
        
        # Update additional info if provided
        if 'passenger_count' in data:
            bus_status.passenger_count = data['passenger_count']
        if 'fuel_level' in data:
            bus_status.fuel_level = data['fuel_level']
        
        bus_status.save()
        
        # Create alert for critical status changes
        if new_status in ['breakdown', 'maintenance'] and old_status != new_status:
            create_status_alert(bus, new_status)
        
        return JsonResponse({
            'success': True,
            'message': f'Bus status updated to {new_status}',
            'bus_status': {
                'bus_number': bus.bus_number,
                'status': bus_status.current_status,
                'passenger_count': bus_status.passenger_count,
                'fuel_level': bus_status.fuel_level,
                'driver_name': bus_status.driver_name
            }
        })
        
    except Exception as e:
        logger.error(f"Driver status update error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to update status'
        }, status=500)


# ====== USER LIVE TRACKING APIs ======

@require_http_methods(["GET"])
def get_live_bus_location(request, bus_number):
    """
    User App: Get real-time bus location and details
    Professional tracking like FindMyTrain
    """
    try:
        bus = get_object_or_404(Bus, bus_number=bus_number)
        
        # Get active tracking data
        active_route = bus.assigned_routes.filter(is_operational=True).first()
        if not active_route:
            return JsonResponse({
                'success': False,
                'error': f'Bus {bus_number} is not currently operational'
            }, status=404)
        
        tracking = LiveRouteTracking.objects.filter(
            bus_route=active_route,
            is_active=True
        ).order_by('-last_updated').first()
        
        if not tracking:
            return JsonResponse({
                'success': False,
                'error': f'No live tracking data available for bus {bus_number}'
            }, status=404)
        
        # Get bus status
        bus_status = getattr(bus, 'status', None)
        
        # Build response
        response_data = {
            'success': True,
            'bus_info': {
                'bus_number': bus.bus_number,
                'bus_name': bus.bus_name,
                'operator': bus.user.name,
                'route_name': active_route.route.route_name,
                'route_type': active_route.route.route_type,
                'source': active_route.route.source,
                'destination': active_route.route.destination
            },
            'live_location': {
                'latitude': tracking.current_latitude,
                'longitude': tracking.current_longitude,
                'accuracy': tracking.accuracy,
                'last_updated': tracking.last_updated.isoformat(),
                'location_display': tracking.current_location_display
            },
            'movement_data': {
                'current_speed': tracking.current_speed,
                'average_speed': tracking.average_speed,
                'bearing': tracking.bearing,
                'is_moving': tracking.is_moving,
                'direction': tracking.get_direction_display()
            },
            'route_progress': {
                'current_stop': tracking.current_stop.stop_name if tracking.current_stop else None,
                'next_stop': tracking.next_stop.stop_name if tracking.next_stop else None,
                'progress_percent': tracking.route_progress_percent,
                'distance_covered': tracking.distance_covered,
                'distance_remaining': tracking.distance_remaining
            },
            'timing_info': {
                'scheduled_departure': active_route.departure_time.strftime('%H:%M'),
                'scheduled_arrival': active_route.arrival_time.strftime('%H:%M'),
                'estimated_arrival': tracking.eta_display,
                'delay_minutes': tracking.delay_minutes,
                'delay_status': tracking.delay_status,
                'is_delayed': tracking.is_delayed
            },
            'bus_status': {
                'operational_status': bus_status.current_status if bus_status else 'unknown',
                'passenger_count': bus_status.passenger_count if bus_status else 0,
                'max_capacity': bus_status.max_capacity if bus_status else 50,
                'fuel_level': bus_status.fuel_level if bus_status else 100,
                'driver_name': bus_status.driver_name if bus_status else 'N/A'
            },
            'conditions': {
                'traffic': tracking.get_traffic_condition_display() if tracking.traffic_condition else 'Unknown',
                'weather': tracking.weather_condition or 'Clear'
            }
        }
        
        return JsonResponse(response_data)
        
    except Bus.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': f'Bus {bus_number} not found'
        }, status=404)
    
    except Exception as e:
        logger.error(f"Get live location error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to fetch live location'
        }, status=500)


@require_http_methods(["GET"])
def get_route_live_overview(request, route_name):
    """
    User App: Get live overview of all buses on a route
    Similar to train tracking on multiple sections
    """
    try:
        route = get_object_or_404(Route, route_name__iexact=route_name, is_active=True)
        
        # Get all active buses on this route
        active_bus_routes = route.assigned_buses.filter(is_operational=True)
        
        buses_data = []
        for bus_route in active_bus_routes:
            tracking = LiveRouteTracking.objects.filter(
                bus_route=bus_route,
                is_active=True
            ).order_by('-last_updated').first()
            
            if tracking:
                bus_status = getattr(bus_route.bus, 'status', None)
                
                bus_data = {
                    'bus_number': bus_route.bus.bus_number,
                    'bus_name': bus_route.bus.bus_name,
                    'current_location': {
                        'latitude': tracking.current_latitude,
                        'longitude': tracking.current_longitude
                    },
                    'current_stop': tracking.current_stop.stop_name if tracking.current_stop else 'En Route',
                    'next_stop': tracking.next_stop.stop_name if tracking.next_stop else 'Destination',
                    'progress_percent': tracking.route_progress_percent,
                    'speed': tracking.current_speed,
                    'delay_minutes': tracking.delay_minutes,
                    'delay_status': tracking.delay_status,
                    'is_moving': tracking.is_moving,
                    'status': bus_status.current_status if bus_status else 'unknown',
                    'passenger_count': bus_status.passenger_count if bus_status else 0,
                    'last_updated': tracking.last_updated.isoformat()
                }
                
                buses_data.append(bus_data)
        
        # Get route stops for map display
        stops_data = []
        for stop in route.stops.all().order_by('stop_sequence'):
            stops_data.append({
                'stop_name': stop.stop_name,
                'sequence': stop.stop_sequence,
                'latitude': stop.latitude,
                'longitude': stop.longitude,
                'is_major_stop': stop.is_major_stop,
                'estimated_time': stop.estimated_arrival_time.strftime('%H:%M') if stop.estimated_arrival_time else None
            })
        
        return JsonResponse({
            'success': True,
            'route_info': {
                'route_name': route.route_name,
                'source': route.source,
                'destination': route.destination,
                'distance': route.distance,
                'route_type': route.route_type,
                'total_stops': len(stops_data)
            },
            'active_buses': buses_data,
            'total_active_buses': len(buses_data),
            'route_stops': stops_data,
            'last_updated': timezone.now().isoformat()
        })
        
    except Route.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': f'Route "{route_name}" not found'
        }, status=404)
    
    except Exception as e:
        logger.error(f"Route live overview error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to fetch route overview'
        }, status=500)


# ====== HELPER FUNCTIONS ======

def create_delay_alert(bus_route, delay_minutes):
    """Create delay alert for users"""
    try:
        alert = BusAlert.objects.create(
            alert_type='delay',
            priority='medium' if delay_minutes < 20 else 'high',
            title=f'Bus {bus_route.bus.bus_number} Delayed',
            message=f'Bus {bus_route.bus.bus_number} on {bus_route.route.route_name} is delayed by {delay_minutes} minutes.',
            bus_route=bus_route,
            route=bus_route.route,
            expires_at=timezone.now() + timedelta(hours=2)
        )
        logger.info(f"Delay alert created: {alert.title}")
    except Exception as e:
        logger.error(f"Failed to create delay alert: {str(e)}")


def create_status_alert(bus, status):
    """Create status change alert"""
    try:
        status_messages = {
            'breakdown': f'Bus {bus.bus_number} has broken down and is temporarily out of service.',
            'maintenance': f'Bus {bus.bus_number} is under maintenance and temporarily unavailable.'
        }
        
        if status in status_messages:
            alert = BusAlert.objects.create(
                alert_type='breakdown' if status == 'breakdown' else 'maintenance',
                priority='critical' if status == 'breakdown' else 'high',
                title=f'Bus {bus.bus_number} {status.title()}',
                message=status_messages[status],
                expires_at=timezone.now() + timedelta(hours=6)
            )
            logger.info(f"Status alert created: {alert.title}")
    except Exception as e:
        logger.error(f"Failed to create status alert: {str(e)}")


def calculate_eta_with_traffic(current_location, destination_location, current_speed, traffic_condition):
    """Calculate ETA considering traffic conditions"""
    distance = geodesic(current_location, destination_location).kilometers
    
    # Traffic multipliers
    traffic_multipliers = {
        'light': 1.0,
        'moderate': 1.3,
        'heavy': 1.8,
        'jam': 2.5
    }
    
    multiplier = traffic_multipliers.get(traffic_condition, 1.0)
    
    if current_speed > 0:
        eta_hours = (distance / current_speed) * multiplier
        return timezone.now() + timedelta(hours=eta_hours)
    
    return None