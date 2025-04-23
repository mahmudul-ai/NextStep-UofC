import django_filters
from .models import JobOpening

class JobOpeningFilter(django_filters.FilterSet):
    location = django_filters.CharFilter(field_name='Location', lookup_expr='icontains')
    minSalary = django_filters.NumberFilter(field_name='Salary', lookup_expr='gte')
    maxSalary = django_filters.NumberFilter(field_name='Salary', lookup_expr='lte')

    class Meta:
        model = JobOpening
        fields = ['location', 'minSalary', 'maxSalary']
