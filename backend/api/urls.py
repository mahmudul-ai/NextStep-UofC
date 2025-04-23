from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import LoginView, RegistrationAPIView
from . import views

router = DefaultRouter()
router.register(r'students', views.StudentViewSet)
router.register(r'posts', views.PostViewSet)
router.register(r'volunteers', views.VolunteerViewSet)
router.register(r'applicants', views.ApplicantViewSet)
router.register(r'moderators', views.ModeratorViewSet)
router.register(r'employers', views.EmployerViewSet)
router.register(r'job-opening', views.JobOpeningViewSet)
router.register(r'job-applications', views.JobApplicationViewSet)
router.register(r'applicant-verifications', views.VerifyApplicantViewSet)
router.register(r'employer-verification', views.VerifyEmployerViewSet)
router.register(r'reviews', views.ReviewsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegistrationAPIView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
