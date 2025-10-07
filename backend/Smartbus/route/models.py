from django.db import models
from django.contrib.auth.models import User


class Route(models.Model):
    """Bus Route Model"""
    route_id = models.AutoField(primary_key=True)
    route_name = models.CharField(max_length=100, unique=True)
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    distance = models.FloatField(help_text="Distance in kilometers")
    estimated_duration = models.DurationField(help_text="Estimated travel time")
    fare_per_km = models.DecimalField(max_digits=10, decimal_places=2, default=2.5)
    total_fare = models.DecimalField(max_digits=10, decimal_places=2)
    route_type = models.CharField(
        max_length=20,
        choices=[
            ('local', 'Local'),
            ('intercity', 'Intercity'),
            ('interstate', 'Interstate'),
        ],
        default='local'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'routes'
        ordering = ['route_name']

    def __str__(self):
        return f"{self.route_name}: {self.source} → {self.destination}"

    def save(self, *args, **kwargs):
        # Auto-calculate total fare based on distance
        if self.distance and self.fare_per_km:
            self.total_fare = self.distance * self.fare_per_km
        super().save(*args, **kwargs)


class RouteStop(models.Model):
    """Individual stops on a route"""
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='stops')
    stop_name = models.CharField(max_length=100)
    stop_sequence = models.PositiveIntegerField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    distance_from_source = models.FloatField(default=0.0, help_text="Distance from source in km")
    estimated_arrival_time = models.TimeField(null=True, blank=True)
    fare_from_source = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    is_major_stop = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'route_stops'
        ordering = ['route', 'stop_sequence']
        unique_together = ['route', 'stop_sequence']

    def __str__(self):
        return f"{self.route.route_name} - Stop {self.stop_sequence}: {self.stop_name}"


class BusRoute(models.Model):
    """Association between Bus and Route with scheduling"""
    bus = models.ForeignKey('users.Bus', on_delete=models.CASCADE, related_name='assigned_routes')
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='assigned_buses')
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    frequency_minutes = models.PositiveIntegerField(default=60, help_text="Frequency in minutes")
    is_operational = models.BooleanField(default=True)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bus_routes'
        unique_together = ['bus', 'route', 'departure_time']

    def __str__(self):
        return f"{self.bus.bus_number} - {self.route.route_name} ({self.departure_time})"


class BusStatus(models.Model):
    """Bus operational status and information"""
    STATUS_CHOICES = [
        ('active', 'Active/Running'),
        ('idle', 'Idle/Stopped'),
        ('maintenance', 'Under Maintenance'),
        ('offline', 'Offline'),
        ('delayed', 'Delayed'),
        ('breakdown', 'Breakdown'),
    ]
    
    bus = models.OneToOneField('users.Bus', on_delete=models.CASCADE, related_name='status')
    current_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    driver_name = models.CharField(max_length=100, blank=True)
    driver_phone = models.CharField(max_length=15, blank=True)
    passenger_count = models.IntegerField(default=0)
    max_capacity = models.IntegerField(default=50)
    last_maintenance = models.DateField(null=True, blank=True)
    next_maintenance = models.DateField(null=True, blank=True)
    fuel_level = models.FloatField(default=100.0, help_text="Fuel percentage")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bus_status'

    def __str__(self):
        return f"{self.bus.bus_number} - {self.current_status}"


class LiveRouteTracking(models.Model):
    """Enhanced real-time tracking of buses with advanced features"""
    bus_route = models.ForeignKey(BusRoute, on_delete=models.CASCADE, related_name='live_tracking')
    current_stop = models.ForeignKey(RouteStop, on_delete=models.SET_NULL, null=True, blank=True)
    next_stop = models.ForeignKey(RouteStop, on_delete=models.SET_NULL, null=True, blank=True, related_name='next_stop_tracking')
    
    # GPS Coordinates
    current_latitude = models.FloatField()
    current_longitude = models.FloatField()
    altitude = models.FloatField(default=0.0, help_text="Altitude in meters")
    accuracy = models.FloatField(default=0.0, help_text="GPS accuracy in meters")
    
    # Movement Data
    current_speed = models.FloatField(default=0.0, help_text="Speed in km/h")
    average_speed = models.FloatField(default=0.0, help_text="Average speed in km/h")
    bearing = models.FloatField(default=0.0, help_text="Direction in degrees")
    
    # Route Progress
    direction = models.CharField(max_length=20, choices=[
        ('to_destination', 'To Destination'),
        ('to_source', 'To Source'),
        ('circular', 'Circular Route'),
    ])
    route_progress_percent = models.FloatField(default=0.0, help_text="Route completion percentage")
    distance_covered = models.FloatField(default=0.0, help_text="Distance covered in km")
    distance_remaining = models.FloatField(default=0.0, help_text="Distance remaining in km")
    
    # Timing & ETA
    estimated_arrival_next_stop = models.DateTimeField(null=True, blank=True)
    estimated_arrival_destination = models.DateTimeField(null=True, blank=True)
    delay_minutes = models.IntegerField(default=0, help_text="Delay in minutes (negative for early)")
    
    # Status Flags
    is_active = models.BooleanField(default=True)
    is_moving = models.BooleanField(default=False)
    is_delayed = models.BooleanField(default=False)
    engine_status = models.BooleanField(default=True, help_text="Engine on/off")
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)
    last_movement = models.DateTimeField(null=True, blank=True)
    trip_start_time = models.DateTimeField(null=True, blank=True)
    
    # Additional Info
    weather_condition = models.CharField(max_length=50, blank=True)
    traffic_condition = models.CharField(max_length=50, blank=True, choices=[
        ('light', 'Light Traffic'),
        ('moderate', 'Moderate Traffic'),
        ('heavy', 'Heavy Traffic'),
        ('jam', 'Traffic Jam'),
    ])
    
    class Meta:
        db_table = 'live_route_tracking'
        ordering = ['-last_updated']
        indexes = [
            models.Index(fields=['bus_route', '-last_updated']),
            models.Index(fields=['is_active', 'is_moving']),
        ]

    def __str__(self):
        return f"{self.bus_route.bus.bus_number} - Live on {self.bus_route.route.route_name}"

    @property
    def current_location_display(self):
        return f"Lat: {self.current_latitude:.6f}, Lng: {self.current_longitude:.6f}"
    
    @property
    def eta_display(self):
        if self.estimated_arrival_destination:
            return self.estimated_arrival_destination.strftime('%H:%M')
        return 'N/A'
        
    @property
    def delay_status(self):
        if self.delay_minutes > 5:
            return 'delayed'
        elif self.delay_minutes < -5:
            return 'early'
        return 'on_time'


class FavoriteRoute(models.Model):
    """User's favorite routes for quick access"""
    user_email = models.EmailField(help_text="User email for identification")
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='favorited_by')
    bus_route = models.ForeignKey(BusRoute, on_delete=models.CASCADE, null=True, blank=True, related_name='favorited_bus')
    nickname = models.CharField(max_length=100, blank=True, help_text="User-given nickname")
    notification_enabled = models.BooleanField(default=True)
    notification_time_before = models.IntegerField(default=10, help_text="Minutes before arrival to notify")
    created_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'favorite_routes'
        unique_together = ['user_email', 'route']
        ordering = ['-last_accessed']

    def __str__(self):
        display_name = self.nickname if self.nickname else self.route.route_name
        return f"{self.user_email} - {display_name}"


class BusAlert(models.Model):
    """System alerts and notifications"""
    ALERT_TYPES = [
        ('arrival', 'Bus Arriving'),
        ('delay', 'Bus Delayed'),
        ('breakdown', 'Bus Breakdown'),
        ('route_change', 'Route Changed'),
        ('maintenance', 'Maintenance Alert'),
        ('traffic', 'Traffic Update'),
        ('weather', 'Weather Alert'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low Priority'),
        ('medium', 'Medium Priority'),
        ('high', 'High Priority'),
        ('critical', 'Critical Alert'),
    ]
    
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Related Objects
    bus_route = models.ForeignKey(BusRoute, on_delete=models.CASCADE, null=True, blank=True)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, null=True, blank=True)
    
    # Targeting
    target_user_email = models.EmailField(blank=True, help_text="Specific user, blank for broadcast")
    target_route = models.ForeignKey(Route, on_delete=models.CASCADE, null=True, blank=True, related_name='targeted_alerts')
    
    # Status
    is_active = models.BooleanField(default=True)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bus_alerts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['alert_type', 'is_active']),
            models.Index(fields=['target_user_email', 'is_sent']),
        ]

    def __str__(self):
        return f"{self.alert_type.title()}: {self.title}"
