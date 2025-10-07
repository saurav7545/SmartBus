from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import (
    Route, RouteStop, BusRoute, LiveRouteTracking, 
    BusStatus, FavoriteRoute, BusAlert
)


class RouteStopInline(admin.TabularInline):
    model = RouteStop
    extra = 1
    fields = ['stop_name', 'stop_sequence', 'latitude', 'longitude', 'distance_from_source', 'estimated_arrival_time', 'fare_from_source', 'is_major_stop']
    ordering = ['stop_sequence']


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['route_name', 'source', 'destination', 'distance', 'total_fare', 'route_type', 'is_active', 'created_at']
    list_filter = ['route_type', 'is_active', 'created_at']
    search_fields = ['route_name', 'source', 'destination']
    readonly_fields = ['total_fare', 'created_at', 'updated_at']
    inlines = [RouteStopInline]
    
    fieldsets = [
        ('Basic Information', {
            'fields': ('route_name', 'source', 'destination', 'distance')
        }),
        ('Pricing & Type', {
            'fields': ('fare_per_km', 'total_fare', 'route_type')
        }),
        ('Schedule & Status', {
            'fields': ('estimated_duration', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        })
    ]


@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    list_display = ['route', 'stop_name', 'stop_sequence', 'distance_from_source', 'fare_from_source', 'is_major_stop']
    list_filter = ['is_major_stop', 'route']
    search_fields = ['stop_name', 'route__route_name']
    ordering = ['route', 'stop_sequence']


@admin.register(BusRoute)
class BusRouteAdmin(admin.ModelAdmin):
    list_display = ['bus', 'route', 'departure_time', 'arrival_time', 'frequency_minutes', 'is_operational', 'effective_from']
    list_filter = ['is_operational', 'effective_from', 'route__route_type']
    search_fields = ['bus__bus_number', 'bus__bus_name', 'route__route_name']
    date_hierarchy = 'effective_from'
    
    fieldsets = [
        ('Assignment', {
            'fields': ('bus', 'route')
        }),
        ('Schedule', {
            'fields': ('departure_time', 'arrival_time', 'frequency_minutes')
        }),
        ('Validity', {
            'fields': ('effective_from', 'effective_to', 'is_operational')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        })
    ]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(LiveRouteTracking)
class LiveRouteTrackingAdmin(admin.ModelAdmin):
    list_display = ['bus_route', 'current_stop', 'current_latitude', 'current_longitude', 'current_speed', 'direction', 'last_updated', 'is_active']
    list_filter = ['direction', 'is_active', 'last_updated']
    search_fields = ['bus_route__bus__bus_number', 'bus_route__route__route_name']
    readonly_fields = ['last_updated']
    date_hierarchy = 'last_updated'
    
    fieldsets = [
        ('Bus & Route Info', {
            'fields': ('bus_route', 'current_stop', 'next_stop')
        }),
        ('GPS Location', {
            'fields': ('current_latitude', 'current_longitude', 'altitude', 'accuracy')
        }),
        ('Movement Data', {
            'fields': ('current_speed', 'average_speed', 'bearing', 'is_moving', 'direction')
        }),
        ('Route Progress', {
            'fields': ('route_progress_percent', 'distance_covered', 'distance_remaining')
        }),
        ('Timing & ETA', {
            'fields': ('estimated_arrival_next_stop', 'estimated_arrival_destination', 'delay_minutes', 'is_delayed')
        }),
        ('Status', {
            'fields': ('is_active', 'engine_status', 'trip_start_time')
        }),
        ('Conditions', {
            'fields': ('weather_condition', 'traffic_condition')
        }),
        ('Tracking Info', {
            'fields': ('last_updated', 'last_movement'),
            'classes': ['collapse']
        })
    ]
    
    def get_location_link(self, obj):
        if obj.current_latitude and obj.current_longitude:
            maps_url = f"https://www.google.com/maps?q={obj.current_latitude},{obj.current_longitude}"
            return format_html(
                '<a href="{}" target="_blank">📍 View on Map</a>',
                maps_url
            )
        return "-"
    get_location_link.short_description = "Location"
    get_location_link.allow_tags = True


@admin.register(BusStatus)
class BusStatusAdmin(admin.ModelAdmin):
    list_display = ['bus', 'current_status', 'driver_name', 'passenger_count', 'fuel_level', 'updated_at']
    list_filter = ['current_status', 'updated_at']
    search_fields = ['bus__bus_number', 'bus__bus_name', 'driver_name']
    readonly_fields = ['updated_at']
    
    fieldsets = [
        ('Bus Information', {
            'fields': ('bus', 'current_status')
        }),
        ('Driver Details', {
            'fields': ('driver_name', 'driver_phone')
        }),
        ('Capacity & Fuel', {
            'fields': ('passenger_count', 'max_capacity', 'fuel_level')
        }),
        ('Maintenance', {
            'fields': ('last_maintenance', 'next_maintenance')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        })
    ]
    
    def get_status_display(self, obj):
        colors = {
            'active': 'green',
            'idle': 'orange', 
            'maintenance': 'blue',
            'offline': 'gray',
            'delayed': 'red',
            'breakdown': 'red'
        }
        color = colors.get(obj.current_status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_current_status_display()
        )
    get_status_display.short_description = 'Status'


@admin.register(FavoriteRoute)
class FavoriteRouteAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'route', 'nickname', 'notification_enabled', 'last_accessed']
    list_filter = ['notification_enabled', 'route__route_type', 'created_at']
    search_fields = ['user_email', 'route__route_name', 'nickname']
    readonly_fields = ['created_at', 'last_accessed']
    
    fieldsets = [
        ('User & Route', {
            'fields': ('user_email', 'route', 'bus_route')
        }),
        ('Customization', {
            'fields': ('nickname',)
        }),
        ('Notifications', {
            'fields': ('notification_enabled', 'notification_time_before')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_accessed'),
            'classes': ['collapse']
        })
    ]


@admin.register(BusAlert)
class BusAlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'alert_type', 'priority', 'target_user_display', 'is_active', 'created_at', 'expires_at']
    list_filter = ['alert_type', 'priority', 'is_active', 'created_at']
    search_fields = ['title', 'message', 'target_user_email']
    readonly_fields = ['created_at', 'updated_at', 'sent_at']
    date_hierarchy = 'created_at'
    
    fieldsets = [
        ('Alert Details', {
            'fields': ('alert_type', 'priority', 'title', 'message')
        }),
        ('Targeting', {
            'fields': ('target_user_email', 'target_route', 'bus_route', 'route')
        }),
        ('Status & Timing', {
            'fields': ('is_active', 'is_sent', 'sent_at', 'expires_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        })
    ]
    
    def target_user_display(self, obj):
        if obj.target_user_email:
            return obj.target_user_email
        return "All Users"
    target_user_display.short_description = "Target User"
    
    def get_priority_display(self, obj):
        colors = {
            'low': 'green',
            'medium': 'orange',
            'high': 'red',
            'critical': 'darkred'
        }
        color = colors.get(obj.priority, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_priority_display()
        )
    get_priority_display.short_description = 'Priority'
    
    actions = ['mark_as_sent', 'mark_as_active', 'mark_as_inactive']
    
    def mark_as_sent(self, request, queryset):
        queryset.update(is_sent=True, sent_at=timezone.now())
    mark_as_sent.short_description = "Mark selected alerts as sent"
    
    def mark_as_active(self, request, queryset):
        queryset.update(is_active=True)
    mark_as_active.short_description = "Activate selected alerts"
    
    def mark_as_inactive(self, request, queryset):
        queryset.update(is_active=False)
    mark_as_inactive.short_description = "Deactivate selected alerts"
