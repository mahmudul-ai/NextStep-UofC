# Importing DRF's serializer tools and the relevant models
from rest_framework import serializers
from .models import Job, Application
posted_by = serializers.StringRelatedField()
# Serializer for the Job model — used to convert Job instances to/from JSON
class JobSerializer(serializers.ModelSerializer):
    posted_by = serializers.StringRelatedField() 
    class Meta:
        model = Job
        fields = '__all__'  # Include all model fields in the serialized output

        # These fields are set by the system (not by the user), so we make them read-only
        read_only_fields = ['posted_by', 'created_at']

# Serializer for the Application model — handles data validation and transformation
class ApplicationSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Application
        fields = '__all__'  # Include all fields from the Application model

        # These fields should not be edited manually — backend fills them in automatically
        read_only_fields = ['applicant', 'applied_at']
