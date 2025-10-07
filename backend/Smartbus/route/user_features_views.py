"""
SmartBus User Features API Views
User personalization features like favorites, alerts, and notifications
"""

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta
import json
import logging

from .models import (
    Route, BusRoute, FavoriteRoute, BusAlert, 
    LiveRouteTracking, BusStatus
)
from users.models import User

logger = logging.getLogger(__name__)

# ====== FAVORITE ROUTES MANAGEMENT ======

@csrf_exempt
@require_http_methods(["POST"])
def add_favorite_route(request):
    """
    Add route to user's favorites
    """
    try:
        data = json.loads(request.body)
        
        user_email = data.get('user_email')
        route_id = data.get('route_id')
        bus_route_id = data.get('bus_route_id')  # Optional: specific bus
        nickname = data.get('nickname', '')
        
        if not user_email or not route_id:
            return JsonResponse({
                'success': False,
                'error': 'Missing user_email or route_id'
            }, status=400)
        
        # Get route
        route = get_object_or_404(Route, route_id=route_id, is_active=True)
        
        # Get specific bus route if provided
        bus_route = None
        if bus_route_id:
            bus_route = get_object_or_404(BusRoute, id=bus_route_id, route=route)
        
        # Create or update favorite
        favorite, created = FavoriteRoute.objects.get_or_create(
            user_email=user_email,
            route=route,
            defaults={
                'bus_route': bus_route,
                'nickname': nickname,
                'notification_enabled': True,
                'notification_time_before': 10
            }
        )
        
        if not created:
            # Update existing favorite
            favorite.bus_route = bus_route
            favorite.nickname = nickname
            favorite.last_accessed = timezone.now()
            favorite.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Route added to favorites successfully',
            'favorite': {
                'id': favorite.id,
                'route_name': route.route_name,
                'nickname': favorite.nickname or route.route_name,
                'source': route.source,
                'destination': route.destination,
                'bus_number': bus_route.bus.bus_number if bus_route else None,
                'notification_enabled': favorite.notification_enabled,
                'created_at': favorite.created_at.isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Add favorite route error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to add favorite route'
        }, status=500)


@require_http_methods(["GET"])
def get_user_favorites(request):
    """
    Get user's favorite routes with live status
    """
    try:
        user_email = request.GET.get('user_email')
        
        if not user_email:
            return JsonResponse({
                'success': False,
                'error': 'Missing user_email parameter'
            }, status=400)
        
        favorites = FavoriteRoute.objects.filter(
            user_email=user_email
        ).select_related('route', 'bus_route').order_by('-last_accessed')
        
        favorites_data = []
        for favorite in favorites:
            # Get live tracking if specific bus is favorited
            live_data = None
            if favorite.bus_route:
                tracking = LiveRouteTracking.objects.filter(
                    bus_route=favorite.bus_route,
                    is_active=True
                ).order_by('-last_updated').first()
                
                if tracking:
                    live_data = {
                        'bus_number': favorite.bus_route.bus.bus_number,
                        'current_stop': tracking.current_stop.stop_name if tracking.current_stop else 'En Route',
                        'progress_percent': tracking.route_progress_percent,
                        'delay_minutes': tracking.delay_minutes,
                        'delay_status': tracking.delay_status,
                        'is_moving': tracking.is_moving,
                        'eta': tracking.eta_display,
                        'last_updated': tracking.last_updated.isoformat()
                    }
            
            favorite_data = {
                'id': favorite.id,
                'route_name': favorite.route.route_name,
                'display_name': favorite.nickname or favorite.route.route_name,
                'source': favorite.route.source,
                'destination': favorite.route.destination,
                'route_type': favorite.route.route_type,
                'distance': favorite.route.distance,
                'total_fare': float(favorite.route.total_fare),
                'notification_enabled': favorite.notification_enabled,
                'notification_time_before': favorite.notification_time_before,
                'last_accessed': favorite.last_accessed.isoformat(),
                'live_tracking': live_data
            }
            
            favorites_data.append(favorite_data)
        
        return JsonResponse({
            'success': True,
            'favorites': favorites_data,
            'total_favorites': len(favorites_data)
        })
        
    except Exception as e:
        logger.error(f"Get user favorites error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to fetch favorites'
        }, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def update_favorite_settings(request, favorite_id):
    """
    Update favorite route notification settings
    """
    try:
        data = json.loads(request.body)
        
        favorite = get_object_or_404(FavoriteRoute, id=favorite_id)
        
        # Update settings
        if 'nickname' in data:
            favorite.nickname = data['nickname']
        if 'notification_enabled' in data:
            favorite.notification_enabled = data['notification_enabled']
        if 'notification_time_before' in data:
            favorite.notification_time_before = data['notification_time_before']
        
        favorite.last_accessed = timezone.now()
        favorite.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Favorite settings updated successfully',
            'favorite': {
                'id': favorite.id,
                'nickname': favorite.nickname,
                'notification_enabled': favorite.notification_enabled,
                'notification_time_before': favorite.notification_time_before
            }
        })
        
    except Exception as e:
        logger.error(f"Update favorite settings error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to update favorite settings'
        }, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def remove_favorite_route(request, favorite_id):
    """
    Remove route from user's favorites
    """
    try:
        favorite = get_object_or_404(FavoriteRoute, id=favorite_id)
        route_name = favorite.route.route_name
        
        favorite.delete()
        
        return JsonResponse({
            'success': True,
            'message': f'Removed {route_name} from favorites'
        })
        
    except Exception as e:
        logger.error(f"Remove favorite route error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to remove favorite route'
        }, status=500)


# ====== ALERTS & NOTIFICATIONS ======

@require_http_methods(["GET"])
def get_user_alerts(request):
    """
    Get alerts for specific user or general alerts
    """
    try:
        user_email = request.GET.get('user_email')
        alert_type = request.GET.get('type')  # arrival, delay, breakdown, etc.
        
        alerts_query = BusAlert.objects.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).order_by('-created_at')
        
        # Filter by user email if provided
        if user_email:
            alerts_query = alerts_query.filter(
                Q(target_user_email=user_email) | Q(target_user_email='')
            )
        
        # Filter by alert type if provided
        if alert_type:
            alerts_query = alerts_query.filter(alert_type=alert_type)
        
        alerts = alerts_query[:50]  # Limit to 50 most recent alerts
        
        alerts_data = []
        for alert in alerts:
            alert_data = {
                'id': alert.id,
                'type': alert.alert_type,
                'priority': alert.priority,
                'title': alert.title,
                'message': alert.message,
                'bus_route_info': None,
                'route_info': None,
                'target_user': alert.target_user_email or 'All Users',
                'created_at': alert.created_at.isoformat(),
                'expires_at': alert.expires_at.isoformat() if alert.expires_at else None
            }
            
            # Add bus route info if available
            if alert.bus_route:
                alert_data['bus_route_info'] = {
                    'bus_number': alert.bus_route.bus.bus_number,
                    'bus_name': alert.bus_route.bus.bus_name,
                    'route_name': alert.bus_route.route.route_name
                }
            
            # Add route info if available
            if alert.route:
                alert_data['route_info'] = {
                    'route_name': alert.route.route_name,
                    'source': alert.route.source,
                    'destination': alert.route.destination
                }
            
            alerts_data.append(alert_data)
        
        return JsonResponse({
            'success': True,
            'alerts': alerts_data,
            'total_alerts': len(alerts_data),
            'unread_count': len([a for a in alerts_data if not a.get('is_read', False)])
        })
        
    except Exception as e:
        logger.error(f"Get user alerts error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to fetch alerts'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def create_custom_alert(request):
    """
    Create custom alert for route (admin/driver function)
    """
    try:
        data = json.loads(request.body)
        
        required_fields = ['title', 'message', 'alert_type']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }, status=400)
        
        # Optional fields
        bus_route_id = data.get('bus_route_id')
        route_id = data.get('route_id')
        target_user_email = data.get('target_user_email', '')
        priority = data.get('priority', 'medium')
        expires_in_hours = data.get('expires_in_hours', 24)
        
        # Get related objects
        bus_route = None
        route = None
        
        if bus_route_id:
            bus_route = get_object_or_404(BusRoute, id=bus_route_id)
            route = bus_route.route
        elif route_id:
            route = get_object_or_404(Route, route_id=route_id)
        
        # Create alert
        alert = BusAlert.objects.create(
            alert_type=data['alert_type'],
            priority=priority,
            title=data['title'],
            message=data['message'],
            bus_route=bus_route,
            route=route,
            target_user_email=target_user_email,
            expires_at=timezone.now() + timedelta(hours=expires_in_hours)
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Alert created successfully',
            'alert': {
                'id': alert.id,
                'type': alert.alert_type,
                'title': alert.title,
                'priority': alert.priority,
                'created_at': alert.created_at.isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Create custom alert error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to create alert'
        }, status=500)


# ====== BUS ARRIVAL NOTIFICATIONS ======

@require_http_methods(["GET"])
def get_arrival_notifications(request):
    """
    Get bus arrival notifications for user's favorite routes
    Professional notification system like FindMyTrain
    """
    try:
        user_email = request.GET.get('user_email')
        
        if not user_email:
            return JsonResponse({
                'success': False,
                'error': 'Missing user_email parameter'
            }, status=400)
        
        # Get user's favorites with notification enabled
        favorites = FavoriteRoute.objects.filter(
            user_email=user_email,
            notification_enabled=True
        ).select_related('route', 'bus_route')
        
        notifications = []
        
        for favorite in favorites:
            if favorite.bus_route:
                # Get live tracking for specific bus
                tracking = LiveRouteTracking.objects.filter(
                    bus_route=favorite.bus_route,
                    is_active=True
                ).order_by('-last_updated').first()
                
                if tracking and tracking.estimated_arrival_next_stop:
                    # Check if bus is arriving soon
                    time_to_arrival = (tracking.estimated_arrival_next_stop - timezone.now()).total_seconds() / 60
                    
                    if 0 <= time_to_arrival <= favorite.notification_time_before:
                        notification = {
                            'type': 'arrival',
                            'priority': 'high',
                            'title': f'🚌 {favorite.bus_route.bus.bus_number} Arriving Soon!',
                            'message': f'Your bus {favorite.bus_route.bus.bus_number} on {favorite.route.route_name} will arrive at {tracking.next_stop.stop_name if tracking.next_stop else "destination"} in approximately {int(time_to_arrival)} minutes.',
                            'bus_info': {
                                'bus_number': favorite.bus_route.bus.bus_number,
                                'bus_name': favorite.bus_route.bus.bus_name,
                                'route_name': favorite.route.route_name,
                                'current_stop': tracking.current_stop.stop_name if tracking.current_stop else 'En Route',
                                'next_stop': tracking.next_stop.stop_name if tracking.next_stop else 'Destination',
                                'eta_minutes': int(time_to_arrival),
                                'delay_status': tracking.delay_status
                            },
                            'favorite_id': favorite.id,
                            'created_at': timezone.now().isoformat()
                        }
                        
                        notifications.append(notification)
        
        return JsonResponse({
            'success': True,
            'notifications': notifications,
            'total_notifications': len(notifications),
            'message': f'Found {len(notifications)} arrival notifications'
        })
        
    except Exception as e:
        logger.error(f"Get arrival notifications error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to fetch arrival notifications'
        }, status=500)


# ====== ROUTE ANALYTICS FOR USER ======

@require_http_methods(["GET"])
def get_route_analytics(request, route_name):
    """
    Get analytics and insights for a specific route
    Usage patterns, delays, peak hours, etc.
    """
    try:
        route = get_object_or_404(Route, route_name__iexact=route_name, is_active=True)
        
        # Get recent tracking data for analytics
        recent_trackings = LiveRouteTracking.objects.filter(
            bus_route__route=route,
            last_updated__gte=timezone.now() - timedelta(days=7)
        ).select_related('bus_route')
        
        # Calculate analytics
        total_trips = recent_trackings.count()
        avg_delay = recent_trackings.aggregate(
            models.Avg('delay_minutes')
        )['delay_minutes__avg'] or 0
        
        on_time_trips = recent_trackings.filter(delay_minutes__lte=5).count()
        delayed_trips = recent_trackings.filter(delay_minutes__gt=5).count()
        
        on_time_percentage = (on_time_trips / total_trips * 100) if total_trips > 0 else 0
        
        # Peak hours analysis
        from django.db.models import Count
        peak_hours = recent_trackings.extra(
            select={'hour': 'EXTRACT(hour FROM last_updated)'}
        ).values('hour').annotate(trip_count=Count('id')).order_by('-trip_count')[:5]
        
        # Speed analytics
        avg_speed = recent_trackings.aggregate(
            models.Avg('average_speed')
        )['average_speed__avg'] or 0
        
        analytics_data = {
            'route_info': {
                'route_name': route.route_name,
                'source': route.source,
                'destination': route.destination,
                'distance': route.distance,
                'total_stops': route.stops.count()
            },
            'performance_metrics': {
                'total_trips_last_7_days': total_trips,
                'average_delay_minutes': round(avg_delay, 1),
                'on_time_percentage': round(on_time_percentage, 1),
                'delayed_trips': delayed_trips,
                'on_time_trips': on_time_trips,
                'average_speed_kmh': round(avg_speed, 1)
            },
            'peak_hours': [
                {
                    'hour': f"{hour['hour']:02d}:00",
                    'trip_count': hour['trip_count']
                }
                for hour in peak_hours
            ],
            'reliability_status': 'Excellent' if on_time_percentage > 90 else 
                                'Good' if on_time_percentage > 75 else 
                                'Fair' if on_time_percentage > 60 else 'Poor',
            'last_updated': timezone.now().isoformat()
        }
        
        return JsonResponse({
            'success': True,
            'analytics': analytics_data
        })
        
    except Exception as e:
        logger.error(f"Route analytics error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to fetch route analytics'
        }, status=500)