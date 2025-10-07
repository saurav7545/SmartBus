from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.utils import timezone

def api_health(request):
    return JsonResponse({
        'success': True,
        'service': 'SmartBus API',
        'status': 'healthy',
        'timestamp': timezone.now().isoformat()
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', api_health, name='api_health'),
    path('api/auth/', include('users.urls')),  # users app के URLs include करें
    path('api/routes/', include('route.urls')),  # route app के URLs include करें
]
