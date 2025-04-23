# Backend Integration Guide

This document provides instructions for integrating the NextStep frontend React application with the Django backend.

## Overview

The current frontend implementation uses mock data (hardcoded JSON) for development and testing purposes. To integrate with the real Django backend, you'll need to:

1. Set the API configuration flag to use real endpoints
2. Ensure your Django backend provides compatible API endpoints
3. Adjust any data structure differences between the mock data and real API responses

## Step 1: Configure API Settings

In `src/services/api.js`:

1. Change `USE_MOCK_DATA` from `true` to `false`:

```javascript
// Change this flag to 'false' when you're ready to connect to the real backend
const USE_MOCK_DATA = false;
```

2. Verify that `API_BASE_URL` points to your Django backend:

```javascript
// Update this to match your Django backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
```

## Step 2: Django Backend API Requirements

Your Django backend needs to provide the following API endpoints to match the frontend expectations:

### Authentication

| Endpoint | Method | Purpose | Request Format | Response Format |
|----------|--------|---------|---------------|-----------------|
| `/api/login/` | POST | User login | `{ email, password }` | `{ token, user: {...}, role }` |
| `/api/register/` | POST | User registration | `{ username, email, password, user_type, ... }` | `{ success, message }` |

### Students

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/students/{ucid}/` | GET | Get student profile |
| `/api/students/{ucid}/` | PUT | Update student profile |
| `/api/students/{ucid}/applications/` | GET | Get student's job applications |
| `/api/students/{ucid}/saved-jobs/` | GET | Get student's saved jobs |

### Jobs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/jobs/` | GET | Get all jobs (with optional filters) |
| `/api/jobs/{id}/` | GET | Get specific job details |
| `/api/jobs/` | POST | Create new job |
| `/api/jobs/{id}/` | PUT | Update job |
| `/api/jobs/{id}/` | DELETE | Delete job |
| `/api/jobs/{id}/apply/` | POST | Apply for job |
| `/api/jobs/{id}/save/` | POST | Save job |
| `/api/jobs/{id}/unsave/` | POST | Unsave job |

### Forum

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/forum/posts/` | GET | Get all forum posts |
| `/api/forum/posts/` | POST | Create forum post |
| `/api/forum/posts/{id}/` | GET | Get specific forum post |
| `/api/forum/posts/{id}/` | DELETE | Delete forum post |
| `/api/forum/posts/{id}/upvote/` | POST | Upvote forum post |
| `/api/forum/posts/{id}/comments/` | GET | Get comments for a post |
| `/api/forum/posts/{id}/comments/` | POST | Add comment to a post |

### Verification

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/verifications/students/` | GET | Get student verifications |
| `/api/verifications/employers/` | GET | Get employer verifications |
| `/api/verifications/students/{id}/` | PUT | Update student verification |
| `/api/verifications/employers/{id}/` | PUT | Update employer verification |

## Step 3: Field Naming Conventions

The frontend expects specific field names from the API responses. Here are some key naming conventions:

### User/Authentication
- `token`: JWT token
- `role` or `user_type`: 'student', 'employer', or 'moderator'
- For students: `ucid` as the ID field
- For employers: `employerId` as the ID field 
- For moderators: `moderatorId` as the ID field

### Jobs
- `jobId`: Primary key for jobs
- `employerId`: Foreign key to employer
- `jobTitle`, `description`, `salary`, `location`, `deadline`
- `status`: 'Pending', 'Active', 'Rejected', 'Needs Attention'
- `isUrgent`, `isRemote`, `eligibleForInternship`: Boolean flags
- `feedback`: Moderator feedback for rejected jobs

### Forum Posts
- `forumPostId`: Primary key for posts
- `title`, `content`, `datePosted`
- `upvotes`: Count of upvotes
- `authorUcid`, `authorEmployerId`, or `authorModeratorId`: Foreign key to the post author
- `authorName`, `authorType`: Display information

## Step 4: Django Models Integration

The Django models have been updated to match the frontend requirements. Here are the key models and their fields:

### User Model
Authentication and user management

### Student Model
Student profile with education details

### Employer Model
Company information and verification status

### Job Model
Job listings with statuses and flags

### Application Model
Job applications with status tracking

### Post Model
Forum posts with upvote functionality

### Verification Models
Student and employer verification management

## Step 5: Testing Integration

1. Start your Django backend: `python manage.py runserver`
2. Start your React frontend: `npm start`
3. Test the login functionality first
4. Progressively test other features

## Common Integration Issues

### CORS Issues
If you encounter CORS errors, ensure Django has the cors-headers package installed and configured:

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### Authentication Problems
If you have authentication issues:
1. Check token formats match between frontend and backend
2. Verify the Authorization header format in API requests
3. Ensure permissions are set correctly on Django views

### Data Format Mismatches
If components aren't displaying data correctly:
1. Use browser dev tools to inspect API responses
2. Compare the response structure with what components expect
3. Adjust the real API or create adapter methods in the frontend

## Deployment Considerations

When deploying the integrated application:
1. Update the `API_BASE_URL` to your production backend URL
2. Remove any testing credentials and mock data
3. Ensure authentication tokens are handled securely
4. Set up proper HTTPS for API communication 