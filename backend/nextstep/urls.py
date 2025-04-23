
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# from .views import account_view  
from django.conf import settings
from django.conf.urls.static import static




router = DefaultRouter()
# router.register(r'jobs', JobViewSet, basename='job')
# router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    # path('api/account/', account_view, name='account_view'),
    path('admin/', admin.site.urls),
    # path('api/', include(router.urls)),

    path('api/', include('api.urls')),    
] 

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # Serve media files in development