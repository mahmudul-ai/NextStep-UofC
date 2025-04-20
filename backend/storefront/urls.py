
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from jobs.views import JobViewSet, ApplicationViewSet  # now both viewsets are available
from accounts.views import RegistrationAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import account_view  



router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('api/account/', account_view, name='account_view'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/register/', RegistrationAPIView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
