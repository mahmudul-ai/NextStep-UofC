from rest_framework import serializers
from .models import *
from django.utils import timezone

from rest_framework import serializers
from .models import *

from rest_framework import serializers
from .models import *

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterSerializer(serializers.ModelSerializer):
    user_type = serializers.ChoiceField(choices=CustomUser.USER_TYPE_CHOICES)
    password = serializers.CharField(write_only=True)
    fname = serializers.CharField(write_only=True, source='first_name')
    lname = serializers.CharField(write_only=True, source='last_name')

    # Student fields
    ucid = serializers.CharField(required=False, allow_blank=True)
    major = serializers.CharField(required=False, allow_blank=True)
    graduation_year = serializers.IntegerField(required=False, allow_null=True)

    # Employer fields
    company_name = serializers.CharField(required=False, allow_blank=True)
    industry = serializers.CharField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'email', 'password', 'user_type',
            'fname', 'lname',
            'ucid', 'major', 'graduation_year',
            'company_name', 'industry', 'website', 'description'
        ]

    def create(self, validated_data):
        user_type = validated_data.pop('user_type')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        
        # Create user
        user = CustomUser.objects.create_user(
            username=email,
            email=email,
            password=password,
            user_type=user_type,
            first_name=validated_data.pop('first_name', ''),
            last_name=validated_data.pop('last_name', '')
        )

        # Create profile (but don't include in response)
        if user_type == 'student':
            # Create the Student record
            student = Student.objects.create(
                UCID=validated_data.pop('ucid', ''),
                FName=user.first_name,
                LName=user.last_name,
                Email=user.email,
                Major=validated_data.pop('major', ''),
                GraduationYear=validated_data.pop('graduation_year', None)
            )
            
            # Try to find an available moderator for student verification
            try:
                moderator = Moderator.objects.first()
                if moderator:
                    # Add the student to the verification queue
                    VerifyApplicant.objects.create(
                        ModeratorID=moderator,
                        ApplicantUCID=student,
                        VerificationStatus='Pending',
                        VerificationDate=timezone.now().date()
                    )
            except Exception as e:
                print(f"Error adding student to verification queue: {e}")
                
        elif user_type == 'employer':
            Employer.objects.create(
                CompanyName=validated_data.pop('company_name', ''),
                Email=user.email,
                Industry=validated_data.pop('industry', ''),
                Website=validated_data.pop('website', ''),
                Description=validated_data.pop('description', ''),
                VerificationStatus='Pending'
            )

        return {
            'status': 'success',
            'email': user.email,
            'user_type': user_type
        }

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['user_type'] = user.user_type
        token['email'] = user.email
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add custom response data
        data['user_type'] = self.user.user_type
        data['email'] = self.user.email
        
        return data
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type']
    

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

class VolunteerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Volunteer
        fields = '__all__'

class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = '__all__'

class ModeratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Moderator
        fields = '__all__'

class EmployerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employer
        fields = '__all__'

class JobOpeningSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobOpening
        fields = '__all__'

class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = '__all__'

class VerifyApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerifyApplicant
        fields = '__all__'

class VerifyEmployerSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerifyEmployer
        fields = '__all__'

class ReviewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reviews
        fields = '__all__'