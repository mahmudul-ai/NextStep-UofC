from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('employer', 'Employer'),
    )
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='student')

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    UCID = models.CharField(max_length=8, unique=True, db_column='UCID')
    Major = models.CharField(max_length=255, null=True, blank=True, db_column='Major')
    GraduationYear = models.IntegerField(null=True, blank=True, db_column='GraduationYear')

    class Meta:
        db_table = 'student'

    def __str__(self):
        return self.user.get_full_name()


class Moderator(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, primary_key=True)

    class Meta:
        db_table = 'moderator'

    def __str__(self):
        return f"{self.student.Name} (Moderator)"



class Employer(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    CompanyName = models.CharField(max_length=255, db_column='CompanyName')
    Industry = models.CharField(max_length=255, null=True, blank=True, db_column='Industry')
    Website = models.URLField(null=True, blank=True, db_column='Website')
    Description = models.TextField(null=True, blank=True, db_column='Description')
    VerificationStatus = models.CharField(max_length=50, db_column='VerificationStatus')

    class Meta:
        db_table = 'employer'

    def __str__(self):
        return self.CompanyName


class Applicant(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, primary_key=True, db_column='SUCID')
    CGPA = models.DecimalField(max_digits=3, decimal_places=2, db_column='CGPA')
    Resume = models.FileField(upload_to="resume/", db_column='Resume')
    VerificationStatus = models.CharField(max_length=50, db_column='VerificationStatus')

    class Meta:
        db_table = 'applicant'


class Post(models.Model):
    PostID = models.AutoField(primary_key=True, db_column='PostID')
    VUCID = models.ForeignKey(Student, on_delete=models.CASCADE, db_column='VUCID')
    Content = models.TextField(db_column='Content')
    Date = models.DateField(db_column='Date')

    class Meta:
        db_table = 'post'


class Volunteer(models.Model):
    SUCID = models.OneToOneField(Student, on_delete=models.CASCADE, primary_key=True, db_column='SUCID')
    Hours = models.IntegerField(db_column='Hours')

    class Meta:
        db_table = 'volunteer'


class Job(models.Model):
    JobID = models.AutoField(primary_key=True, db_column='JobID')
    Employer = models.ForeignKey(Employer, on_delete=models.CASCADE, db_column='EmployerID')
    JobTitle = models.CharField(max_length=255, db_column='JobTitle')
    Description = models.TextField(db_column='Description')
    Salary = models.DecimalField(max_digits=10, decimal_places=2, db_column='Salary')
    Location = models.CharField(max_length=255, db_column='Location')
    Deadline = models.DateField(db_column='Deadline')

    class Meta:
        db_table = 'job'


class Application(models.Model):
    ApplicationID = models.AutoField(primary_key=True, db_column='ApplicationID')
    ApplicantUCID = models.ForeignKey(Student, on_delete=models.CASCADE, db_column='ApplicantUCID')
    Job = models.ForeignKey(Job, on_delete=models.CASCADE, db_column='JobID')
    Employer = models.ForeignKey(Employer, on_delete=models.CASCADE, db_column='EmployerID')
    Status = models.CharField(max_length=50, db_column='Status')
    DateApplied = models.DateField(db_column='DateApplied')

    class Meta:
        db_table = 'application'


class Verification(models.Model):
    VID = models.AutoField(primary_key=True, db_column='VID')
    Moderator = models.ForeignKey(Moderator, on_delete=models.CASCADE, db_column='ModeratorID')
    ApplicantUCID = models.ForeignKey(Student, on_delete=models.CASCADE, db_column='ApplicantUCID')
    VerificationStatus = models.CharField(max_length=50, db_column='VerificationStatus')
    VerificationDate = models.DateField(db_column='VerificationDate')

    class Meta:
        db_table = 'verification'


class EmployerVerification(models.Model):
    VID = models.AutoField(primary_key=True, db_column='VID')
    Moderator = models.ForeignKey(Moderator, on_delete=models.CASCADE, db_column='ModeratorID')
    Employer = models.ForeignKey(Employer, on_delete=models.CASCADE, db_column='EmployerID')
    VerificationStatus = models.CharField(max_length=50, db_column='VerificationStatus')
    VerificationDate = models.DateField(db_column='VerificationDate')

    class Meta:
        db_table = 'employer_verification'


class JobModeration(models.Model):
    Moderator = models.ForeignKey(Moderator, on_delete=models.CASCADE, db_column='ModeratorID')
    Job = models.ForeignKey(Job, on_delete=models.CASCADE, db_column='JobID')
    Employer = models.ForeignKey(Employer, on_delete=models.CASCADE, db_column='EmployerID')

    class Meta:
        db_table = 'job_moderation'
        unique_together = ('Moderator', 'Job', 'Employer')
