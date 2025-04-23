from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .models import *
from .serializers import *
from .permissions import IsModerator
from rest_framework.views import APIView

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Rename 'email' to 'username' to match Django's expectations
        attrs['username'] = attrs.get('email', attrs.get('username', ''))
        return super().validate(attrs)
    
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Ensure the request data contains 'username' field
        request.data['username'] = request.data.get('email', '')
        
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Invalid credentials',
                'detail': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        user = serializer.user
        user_data = {
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': user.user_type,
        }
        
        # Get profile data without using reverse relations
        try:
            if user.user_type == 'student':
                student = Student.objects.filter(Email=user.email).first()
                if student:
                    user_data.update({
                        'ucid': student.UCID,
                        'major': student.Major,
                        'graduation_year': student.GraduationYear
                    })
                    
            elif user.user_type == 'employer':
                employer = Employer.objects.filter(Email=user.email).first()
                if employer:
                    user_data.update({
                        'company_name': employer.CompanyName,
                        'industry': employer.Industry,
                        'website': employer.Website,
                        'description': employer.Description
                    })
                    
        except Exception as e:
            print(f"Error getting profile data: {e}")
        
        return Response({
            'status': 'success',
            'token': serializer.validated_data['access'],
            'refresh_token': serializer.validated_data['refresh'],
            'user': user_data
        })

class RegistrationAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            response_data = serializer.save()
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class VolunteerViewSet(viewsets.ModelViewSet):
    queryset = Volunteer.objects.all()
    serializer_class = VolunteerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ApplicantViewSet(viewsets.ModelViewSet):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ModeratorViewSet(viewsets.ModelViewSet):
    queryset = Moderator.objects.all()
    serializer_class = ModeratorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class EmployerViewSet(viewsets.ModelViewSet):
    queryset = Employer.objects.all()
    serializer_class = EmployerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class JobOpeningViewSet(viewsets.ModelViewSet):
    queryset = JobOpening.objects.all()
    serializer_class = JobOpeningSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class VerifyApplicantViewSet(viewsets.ModelViewSet):
    queryset = VerifyApplicant.objects.all()
    serializer_class = VerifyApplicantSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class VerifyEmployerViewSet(viewsets.ModelViewSet):
    queryset = VerifyEmployer.objects.all()
    serializer_class = VerifyEmployerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ReviewsViewSet(viewsets.ModelViewSet):
    queryset = Reviews.objects.all()
    serializer_class = ReviewsSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
