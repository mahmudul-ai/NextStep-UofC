# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'Admin'),
        ('recruiter', 'Recruiter'),
        ('job_seeker', 'Job Seeker'),
    )
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

# Recruiter profile: holds information specific to recruiters.
class RecruiterProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Recruiter Profile: {self.user.username}"

# Job Seeker profile: includes a UCID (unique integer) and approval flag.
class JobSeekerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    ucid = models.PositiveIntegerField(null=True, blank=True)
    approved = models.BooleanField(default=False)  # Approval by admin

    def __str__(self):
        return f"Job Seeker Profile: {self.user.username}"
