from django.urls import path
from . import views
from . import live_tracking_views
from . import user_features_views

app_name = 'route'

urlpatterns = [
    # Route management endpoints
    path('', views.get_all_routes, name='get_all_routes'),
    path('<int:route_id>/', views.get_route_details, name='get_route_details'),
    path('search/', views.search_routes, name='search_routes'),
    
    # Bus search endpoints
    path('find-bus/', views.find_bus_by_route_name, name='find_bus_by_route_name'),
    
    # ====== LIVE TRACKING APIs (Driver & User) ======
    
    # Driver Mobile App APIs
    path('driver/location/update/', live_tracking_views.driver_update_location, name='driver_update_location'),
    path('driver/status/update/', live_tracking_views.driver_update_status, name='driver_update_status'),
    
    # User Live Tracking APIs
    path('live/<str:bus_number>/', live_tracking_views.get_live_bus_location, name='get_live_bus_location'),
    path('live/route/<str:route_name>/', live_tracking_views.get_route_live_overview, name='get_route_live_overview'),
    
    # Legacy tracking endpoints (for backward compatibility)
    path('tracking/<int:bus_route_id>/', views.get_live_tracking, name='get_live_tracking'),
    path('tracking/update/', views.update_live_location, name='update_live_location'),
    
    # ====== USER FEATURES APIs ======
    
    # Favorite Routes Management
    path('favorites/add/', user_features_views.add_favorite_route, name='add_favorite_route'),
    path('favorites/user/', user_features_views.get_user_favorites, name='get_user_favorites'),
    path('favorites/<int:favorite_id>/update/', user_features_views.update_favorite_settings, name='update_favorite_settings'),
    path('favorites/<int:favorite_id>/remove/', user_features_views.remove_favorite_route, name='remove_favorite_route'),
    
    # Alerts & Notifications
    path('alerts/user/', user_features_views.get_user_alerts, name='get_user_alerts'),
    path('alerts/create/', user_features_views.create_custom_alert, name='create_custom_alert'),
    path('notifications/arrivals/', user_features_views.get_arrival_notifications, name='get_arrival_notifications'),
    
    # Analytics & Insights
    path('analytics/<str:route_name>/', user_features_views.get_route_analytics, name='get_route_analytics'),
    
    # Health check
    path('health/', views.health_check, name='health_check'),
]
