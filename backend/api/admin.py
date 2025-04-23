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
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

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
    
    # Define a signal handler to auto-approve moderator's student verification
    @receiver(post_save, sender=Moderator)
    def auto_approve_student_verification(sender, instance, created, **kwargs):
        if created:  # Only on creation, not updates
            try:
                student = instance.ModeratorID
                
                # Check if there's a pending verification for this student
                pending_verification = VerifyApplicant.objects.filter(
                    ApplicantUCID=student, 
                    VerificationStatus='Pending'
                ).first()
                
                if pending_verification:
                    # Update existing verification to Approved
                    pending_verification.VerificationStatus = 'Approved'
                    pending_verification.VerificationDate = timezone.now().date()
                    pending_verification.save()
                else:
                    # Find a moderator for verification (can even use the new moderator)
                    moderator = Moderator.objects.exclude(ModeratorID=student.UCID).first() or instance
                    
                    # Create a new approved verification
                    VerifyApplicant.objects.create(
                        ModeratorID=moderator,
                        ApplicantUCID=student,
                        VerificationStatus='Approved',
                        VerificationDate=timezone.now().date()
                    )
                
                # If the student has a related Student record, update it too
                if hasattr(student, 'verificationstatus'):
                    student.verificationstatus = 'Approved'
                    student.save()
                    
                print(f"Auto-approved verification for student {student.UCID} who became a moderator")
                
            except Exception as e:
                print(f"Error auto-approving moderator's student verification: {e}")

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
