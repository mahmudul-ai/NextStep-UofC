from rest_framework import serializers
from .models import *

class RegisterSerializer(serializers.ModelSerializer):
    user_type = serializers.ChoiceField(choices=CustomUser.USER_TYPE_CHOICES)
    password = serializers.CharField(write_only=True)

    # extra fields for student
    major = serializers.CharField(required=False)
    graduation_year = serializers.IntegerField(required=False)

    # extra fields for employer
    company_name = serializers.CharField(required=False)
    industry = serializers.CharField(required=False)
    website = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'user_type',
                  'major', 'graduation_year',
                  'company_name', 'industry', 'website', 'description')

    def create(self, validated_data):
        user_type = validated_data.pop('user_type')
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=password,
            user_type=user_type
        )

        if user_type == 'student':
            Student.objects.create(
                UCID=user.username,
                Name=user.username,
                Email=user.email,
                Major=validated_data.get('major'),
                GraduationYear=validated_data.get('graduation_year')
            )

        elif user_type == 'employer':
            Employer.objects.create(
                Email=user.email,
                CompanyName=validated_data.get('company_name'),
                Industry=validated_data.get('industry'),
                Website=validated_data.get('website'),
                Description=validated_data.get('description'),
                VerificationStatus='Pending'
            )

        return user

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

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'

class VerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Verification
        fields = '__all__'

class EmployerVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployerVerification
        fields = '__all__'

class JobModerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobModeration
        fields = '__all__'
