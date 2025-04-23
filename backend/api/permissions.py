from rest_framework.permissions import BasePermission
from .models import Moderator

class IsModerator(BasePermission):
    def has_permission(self, request, view):
        try:
            return Moderator.objects.filter(student__UCID=request.user.username).exists()
        except:
            return False