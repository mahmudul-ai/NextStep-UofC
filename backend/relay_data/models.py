from django.db import models

class Student(models.Model):
    UCID = models.CharField(max_length=8, primary_key=True)
    Name = models.CharField(max_length=255)
    Email = models.EmailField(unique=True)
    Major = models.CharField(max_length=255, null=True, blank=True)
    GraduationYear = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'student'

class Post(models.Model):
    PostID = models.AutoField(primary_key=True)
    VUCID = models.ForeignKey(Student, on_delete=models.CASCADE)
    Content = models.TextField()
    Date = models.DateField()

    class Meta:
        db_table = 'post'

class Volunteer(models.Model):
    SUCID = models.OneToOneField(Student, on_delete=models.CASCADE, primary_key=True)
    Hours = models.IntegerField()

    class Meta:
        db_table = 'volunteer'

class Applicant(models.Model):
    SUCID = models.OneToOneField(Student, on_delete=models.CASCADE, primary_key=True)
    CGPA = models.DecimalField(max_digits=3, decimal_places=2)
    Resume = models.TextField()
    VerificationStatus = models.CharField(max_length=50)

    class Meta:
        db_table = 'applicant'

class Moderator(models.Model):
    ModeratorID = models.AutoField(primary_key=True)
    Email = models.EmailField(unique=True)
    Name = models.CharField(max_length=255)

    class Meta:
        db_table = 'moderator'

class Employer(models.Model):
    EmployerID = models.AutoField(primary_key=True)
    CompanyName = models.CharField(max_length=255)
    Email = models.EmailField(unique=True)
    Industry = models.CharField(max_length=255, null=True, blank=True)
    VerificationStatus = models.CharField(max_length=50)

    class Meta:
        db_table = 'employer'

class Job(models.Model):
    JobID = models.AutoField(primary_key=True)
    Employer = models.ForeignKey(Employer, on_delete=models.CASCADE)
    JobTitle = models.CharField(max_length=255)
    Description = models.TextField()
    Salary = models.DecimalField(max_digits=10, decimal_places=2)
    Location = models.CharField(max_length=255)
    Deadline = models.DateField()

    class Meta:
        db_table = 'job'

class Application(models.Model):
    ApplicationID = models.AutoField(primary_key=True)
    ApplicantUCID = models.ForeignKey(Student, on_delete=models.CASCADE)
    Job = models.ForeignKey(Job, on_delete=models.CASCADE)
    Employer = models.ForeignKey(Employer, on_delete=models.CASCADE)
    Status = models.CharField(max_length=50)
    DateApplied = models.DateField()

    class Meta:
        db_table = 'application'

class Verification(models.Model):
    VID = models.AutoField(primary_key=True)
    Moderator = models.ForeignKey(Moderator, on_delete=models.CASCADE)
    ApplicantUCID = models.ForeignKey(Student, on_delete=models.CASCADE)
    VerificationStatus = models.CharField(max_length=50)
    VerificationDate = models.DateField()

    class Meta:
        db_table = 'verification'

class EmployerVerification(models.Model):
    VID = models.AutoField(primary_key=True)
    Moderator = models.ForeignKey(Moderator, on_delete=models.CASCADE)
    Employer = models.ForeignKey(Employer, on_delete=models.CASCADE)
    VerificationStatus = models.CharField(max_length=50)
    VerificationDate = models.DateField()

    class Meta:
        db_table = 'employerverification'

class JobModeration(models.Model):
    Moderator = models.ForeignKey(Moderator, on_delete=models.CASCADE)
    Job = models.ForeignKey(Job, on_delete=models.CASCADE)
    Employer = models.ForeignKey(Employer, on_delete=models.CASCADE)

    class Meta:
        db_table = 'jobmoderation'
        unique_together = ('Moderator', 'Job', 'Employer')
