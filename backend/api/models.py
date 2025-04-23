from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('employer', 'Employer'),
    )
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='student')
    bio = models.TextField(blank=True, null=True)
    pdf_file = models.FileField(upload_to="resumes/", null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class Student(models.Model):
    # user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    UCID = models.IntegerField(
        unique=True,
        db_column='UCID',
        primary_key=True,
        validators=[
            MaxValueValidator(39999999),  # Maximum 8 digits
            MinValueValidator(30000000)   # Minimum 8 digits (if required)
        ]
    )
    FName = models.CharField(max_length=255, db_column='FName')
    LName = models.CharField(max_length=255, db_column='LName')
    Email = models.EmailField(max_length=255, unique=True, db_column='Email')
    Major = models.CharField(max_length=255, null=True, blank=True, db_column='Major')
    GraduationYear = models.IntegerField(null=True, blank=True, db_column='GraduationYear')

    class Meta:
        db_table = 'student'

    def __str__(self):
        return f'{self.FName} {self.LName} ({self.UCID})'


class Moderator(models.Model):
    ModeratorID  = models.OneToOneField(Student, on_delete=models.CASCADE, primary_key=True, db_column='ModeratorID')

    class Meta:
        db_table = 'moderator'

    def __str__(self):
        return f"{self.student.Name} (Moderator)"



class Employer(models.Model):
    # user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    EmployerID = models.AutoField(primary_key=True, db_column='EmployerID')
    CompanyName = models.CharField(max_length=255, db_column='CompanyName')
    Email = models.EmailField(max_length=255, unique=True, db_column='Email') 
    Industry = models.CharField(max_length=255, null=True, blank=True, db_column='Industry')
    Website = models.URLField(null=True, blank=True, db_column='Website')  #new
    Description = models.TextField(null=True, blank=True, db_column='Description')
    VerificationStatus = models.CharField(max_length=50, db_column='VerificationStatus')

    class Meta:
        db_table = 'employer'

    def __str__(self):
        return self.CompanyName


class Applicant(models.Model):
    SUCID = models.OneToOneField(Student, on_delete=models.CASCADE, primary_key=True, db_column='SUCID')
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


class JobOpening(models.Model):
    JobID = models.AutoField(primary_key=True, db_column='JobID')
    Employer = models.ForeignKey(Employer, on_delete=models.CASCADE, db_column='EmployerID')
    JobTitle = models.CharField(max_length=255, db_column='JobTitle')
    Description = models.TextField(db_column='Description')
    Salary = models.DecimalField(max_digits=10, decimal_places=2, db_column='Salary')
    Location = models.CharField(max_length=255, db_column='Location')
    Deadline = models.DateField(db_column='Deadline')

    class Meta:
        db_table = 'job_opening'


class JobApplication(models.Model):
    ApplicationID = models.AutoField(primary_key=True, db_column='ApplicationID')
    ApplicantUCID = models.ForeignKey(Student, on_delete=models.CASCADE, db_column='ApplicantUCID')
    JobID = models.ForeignKey(JobOpening, on_delete=models.CASCADE, db_column='JobID')
    EmployerID = models.ForeignKey(Employer, on_delete=models.CASCADE, db_column='EmployerID')
    Status = models.CharField(max_length=50, db_column='Status')
    DateApplied = models.DateField(db_column='DateApplied')

    class Meta:
        db_table = 'job_application'


class VerifyApplicant(models.Model):
    VID = models.AutoField(primary_key=True, db_column='VID')
    ModeratorID = models.ForeignKey(Moderator, on_delete=models.CASCADE, db_column='ModeratorID')
    ApplicantUCID = models.ForeignKey(Student, on_delete=models.CASCADE, db_column='ApplicantUCID')
    VerificationStatus = models.CharField(max_length=50, db_column='VerificationStatus')
    VerificationDate = models.DateField(db_column='VerificationDate')

    class Meta:
        db_table = 'verify_applicant'


class VerifyEmployer(models.Model):
    VID = models.AutoField(primary_key=True, db_column='VID')
    ModeratorID = models.ForeignKey(Moderator, on_delete=models.CASCADE, db_column='ModeratorID')
    EmployerID = models.ForeignKey(Employer, on_delete=models.CASCADE, db_column='EmployerID')
    VerificationStatus = models.CharField(max_length=50, db_column='VerificationStatus')
    VerificationDate = models.DateField(db_column='VerificationDate')

    class Meta:
        db_table = 'verify_employer'


class Reviews(models.Model):
    ModeratorID = models.ForeignKey(Moderator, on_delete=models.CASCADE, db_column='ModeratorID')
    JobID = models.ForeignKey(JobOpening, on_delete=models.CASCADE, db_column='JobID')
    EmployerID = models.ForeignKey(Employer, on_delete=models.CASCADE, db_column='EmployerID')

    class Meta:
        db_table = 'reviews'
        unique_together = ('ModeratorID', 'JobID', 'EmployerID')
