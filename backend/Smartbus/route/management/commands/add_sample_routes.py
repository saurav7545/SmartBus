from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import time, timedelta
from route.models import Route, RouteStop, BusRoute
from users.models import User, Bus
import uuid

class Command(BaseCommand):
    help = 'Add sample routes and bus data for SmartBus application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing route data before adding new data',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('🗑️ Clearing existing data...'))
            Route.objects.all().delete()
            RouteStop.objects.all().delete()
            BusRoute.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✅ Existing data cleared'))

        self.stdout.write(self.style.HTTP_INFO('🚌 Adding sample SmartBus routes data...'))
        
        # Sample routes for major Indian cities
        sample_routes = [
            {
                'route_name': 'Delhi Express',
                'source': 'Delhi',
                'destination': 'Dehradun',
                'distance': 248.5,
                'duration': '4:30:00',
                'route_type': 'intercity',
                'stops': [
                    {'name': 'ISBT Delhi', 'sequence': 1, 'lat': 28.6648, 'lng': 77.2426, 'distance': 0, 'time': '06:00'},
                    {'name': 'Ghaziabad', 'sequence': 2, 'lat': 28.6692, 'lng': 77.4538, 'distance': 25.5, 'time': '06:45', 'major': True},
                    {'name': 'Muzaffarnagar', 'sequence': 3, 'lat': 29.4726, 'lng': 77.7085, 'distance': 98.2, 'time': '08:30', 'major': True},
                    {'name': 'Roorkee', 'sequence': 4, 'lat': 29.8543, 'lng': 77.8880, 'distance': 178.3, 'time': '09:45'},
                    {'name': 'Haridwar', 'sequence': 5, 'lat': 29.9457, 'lng': 78.1642, 'distance': 214.7, 'time': '10:15', 'major': True},
                    {'name': 'Dehradun', 'sequence': 6, 'lat': 30.3165, 'lng': 78.0322, 'distance': 248.5, 'time': '10:30'},
                ]
            },
            {
                'route_name': 'Mumbai Metro',
                'source': 'Mumbai',
                'destination': 'Pune',
                'distance': 148.2,
                'duration': '3:00:00',
                'route_type': 'intercity',
                'stops': [
                    {'name': 'Mumbai Central', 'sequence': 1, 'lat': 18.9690, 'lng': 72.8205, 'distance': 0, 'time': '07:00'},
                    {'name': 'Kalyan', 'sequence': 2, 'lat': 19.2437, 'lng': 73.1355, 'distance': 54.8, 'time': '08:00', 'major': True},
                    {'name': 'Lonavala', 'sequence': 3, 'lat': 18.7537, 'lng': 73.4063, 'distance': 96.4, 'time': '08:45', 'major': True},
                    {'name': 'Khadki', 'sequence': 4, 'lat': 18.5626, 'lng': 73.8087, 'distance': 135.2, 'time': '09:30'},
                    {'name': 'Pune Station', 'sequence': 5, 'lat': 18.5204, 'lng': 73.8567, 'distance': 148.2, 'time': '10:00'},
                ]
            },
            {
                'route_name': 'Bangalore IT Corridor',
                'source': 'Bangalore',
                'destination': 'Mysore',
                'distance': 144.6,
                'duration': '3:15:00',
                'route_type': 'intercity',
                'stops': [
                    {'name': 'Majestic Bus Stand', 'sequence': 1, 'lat': 12.9762, 'lng': 77.5713, 'distance': 0, 'time': '06:30'},
                    {'name': 'Electronic City', 'sequence': 2, 'lat': 12.8456, 'lng': 77.6603, 'distance': 18.5, 'time': '07:00'},
                    {'name': 'Ramanagara', 'sequence': 3, 'lat': 12.7218, 'lng': 77.2804, 'distance': 49.7, 'time': '07:45', 'major': True},
                    {'name': 'Channapatna', 'sequence': 4, 'lat': 12.6518, 'lng': 77.2067, 'distance': 60.8, 'time': '08:15'},
                    {'name': 'Maddur', 'sequence': 5, 'lat': 12.5847, 'lng': 77.0436, 'distance': 91.2, 'time': '09:00', 'major': True},
                    {'name': 'Mandya', 'sequence': 6, 'lat': 12.5214, 'lng': 76.8956, 'distance': 101.4, 'time': '09:30'},
                    {'name': 'Mysore Palace', 'sequence': 7, 'lat': 12.3051, 'lng': 76.6553, 'distance': 144.6, 'time': '09:45'},
                ]
            },
            {
                'route_name': 'Chennai Express',
                'source': 'Chennai',
                'destination': 'Coimbatore',
                'distance': 504.2,
                'duration': '8:30:00',
                'route_type': 'interstate',
                'stops': [
                    {'name': 'Chennai Egmore', 'sequence': 1, 'lat': 13.0827, 'lng': 80.2707, 'distance': 0, 'time': '22:00'},
                    {'name': 'Kanchipuram', 'sequence': 2, 'lat': 12.8342, 'lng': 79.7036, 'distance': 72.4, 'time': '23:30', 'major': True},
                    {'name': 'Vellore', 'sequence': 3, 'lat': 12.9165, 'lng': 79.1325, 'distance': 138.7, 'time': '01:00', 'major': True},
                    {'name': 'Salem', 'sequence': 4, 'lat': 11.6643, 'lng': 78.1460, 'distance': 339.8, 'time': '04:30', 'major': True},
                    {'name': 'Erode', 'sequence': 5, 'lat': 11.3410, 'lng': 77.7172, 'distance': 403.5, 'time': '05:45'},
                    {'name': 'Tirupur', 'sequence': 6, 'lat': 11.1085, 'lng': 77.3411, 'distance': 448.3, 'time': '06:15', 'major': True},
                    {'name': 'Coimbatore', 'sequence': 7, 'lat': 11.0168, 'lng': 76.9558, 'distance': 504.2, 'time': '06:30'},
                ]
            },
            {
                'route_name': 'Kolkata Metro',
                'source': 'Kolkata',
                'destination': 'Durgapur',
                'distance': 158.3,
                'duration': '3:45:00',
                'route_type': 'intercity',
                'stops': [
                    {'name': 'Esplanade', 'sequence': 1, 'lat': 22.5726, 'lng': 88.3639, 'distance': 0, 'time': '06:00'},
                    {'name': 'Hooghly', 'sequence': 2, 'lat': 22.9089, 'lng': 88.3967, 'distance': 42.1, 'time': '07:00', 'major': True},
                    {'name': 'Burdwan', 'sequence': 3, 'lat': 23.2324, 'lng': 87.8615, 'distance': 106.7, 'time': '08:15', 'major': True},
                    {'name': 'Durgapur Station', 'sequence': 4, 'lat': 23.4895, 'lng': 87.3117, 'distance': 158.3, 'time': '09:45'},
                ]
            },
            {
                'route_name': 'Hyderabad Tech Valley',
                'source': 'Hyderabad',
                'destination': 'Vijayawada',
                'distance': 275.8,
                'duration': '5:00:00',
                'route_type': 'intercity',
                'stops': [
                    {'name': 'Secunderabad', 'sequence': 1, 'lat': 17.4399, 'lng': 78.4983, 'distance': 0, 'time': '05:30'},
                    {'name': 'Warangal', 'sequence': 2, 'lat': 17.9689, 'lng': 79.5941, 'distance': 148.2, 'time': '08:00', 'major': True},
                    {'name': 'Khammam', 'sequence': 3, 'lat': 17.2473, 'lng': 80.1514, 'distance': 193.5, 'time': '09:00', 'major': True},
                    {'name': 'Vijayawada', 'sequence': 4, 'lat': 16.5062, 'lng': 80.6480, 'distance': 275.8, 'time': '10:30'},
                ]
            },
            {
                'route_name': 'Rajasthan Royal',
                'source': 'Jaipur',
                'destination': 'Udaipur',
                'distance': 393.6,
                'duration': '7:00:00',
                'route_type': 'intercity',
                'stops': [
                    {'name': 'Jaipur Bus Stand', 'sequence': 1, 'lat': 26.9124, 'lng': 75.7873, 'distance': 0, 'time': '05:00'},
                    {'name': 'Ajmer', 'sequence': 2, 'lat': 26.4499, 'lng': 74.6399, 'distance': 135.4, 'time': '07:30', 'major': True},
                    {'name': 'Kankroli', 'sequence': 3, 'lat': 25.2138, 'lng': 73.7230, 'distance': 285.7, 'time': '10:00', 'major': True},
                    {'name': 'Udaipur City Palace', 'sequence': 4, 'lat': 24.5854, 'lng': 73.6836, 'distance': 393.6, 'time': '12:00'},
                ]
            },
            {
                'route_name': 'Ahmedabad Express',
                'source': 'Ahmedabad',
                'destination': 'Surat',
                'distance': 263.2,
                'duration': '4:15:00',
                'route_type': 'intercity',
                'stops': [
                    {'name': 'Ahmedabad Central', 'sequence': 1, 'lat': 23.0225, 'lng': 72.5714, 'distance': 0, 'time': '06:00'},
                    {'name': 'Anand', 'sequence': 2, 'lat': 22.5645, 'lng': 72.9289, 'distance': 64.8, 'time': '07:15', 'major': True},
                    {'name': 'Vadodara', 'sequence': 3, 'lat': 22.3072, 'lng': 73.1812, 'distance': 99.2, 'time': '08:00', 'major': True},
                    {'name': 'Bharuch', 'sequence': 4, 'lat': 21.7051, 'lng': 72.9959, 'distance': 158.7, 'time': '09:00', 'major': True},
                    {'name': 'Navsari', 'sequence': 5, 'lat': 20.9463, 'lng': 72.9342, 'distance': 208.4, 'time': '09:45'},
                    {'name': 'Surat Station', 'sequence': 6, 'lat': 21.1702, 'lng': 72.8311, 'distance': 263.2, 'time': '10:15'},
                ]
            }
        ]

        created_routes = []
        
        for route_data in sample_routes:
            # Create route
            route = Route.objects.create(
                route_name=route_data['route_name'],
                source=route_data['source'],
                destination=route_data['destination'],
                distance=route_data['distance'],
                estimated_duration=timedelta(hours=int(route_data['duration'].split(':')[0]), 
                                           minutes=int(route_data['duration'].split(':')[1])),
                route_type=route_data['route_type'],
                fare_per_km=3.5 if route_data['route_type'] == 'intercity' else 2.5,
                total_fare=0  # Will be auto-calculated
            )
            
            # Create route stops
            for stop_data in route_data['stops']:
                fare_from_source = stop_data['distance'] * (3.5 if route_data['route_type'] == 'intercity' else 2.5)
                
                RouteStop.objects.create(
                    route=route,
                    stop_name=stop_data['name'],
                    stop_sequence=stop_data['sequence'],
                    latitude=stop_data['lat'],
                    longitude=stop_data['lng'],
                    distance_from_source=stop_data['distance'],
                    estimated_arrival_time=time.fromisoformat(stop_data['time']),
                    fare_from_source=fare_from_source,
                    is_major_stop=stop_data.get('major', False)
                )
            
            created_routes.append(route)
            self.stdout.write(f'✅ Created route: {route.route_name}')

        # Create sample bus operators and assign them to routes
        self.stdout.write(self.style.HTTP_INFO('🚌 Creating sample bus operators...'))
        
        bus_operators_data = [
            {'name': 'Raj Travels', 'email': 'raj@travels.com', 'bus_name': 'Volvo AC', 'bus_number': 'DL01AB1234'},
            {'name': 'City Express', 'email': 'city@express.com', 'bus_name': 'Mercedes Luxury', 'bus_number': 'MH12CD5678'},
            {'name': 'Royal Roadways', 'email': 'royal@roadways.com', 'bus_name': 'Tata Marcopolo', 'bus_number': 'KA03EF9012'},
            {'name': 'Metro Link', 'email': 'metro@link.com', 'bus_name': 'Ashok Leyland', 'bus_number': 'TN07GH3456'},
            {'name': 'Speed Travels', 'email': 'speed@travels.com', 'bus_name': 'Scania AC', 'bus_number': 'WB04IJ7890'},
            {'name': 'Comfort Coaches', 'email': 'comfort@coaches.com', 'bus_name': 'Volvo Multi-Axle', 'bus_number': 'AP05KL1234'},
            {'name': 'Highway Express', 'email': 'highway@express.com', 'bus_name': 'MAN CLA', 'bus_number': 'RJ14MN5678'},
            {'name': 'Gujarat Travels', 'email': 'gujarat@travels.com', 'bus_name': 'BharatBenz', 'bus_number': 'GJ01OP9012'},
        ]

        created_buses = []
        for i, operator_data in enumerate(bus_operators_data):
            # Create user (bus operator)
            user = User.objects.create(
                id=str(uuid.uuid4()),
                name=operator_data['name'],
                email=operator_data['email'],
                password='password123',  # Will be hashed automatically
                user_type='bus'
            )
            
            # Create bus
            bus = Bus.objects.create(
                id=str(uuid.uuid4()),
                user=user,
                bus_name=operator_data['bus_name'],
                bus_number=operator_data['bus_number'],
                route=created_routes[i % len(created_routes)].route_name  # Assign to different routes
            )
            
            # Create BusRoute assignment
            route = created_routes[i % len(created_routes)]
            departure_times = ['06:00', '07:30', '09:00', '14:00', '18:00', '20:30', '22:00', '23:30']
            departure_time = time.fromisoformat(departure_times[i % len(departure_times)])
            
            # Calculate arrival time based on estimated duration
            arrival_datetime = (timezone.now().replace(hour=departure_time.hour, minute=departure_time.minute) + 
                              route.estimated_duration)
            arrival_time = arrival_datetime.time()
            
            BusRoute.objects.create(
                bus=bus,
                route=route,
                departure_time=departure_time,
                arrival_time=arrival_time,
                frequency_minutes=60,
                is_operational=True,
                effective_from=timezone.now().date()
            )
            
            created_buses.append(bus)
            self.stdout.write(f'✅ Created bus operator: {operator_data["name"]} - {operator_data["bus_number"]}')

        # Summary
        self.stdout.write(self.style.SUCCESS(f'\n🎉 Sample data creation completed!'))
        self.stdout.write(self.style.SUCCESS(f'📊 Created {len(created_routes)} routes'))
        self.stdout.write(self.style.SUCCESS(f'🚌 Created {len(created_buses)} bus operators'))
        self.stdout.write(self.style.SUCCESS(f'🛣️ Created {sum(len(r["stops"]) for r in sample_routes)} route stops'))
        
        self.stdout.write(self.style.HTTP_INFO('\n🔍 You can now test the APIs with real data!'))
        self.stdout.write(self.style.HTTP_INFO('Example searches:'))
        self.stdout.write('  - Delhi to Dehradun')
        self.stdout.write('  - Mumbai to Pune') 
        self.stdout.write('  - Chennai to Coimbatore')
        self.stdout.write('  - Bangalore to Mysore')