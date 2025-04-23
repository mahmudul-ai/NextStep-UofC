# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
# from .models import CustomUser, RecruiterProfile, JobSeekerProfile

# # Customize the Django admin interface for CustomUser model
# class CustomUserAdmin(UserAdmin):
#     model = CustomUser
#     # Display these fields in the admin user list view
#     list_display = ['username', 'email', 'user_type', 'is_staff']

# # Register your custom user and profile models so they appear in the Django admin panel
# admin.site.register(CustomUser, CustomUserAdmin)  # Register with the custom config above
# admin.site.register(RecruiterProfile)             # Default admin view for recruiter profiles
# admin.site.register(JobSeekerProfile)             # Default admin view for job seeker profiles

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
# Customize the Django admin interface for CustomUser model
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    # Display these fields in the admin user list view
    list_display = ['username', 'email', 'user_type', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('user_type',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('user_type',)}),
    )

# Register the CustomUser model with the custom admin view
admin.site.register(CustomUser, CustomUserAdmin)

# Register the other models in the admin panel with default configurations
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('UCID', 'FName', 'LName', 'Email', 'Major', 'GraduationYear')

@admin.register(Moderator)
class ModeratorAdmin(admin.ModelAdmin):
    list_display = ('ModeratorID',)

@admin.register(Employer)
class EmployerAdmin(admin.ModelAdmin):
    list_display = ('CompanyName', 'Email', 'Industry', 'Website', 'Description','VerificationStatus')

@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ('SUCID', 'CGPA', 'Resume', 'VerificationStatus')

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('VUCID', 'Content', 'Date')

@admin.register(Volunteer)
class VolunteerAdmin(admin.ModelAdmin):
    list_display = ('SUCID', 'Hours')

@admin.register(JobOpening)
class JobOpeningAdmin(admin.ModelAdmin):
    list_display = ('Employer', 'JobTitle', 'Description', 'Salary', 'Location', 'Deadline')

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('ApplicantUCID', 'JobID', 'EmployerID', 'Status', 'DateApplied')

@admin.register(VerifyApplicant)
class VerifyApplicantAdmin(admin.ModelAdmin):
    list_display = ('ModeratorID', 'ApplicantUCID', 'VerificationStatus', 'VerificationDate')

@admin.register(VerifyEmployer)
class VerifyEmployerAdmin(admin.ModelAdmin):
    list_display = ('ModeratorID', 'EmployerID', 'VerificationStatus', 'VerificationDate')

@admin.register(Reviews)
class JobModerationAdmin(admin.ModelAdmin):
    list_display = ('ModeratorID', 'JobID', 'EmployerID')
