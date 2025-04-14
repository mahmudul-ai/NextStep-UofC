# Importing necessary Django modules and the CustomUser model from the accounts app
from django.db import models
from accounts.models import CustomUser

# Job model stores data related to job postings
class Job(models.Model):
    title = models.CharField(max_length=255)  # Job title (e.g., Software Engineer)
    description = models.TextField()  # Full job description
    location = models.CharField(max_length=255)  # Job location (e.g., Calgary, AB)
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp of when the job was posted

    # Link to the user who posted the job; only users with 'recruiter' type should be able to post
    posted_by = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'recruiter'}
    )

    def __str__(self):
        # This will be shown in Django Admin or shell queries — makes it easier to identify jobs
        return self.title

# Application model tracks job applications made by job seekers
class Application(models.Model):
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'  # Allows reverse lookup from Job to its Applications
    )
    applicant = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'job_seeker'}  # Only job seekers can apply
    )
    cover_letter = models.TextField(blank=True, null=True)  # Optional field for a cover letter
    applied_at = models.DateTimeField(auto_now_add=True)  # Timestamp of when the application was submitted
    phone = models.CharField(max_length=20)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)

    def __str__(self):
        # Helpful string representation for logs or admin: "username applied for Job Title"
        return f"{self.applicant.username} applied for {self.job.title}"
