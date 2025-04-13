# storefront/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def account_view(request):
    user = request.user

    if request.method == 'GET':
        return Response({
            "username": user.username,
            "bio": getattr(user, 'bio', ''),
            # You can add more fields here if you need them.
        })
    
    elif request.method == 'PUT':
        bio = request.data.get('bio', '')
        if bio:
            user.bio = bio
        
        # Check for a PDF file and update if provided. Ensure your user model has a corresponding field.
        if 'pdf' in request.FILES:
            user.pdf_file = request.FILES['pdf']
        
        user.save()
        return Response({"message": "Account updated successfully."})
