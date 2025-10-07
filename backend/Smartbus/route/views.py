from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.utils import timezone
from datetime import datetime, timedelta
import json
import logging
import difflib  # For intelligent city name matching

from .models import Route, RouteStop, BusRoute, LiveRouteTracking
from users.models import Bus

logger = logging.getLogger(__name__)


@require_http_methods(["GET"])
def get_all_routes(request):
    """Get all active routes with pagination"""
    try:
        routes = Route.objects.filter(is_active=True).order_by('route_name')
        
        # Apply filters
        route_type = request.GET.get('type')
        source = request.GET.get('source')
        destination = request.GET.get('destination')
        
        if route_type:
            routes = routes.filter(route_type=route_type)
        if source:
            routes = routes.filter(source__icontains=source)
        if destination:
            routes = routes.filter(destination__icontains=destination)
        
        # Pagination
        page_number = request.GET.get('page', 1)
        page_size = min(int(request.GET.get('page_size', 10)), 100)
        
        paginator = Paginator(routes, page_size)
        page_obj = paginator.get_page(page_number)
        
        routes_data = []
        for route in page_obj:
            routes_data.append({
                'route_id': route.route_id,
                'route_name': route.route_name,
                'source': route.source,
                'destination': route.destination,
                'distance': route.distance,
                'total_fare': float(route.total_fare),
                'route_type': route.route_type,
                'estimated_duration': str(route.estimated_duration) if route.estimated_duration else None,
                'stops_count': route.stops.count()
            })
        
        return JsonResponse({
            'success': True,
            'routes': routes_data,
            'pagination': {
                'page': page_obj.number,
                'pages': paginator.num_pages,
                'per_page': page_size,
                'total': paginator.count
            }
        })
    
    except Exception as e:
        logger.error(f"Error fetching routes: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to fetch routes'
        }, status=500)


@require_http_methods(["GET"])
def get_route_details(request, route_id):
    """Get detailed information about a specific route"""
    try:
        route = get_object_or_404(Route, route_id=route_id, is_active=True)
        
        # Get route stops
        stops = route.stops.all().order_by('stop_sequence')
        stops_data = []
        for stop in stops:
            stops_data.append({
                'stop_name': stop.stop_name,
                'stop_sequence': stop.stop_sequence,
                'latitude': stop.latitude,
                'longitude': stop.longitude,
                'distance_from_source': stop.distance_from_source,
                'fare_from_source': float(stop.fare_from_source),
                'is_major_stop': stop.is_major_stop,
                'estimated_arrival_time': stop.estimated_arrival_time.strftime('%H:%M') if stop.estimated_arrival_time else None
            })
        
        # Get assigned buses
        bus_routes = route.assigned_buses.filter(is_operational=True)
        buses_data = []
        for bus_route in bus_routes:
            buses_data.append({
                'bus_number': bus_route.bus.bus_number,
                'bus_name': bus_route.bus.bus_name,
                'departure_time': bus_route.departure_time.strftime('%H:%M'),
                'arrival_time': bus_route.arrival_time.strftime('%H:%M'),
                'frequency_minutes': bus_route.frequency_minutes
            })
        
        return JsonResponse({
            'success': True,
            'route': {
                'route_id': route.route_id,
                'route_name': route.route_name,
                'source': route.source,
                'destination': route.destination,
                'distance': route.distance,
                'total_fare': float(route.total_fare),
                'route_type': route.route_type,
                'estimated_duration': str(route.estimated_duration) if route.estimated_duration else None,
                'stops': stops_data,
                'buses': buses_data
            }
        })
    
    except Route.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Route not found'
        }, status=404)
    
    except Exception as e:
        logger.error(f"Error fetching route details: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to fetch route details'
        }, status=500)


@require_http_methods(["GET"])
def search_routes(request):
    """Enhanced route search with intelligent location validation and bus availability"""
    try:
        source = request.GET.get('source', '').strip()
        destination = request.GET.get('destination', '').strip()
        
        # Input validation
        if not source and not destination:
            return JsonResponse({
                'status': 'error',
                'success': False,
                'error': '⚠️ Please provide source and destination for search',
                'message': 'Enter both source and destination cities to find routes',
                'available_cities': get_popular_cities()
            }, status=400)
        
        if not source or not destination:
            return JsonResponse({
                'status': 'error', 
                'success': False,
                'error': '⚠️ Both source and destination are required',
                'message': 'Please provide both source and destination cities',
                'available_cities': get_popular_cities()
            }, status=400)
        
        # Validate locations against available cities
        available_cities = get_available_cities()
        source_valid = validate_city_name(source, available_cities)
        destination_valid = validate_city_name(destination, available_cities)
        
        # Handle invalid locations
        if not source_valid['valid'] or not destination_valid['valid']:
            error_msg = '❌ Invalid location(s): '
            suggestions = []
            
            if not source_valid['valid']:
                error_msg += f'"{source}" not found'
                if source_valid['suggestions']:
                    suggestions.extend([f"Did you mean '{s}' for source?" for s in source_valid['suggestions'][:2]])
                    
            if not destination_valid['valid']:
                if not source_valid['valid']:
                    error_msg += ', '
                error_msg += f'"{destination}" not found'
                if destination_valid['suggestions']:
                    suggestions.extend([f"Did you mean '{s}' for destination?" for s in destination_valid['suggestions'][:2]])
            
            return JsonResponse({
                'status': 'error',
                'success': False, 
                'error': error_msg,
                'message': 'Please check the spelling or choose from available cities',
                'suggestions': suggestions if suggestions else [
                    'Try: Delhi to Mumbai',
                    'Try: Bangalore to Chennai', 
                    'Try: Pune to Mumbai'
                ],
                'available_cities': available_cities[:10],
                'search_params': {'source': source, 'destination': destination}
            }, status=400)
        
        # Use validated city names for search
        validated_source = source_valid['matched_name']
        validated_destination = destination_valid['matched_name']
        
        # Search for routes
        routes = Route.objects.filter(
            is_active=True,
            source__iexact=validated_source,
            destination__iexact=validated_destination
        )
        
        # If no exact match, try broader search
        if not routes.exists():
            routes = Route.objects.filter(
                is_active=True,
                source__icontains=validated_source,
                destination__icontains=validated_destination
            )
        
        # If still no routes found
        if not routes.exists():
            # Check if cities exist in reverse direction
            reverse_routes = Route.objects.filter(
                is_active=True,
                source__iexact=validated_destination,
                destination__iexact=validated_source
            )
            
            if reverse_routes.exists():
                return JsonResponse({
                    'status': 'info',
                    'success': False,
                    'error': f'❌ No direct routes from {validated_source} to {validated_destination}',
                    'message': f'But we found routes from {validated_destination} to {validated_source}',
                    'reverse_routes': [{
                        'route_name': r.route_name,
                        'source': r.source, 
                        'destination': r.destination,
                        'distance': r.distance,
                        'fare': float(r.total_fare)
                    } for r in reverse_routes[:3]],
                    'suggestions': get_alternative_routes(validated_source, validated_destination)
                }, status=404)
            
            return JsonResponse({
                'status': 'error',
                'success': False,
                'error': f'❌ No routes available from {validated_source} to {validated_destination}',
                'message': 'This route is not currently available. Try these popular routes:',
                'suggestions': get_popular_route_suggestions(),
                'alternative_from_source': get_routes_from_city(validated_source),
                'alternative_to_destination': get_routes_to_city(validated_destination)
            }, status=404)
        
        # Process found routes and check bus availability
        routes_data = []
        routes_with_buses = 0
        routes_coming_soon = 0
        
        for route in routes:
            # Get available buses for this route
            available_buses = route.assigned_buses.filter(
                is_operational=True,
                effective_from__lte=timezone.now().date()
            )
            
            buses_info = []
            if available_buses.exists():
                for bus_route in available_buses:
                    buses_info.append({
                        'bus_name': bus_route.bus.bus_name,
                        'bus_number': bus_route.bus.bus_number,
                        'operator_name': bus_route.bus.user.name,
                        'departure_time': bus_route.departure_time.strftime('%H:%M'),
                        'arrival_time': bus_route.arrival_time.strftime('%H:%M'),
                        'frequency_minutes': bus_route.frequency_minutes
                    })
                routes_with_buses += 1
            else:
                routes_coming_soon += 1
            
            # Route status based on bus availability  
            route_status = 'active' if buses_info else 'coming_soon'
            
            routes_data.append({
                'route_id': route.route_id,
                'route_name': route.route_name,
                'source': route.source,
                'destination': route.destination,
                'distance': route.distance,
                'total_fare': float(route.total_fare),
                'route_type': route.route_type,
                'estimated_duration': str(route.estimated_duration) if route.estimated_duration else 'N/A',
                'status': route_status,
                'available_buses_count': len(buses_info),
                'buses': buses_info if buses_info else [],
                'message': f'✅ {len(buses_info)} buses available' if buses_info else '🔄 Coming Soon - No buses currently operational',
                'stops_count': route.stops.count()
            })
        
        # Prepare response based on bus availability
        if routes_with_buses == 0:
            return JsonResponse({
                'status': 'warning',
                'success': True,
                'message': f'🔄 Route found from {validated_source} to {validated_destination} but no buses currently available',
                'routes': routes_data,
                'summary': {
                    'total_routes': len(routes_data),
                    'active_routes': routes_with_buses,
                    'coming_soon': routes_coming_soon
                },
                'search_params': {
                    'source': validated_source,
                    'destination': validated_destination
                }
            })
        
        return JsonResponse({
            'status': 'success',
            'success': True,
            'message': f'✅ Found {routes_with_buses} active route(s) with buses from {validated_source} to {validated_destination}',
            'routes': routes_data,
            'summary': {
                'total_routes': len(routes_data),
                'active_routes': routes_with_buses, 
                'coming_soon': routes_coming_soon
            },
            'search_params': {
                'source': validated_source,
                'destination': validated_destination
            }
        })
    
    except Exception as e:
        logger.error(f"Error searching routes: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'success': False,
            'error': 'Failed to search routes. Please try again.',
            'technical_error': str(e) if logger.level == logging.DEBUG else None
        }, status=500)


def get_popular_cities():
    """Get list of popular cities with available routes"""
    try:
        # Get unique source and destination cities
        sources = Route.objects.filter(is_active=True).values_list('source', flat=True).distinct()
        destinations = Route.objects.filter(is_active=True).values_list('destination', flat=True).distinct()
        
        all_cities = set(list(sources) + list(destinations))
        return sorted(list(all_cities))
    except:
        return ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']


def get_available_cities():
    """Get all available cities from active routes"""
    try:
        routes = Route.objects.filter(is_active=True)
        sources = set(routes.values_list('source', flat=True))
        destinations = set(routes.values_list('destination', flat=True))
        all_cities = sources.union(destinations)
        return sorted(list(all_cities))
    except Exception as e:
        logger.error(f"Error getting available cities: {str(e)}")
        return ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']


def validate_city_name(city_input, available_cities):
    """Validate city name with strict matching and suggestions"""
    city_input = city_input.strip().title()
    
    # Check minimum length - reject very short inputs like "s", "k", etc.
    if len(city_input) < 3:
        return {
            'valid': False,
            'matched_name': None,
            'suggestions': available_cities[:5]  # Show some popular cities
        }
    
    # Exact match
    for city in available_cities:
        if city.lower() == city_input.lower():
            return {
                'valid': True,
                'matched_name': city,
                'suggestions': []
            }
    
    # Strict partial match - only if input is significant portion of city name
    # और multiple matches की case में valid return नहीं करें
    strict_partial_matches = []
    for city in available_cities:
        city_lower = city.lower()
        input_lower = city_input.lower()
        
        # Only match if:
        # 1. Input is at least 3 characters
        # 2. Input starts the city name, OR
        # 3. Input is at least 50% of city name length
        if (city_lower.startswith(input_lower) and len(input_lower) >= 3) or \
           (input_lower in city_lower and len(input_lower) >= len(city) * 0.5):
            strict_partial_matches.append(city)
    
    # Only auto-select if exactly one strict match found
    if len(strict_partial_matches) == 1:
        return {
            'valid': True,
            'matched_name': strict_partial_matches[0],
            'suggestions': []
        }
    
    # If multiple strict matches or none, show fuzzy suggestions
    if strict_partial_matches:
        suggestions = strict_partial_matches[:3]
    else:
        # Fuzzy matching using difflib with higher cutoff
        suggestions = difflib.get_close_matches(
            city_input, available_cities, n=3, cutoff=0.7
        )
    
    return {
        'valid': False,
        'matched_name': None,
        'suggestions': suggestions
    }


def get_alternative_routes(source, destination):
    """Get alternative route suggestions"""
    try:
        alternatives = []
        
        # Routes from source to anywhere
        source_routes = Route.objects.filter(
            is_active=True, source__iexact=source
        ).exclude(destination__iexact=destination)[:3]
        
        for route in source_routes:
            alternatives.append({
                'type': 'from_source',
                'route_name': route.route_name,
                'source': route.source,
                'destination': route.destination,
                'suggestion': f'Try {source} to {route.destination}'
            })
        
        # Routes to destination from anywhere  
        dest_routes = Route.objects.filter(
            is_active=True, destination__iexact=destination
        ).exclude(source__iexact=source)[:3]
        
        for route in dest_routes:
            alternatives.append({
                'type': 'to_destination',
                'route_name': route.route_name,
                'source': route.source,
                'destination': route.destination,
                'suggestion': f'Try {route.source} to {destination}'
            })
        
        return alternatives[:5]
    except Exception as e:
        logger.error(f"Error getting alternative routes: {str(e)}")
        return []


def get_popular_route_suggestions():
    """Get popular route suggestions"""
    try:
        routes = Route.objects.filter(is_active=True).order_by('?')[:5]
        suggestions = []
        
        for route in routes:
            bus_count = route.assigned_buses.filter(is_operational=True).count()
            suggestions.append({
                'route_name': route.route_name,
                'source': route.source,
                'destination': route.destination,
                'buses_available': bus_count,
                'fare': float(route.total_fare),
                'suggestion': f'{route.source} to {route.destination}'
            })
        
        return suggestions
    except Exception as e:
        logger.error(f"Error getting popular routes: {str(e)}")
        return []


def get_routes_from_city(city):
    """Get routes originating from a city"""
    try:
        routes = Route.objects.filter(
            is_active=True, source__iexact=city
        )[:5]
        
        return [{
            'route_name': r.route_name,
            'destination': r.destination,
            'buses_count': r.assigned_buses.filter(is_operational=True).count()
        } for r in routes]
    except:
        return []


def get_routes_to_city(city):
    """Get routes going to a city"""
    try:
        routes = Route.objects.filter(
            is_active=True, destination__iexact=city
        )[:5]
        
        return [{
            'route_name': r.route_name,
            'source': r.source,
            'buses_count': r.assigned_buses.filter(is_operational=True).count()
        } for r in routes]
    except:
        return []


def get_route_suggestions(source=None, destination=None):
    """Get route suggestions based on available routes"""
    try:
        routes = Route.objects.filter(is_active=True)[:10]
        suggestions = []
        
        for route in routes:
            suggestions.append({
                'route_name': route.route_name,
                'source': route.source,
                'destination': route.destination,
                'available_buses': route.assigned_buses.filter(is_operational=True).count()
            })
        
        return suggestions
    except:
        return []


@require_http_methods(["GET"])
def get_live_tracking(request, bus_route_id):
    """Get live tracking information for a specific bus route"""
    try:
        bus_route = get_object_or_404(BusRoute, id=bus_route_id, is_operational=True)
        
        # Get latest tracking information
        tracking = LiveRouteTracking.objects.filter(
            bus_route=bus_route,
            is_active=True
        ).order_by('-last_updated').first()
        
        if not tracking:
            return JsonResponse({
                'success': False,
                'error': 'No live tracking data available for this bus'
            }, status=404)
        
        return JsonResponse({
            'success': True,
            'tracking': {
                'bus_number': bus_route.bus.bus_number,
                'bus_name': bus_route.bus.bus_name,
                'route_name': bus_route.route.route_name,
                'current_latitude': tracking.current_latitude,
                'current_longitude': tracking.current_longitude,
                'current_speed': tracking.current_speed,
                'direction': tracking.direction,
                'current_stop': tracking.current_stop.stop_name if tracking.current_stop else None,
                'estimated_arrival_next_stop': tracking.estimated_arrival_next_stop.isoformat() if tracking.estimated_arrival_next_stop else None,
                'last_updated': tracking.last_updated.isoformat()
            }
        })
    
    except BusRoute.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Bus route not found'
        }, status=404)
    
    except Exception as e:
        logger.error(f"Error fetching live tracking: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to fetch live tracking data'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def update_live_location(request):
    """Update live location for a bus (for bus operators)"""
    try:
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['bus_route_id', 'latitude', 'longitude']
        for field in required_fields:
            if field not in data:
                return JsonResponse({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }, status=400)
        
        bus_route = get_object_or_404(BusRoute, id=data['bus_route_id'], is_operational=True)
        
        # Create or update live tracking
        tracking, created = LiveRouteTracking.objects.update_or_create(
            bus_route=bus_route,
            defaults={
                'current_latitude': data['latitude'],
                'current_longitude': data['longitude'],
                'current_speed': data.get('speed', 0.0),
                'direction': data.get('direction', 'to_destination'),
                'is_active': True
            }
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Location updated successfully',
            'tracking_id': tracking.id
        })
    
    except BusRoute.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Bus route not found'
        }, status=404)
    
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    
    except Exception as e:
        logger.error(f"Error updating live location: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to update location'
        }, status=500)


@require_http_methods(["GET"])
def find_bus_by_route_name(request):
    """Find buses by route name with intelligent validation"""
    try:
        route_name = request.GET.get('route_name', '').strip()
        
        if not route_name:
            return JsonResponse({
                'success': False,
                'error': 'Please provide a route name to search',
                'available_routes': [r.route_name for r in Route.objects.filter(is_active=True)[:10]]
            }, status=400)
        
        # Try exact match first
        routes = Route.objects.filter(route_name__iexact=route_name, is_active=True)
        
        # If no exact match, try partial match
        if not routes.exists():
            routes = Route.objects.filter(route_name__icontains=route_name, is_active=True)
        
        # If still no match, suggest similar routes
        if not routes.exists():
            # Find routes with similar names
            all_routes = Route.objects.filter(is_active=True)
            suggestions = []
            
            for route in all_routes:
                # Simple similarity check
                if any(word.lower() in route.route_name.lower() for word in route_name.split()):
                    suggestions.append({
                        'route_name': route.route_name,
                        'source': route.source,
                        'destination': route.destination
                    })
            
            return JsonResponse({
                'success': False,
                'error': f'❌ Wrong route name: "{route_name}" not found',
                'message': 'Please check the route name or try these available routes:',
                'suggestions': suggestions[:5] if suggestions else [
                    {'route_name': r.route_name, 'source': r.source, 'destination': r.destination} 
                    for r in Route.objects.filter(is_active=True)[:5]
                ]
            }, status=404)
        
        # Route found! Get bus details
        route = routes.first()
        bus_routes = route.assigned_buses.filter(is_operational=True)
        
        buses_data = []
        for bus_route in bus_routes:
            buses_data.append({
                'bus_id': bus_route.id,
                'bus_name': bus_route.bus.bus_name,
                'bus_number': bus_route.bus.bus_number,
                'operator_name': bus_route.bus.user.name,
                'departure_time': bus_route.departure_time.strftime('%H:%M'),
                'arrival_time': bus_route.arrival_time.strftime('%H:%M'),
                'frequency_minutes': bus_route.frequency_minutes,
                'distance': route.distance,
                'fare': float(route.total_fare),
                'estimated_duration': str(route.estimated_duration) if route.estimated_duration else None,
                'route_type': route.route_type
            })
        
        if not buses_data:
            return JsonResponse({
                'success': False,
                'error': f'Route "{route.route_name}" found but no operational buses available',
                'route_info': {
                    'route_name': route.route_name,
                    'source': route.source,
                    'destination': route.destination,
                    'distance': route.distance,
                    'total_fare': float(route.total_fare)
                }
            }, status=404)
        
        return JsonResponse({
            'success': True,
            'message': f'✅ Found {len(buses_data)} buses on "{route.route_name}" route',
            'route_info': {
                'route_id': route.route_id,
                'route_name': route.route_name,
                'source': route.source,
                'destination': route.destination,
                'distance': route.distance,
                'total_fare': float(route.total_fare),
                'route_type': route.route_type,
                'stops_count': route.stops.count()
            },
            'buses': buses_data,
            'total_buses': len(buses_data)
        })
    
    except Exception as e:
        logger.error(f"Error finding bus by route name: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to search buses by route name'
        }, status=500)


@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint for route service"""
    return JsonResponse({
        'success': True,
        'service': 'route',
        'status': 'healthy',
        'timestamp': timezone.now().isoformat()
    })
