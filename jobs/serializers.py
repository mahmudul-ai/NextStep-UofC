# jobs/serializers.py

from rest_framework import serializers
from .models import Job, Application

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
        # posted_by and created_at should be read-only as they get set automatically
        read_only_fields = ['posted_by', 'created_at']

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'
        # applicant and applied_at are set automatically by the backend
        read_only_fields = ['applicant', 'applied_at']
