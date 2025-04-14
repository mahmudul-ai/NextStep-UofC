# Importing DRF serializer tools and the models involved in user registration
from rest_framework import serializers
from .models import CustomUser, JobSeekerProfile, RecruiterProfile

# Serializer to handle user registration logic for both job seekers and recruiters
class RegistrationSerializer(serializers.ModelSerializer):
    # Extra fields expected from the frontend during registration
    ucid = serializers.IntegerField(required=False, write_only=True)  # Only needed for job seekers
    first_name = serializers.CharField(required=True)  # Ensure first name is provided
    last_name = serializers.CharField(required=True)   # Ensure last name is provided

    class Meta:
        model = CustomUser
        # Fields required from the client during sign-up
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'user_type', 'ucid']
        extra_kwargs = {'password': {'write_only': True}}  # Hide password from any GET response

    # Create method handles saving the user and any related profile info
    def create(self, validated_data):
        ucid = validated_data.pop('ucid', None)  # Extract UCID if provided (only for job seekers)
        password = validated_data.pop('password')  # Extract and handle password separately
        user = CustomUser(**validated_data)
        user.set_password(password)  # Hash the password before saving
        user.save()

        # Create associated profile based on user type
        if user.user_type == 'job_seeker':
            JobSeekerProfile.objects.create(user=user, ucid=ucid, approved=False)  # UCID and approval status
        elif user.user_type == 'recruiter':
            RecruiterProfile.objects.create(user=user)  # Empty profile for now, can be updated later

        return user  # Return the created user object
