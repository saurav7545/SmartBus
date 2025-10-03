from django.urls import path
from .views import fixed_login, check_api, check_database, database_info

urlpatterns = [
    path('login/', fixed_login, name='login'),
    path('check/', check_api, name='check_api'),
    path('db-check/', check_database, name='check_database'),
    path('db-info/', database_info, name='database_info'),
]