# Import Django admin tools and your custom user/profile models
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, RecruiterProfile, JobSeekerProfile

# Customize the Django admin interface for CustomUser model
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    # Display these fields in the admin user list view
    list_display = ['username', 'email', 'user_type', 'is_staff']

# Register your custom user and profile models so they appear in the Django admin panel
admin.site.register(CustomUser, CustomUserAdmin)  # Register with the custom config above
admin.site.register(RecruiterProfile)             # Default admin view for recruiter profiles
admin.site.register(JobSeekerProfile)             # Default admin view for job seeker profiles
