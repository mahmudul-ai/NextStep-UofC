# storefront/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, RecruiterProfile, JobSeekerProfile

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'user_type', 'is_staff']

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(RecruiterProfile)
admin.site.register(JobSeekerProfile)
