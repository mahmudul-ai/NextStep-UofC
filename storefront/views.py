# Import decorators and response tools
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# GET and PUT account endpoint for authenticated users
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def account_view(request):
    user = request.user

    # Handle GET request: send account info
    if request.method == 'GET':
        return Response({
            "username": user.username,
            "first_name": user.first_name,  # 👈 Include this for frontend use
            "last_name": user.last_name,    # 👈 Include this too
            "bio": getattr(user, 'bio', ''),
            "user_type": user.user_type
        })

    # Handle PUT request: update user bio or resume
    elif request.method == 'PUT':
        bio = request.data.get('bio', '')
        if bio:
            user.bio = bio

        # If a resume file is uploaded, attach it to the user model
        if 'pdf' in request.FILES:
            user.pdf_file = request.FILES['pdf']

        user.save()
        return Response({"message": "Account updated successfully."})
