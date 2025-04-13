# accounts/serializers.py
from rest_framework import serializers
from .models import CustomUser, JobSeekerProfile, RecruiterProfile

class RegistrationSerializer(serializers.ModelSerializer):
    # Expect additional fields from the frontend
    ucid = serializers.IntegerField(required=False, write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'user_type', 'ucid']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        ucid = validated_data.pop('ucid', None)
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()

        # If the user is a job seeker, create a JobSeekerProfile
        if user.user_type == 'job_seeker':
            JobSeekerProfile.objects.create(user=user, ucid=ucid, approved=False)
        # Optionally, you can create an empty RecruiterProfile for recruiters
        elif user.user_type == 'recruiter':
            RecruiterProfile.objects.create(user=user)
        return user
