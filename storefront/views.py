# Importing decorators and utilities for API views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# API view to handle both retrieving and updating the authenticated user's account info
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])  # Only logged-in users can access this view
def account_view(request):
    user = request.user  # The currently authenticated user

    # Handle GET request: return some basic user info
    if request.method == 'GET':
        return Response({
            "username": user.username,
            "bio": getattr(user, 'bio', ''),  # Use getattr in case 'bio' doesn't exist
            "user_type": user.user_type  # <- Add this line
        })
    
    # Handle PUT request: update user's bio and optionally PDF resume
    elif request.method == 'PUT':
        bio = request.data.get('bio', '')  # Get bio from request data (default to empty string)
        if bio:
            user.bio = bio  # Update user's bio
        
        # If a PDF file was uploaded, save it to the user's profile
        # Make sure the CustomUser model has a 'pdf_file' field for this to work
        if 'pdf' in request.FILES:
            user.pdf_file = request.FILES['pdf']
        
        user.save()  # Save all changes to the database
        return Response({"message": "Account updated successfully."})
