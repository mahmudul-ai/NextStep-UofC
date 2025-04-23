// Import Axios for making HTTP requests
import axios from 'axios';

// Set the base URL for API calls — use env variable if defined, otherwise default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Create an Axios instance with base URL and default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Authentication token handling
// This interceptor adds the JWT token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
  }
  return config;
});

// Real API implementation
const apiService = {
  // Authentication
  login: (credentials) => {
    return api.post('/login/', credentials);
  },
  
  register: (userData) => {
    // For employer registrations, add specific error handling
    if (userData.user_type === 'employer') {
      return api.post('/register/', userData)
        .then(response => {
          // If successful registration and it's an employer, add to verification queue
          if (response.data && response.data.employerId) {
            console.log('Adding new employer to verification queue:', response.data.employerId);
            
            // Add the employer to the verification queue with Pending status
            api.post('/employer-verification/', {
              EmployerID: response.data.employerId,
              VerificationStatus: 'Pending',
              VerificationDate: new Date().toISOString().split('T')[0]
            }).catch(err => {
              console.error('Error adding employer to verification queue:', err);
              // Don't fail registration if this fails
            });
          }
          
          return response;
        })
        .catch(error => {
          // If the error includes a specific message about duplicate keys
          if (
            error.response?.data &&
            (
              (typeof error.response.data === 'string' && error.response.data.includes('duplicate key')) ||
              (error.response?.data?.message && error.response.data.message.includes('duplicate key'))
            )
          ){
          
            console.error('Employer registration error (duplicate key):', error);
            
            // Add more context to the error for better frontend handling
            error.response.data = {
              message: `There was an issue registering your employer account. 
                       Our system is currently experiencing technical difficulties with employer registrations. 
                       Please try again later or contact support. 
                       Error details: ${typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)}`,
              error_type: 'employer_registration_constraint'
            };
          }
          throw error;
        });
    }
    
    // For all other registrations, just make the normal request
    return api.post('/register/', userData);
  },

  // Students
  getStudentProfile: (ucid) => {
    return api.get(`/students/${ucid}/`);
  },

  updateStudentProfile: (ucid, data) => {
    // Ensure all required fields are included to prevent validation errors
    const completeData = {
      // Include default values for required fields if not provided
      UCID: ucid,
      Email: data.Email || data.email || '',
      FName: data.FName || data.firstName || '',
      LName: data.LName || data.lastName || '',
      Phone: data.Phone || data.phone || '',
      // Override with the actual updated data
      ...data
    };
    
    return api.put(`/students/${ucid}/`, completeData);
  },

  // Jobs
  getJobs: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.keyword) params.append('search', filters.keyword); // Matches DRF search_fields
    if (filters.location) params.append('location', filters.location); // Matches your filterset
    if (filters.employerId) params.append('employer', filters.employerId);
    if (filters.minSalary) params.append('minSalary', filters.minSalary);
    if (filters.maxSalary) params.append('maxSalary', filters.maxSalary);
  
    return api.get(`/job-opening/${params.toString() ? `?${params.toString()}` : ''}`);
  },
  
  
  getCompanyJobs: (employerId) => {
    // This is a convenience method that calls getJobs with the employer filter
    return apiService.getJobs({ employerId });
  },
  
  getJob: (jobId) => {
    return api.get(`/job-opening/${jobId}/`);
  },

  createJob: (jobData) => {
    // Adjust field names to match backend expectations and omit any ID to let the backend generate it
    const formattedData = {
      Employer: jobData.employerId,
      JobTitle: jobData.jobTitle,
      Description: jobData.description,
      Salary: jobData.salary,
      Location: jobData.location,
      Deadline: jobData.deadline,
      Status: jobData.status || 'Pending'
    };
    
    // Include optional fields if provided
    if (jobData.requirements) formattedData.Requirements = jobData.requirements;
    if (jobData.responsibilities) formattedData.Responsibilities = jobData.responsibilities;
    if (jobData.benefits) formattedData.Benefits = jobData.benefits;
    
    return api.post('/job-opening/', formattedData);
  },
  
  updateJob: (jobId, jobData) => {
    // Adjust field names to match backend expectations
    const formattedData = {
      Employer: jobData.employerId,
      JobTitle: jobData.jobTitle,
      Description: jobData.description,
      Salary: jobData.salary,
      Location: jobData.location,
      Deadline: jobData.deadline
    };
    
    return api.put(`/job-opening/${jobId}/`, formattedData);
  },
  
  deleteJob: (jobId) => {
    return api.delete(`/job-opening/${jobId}/`);
  },

  // Applications
  getApplications: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.applicantUcid) params.append('ApplicantUCID', filters.applicantUcid);
    if (filters.jobId) params.append('JobID', filters.jobId);
    if (filters.status) params.append('Status', filters.status);
    
    console.log('API call params:', params.toString());
    return api.get(`/job-applications/${params.toString() ? `?${params.toString()}` : ''}`);
  },
  
  getStudentApplications: (ucid) => {
    console.log('Fetching applications for student UCID:', ucid);
    // Make sure ucid is in the correct format (numeric if needed)
    const parsedUcid = parseInt(ucid, 10);
    // If parsing fails, use original ucid
    const formattedUcid = isNaN(parsedUcid) ? ucid : parsedUcid;
    return apiService.getApplications({ applicantUcid: formattedUcid });
  },
  
  getCompanyApplications: (employerId) => {
    return apiService.getApplications({ employerId: employerId });
  },
  
  getApplicationDetail: (applicationId) => {
    return api.get(`/job-applications/${applicationId}/`);
  },

  applyForJob: (applicationData) => {
    // Format the application data to match backend schema exactly
    const formattedData = {
      // ApplicationID is auto-generated by the backend
      Status: applicationData.Status || 'Submitted',
      DateApplied: applicationData.DateApplied || new Date().toISOString().split('T')[0],
      ApplicantUCID: parseInt(applicationData.ApplicantUCID),
      JobID: parseInt(applicationData.JobID),
      EmployerID: parseInt(applicationData.EmployerID)
    };
    
    console.log('API sending job application data:', formattedData);
    return api.post('/job-applications/', formattedData);
  },
  
  updateApplicationStatus: (applicationId, status, feedback = null) => {
    // Only send fields that are being updated
    const updateData = {
      Status: status
    };
    
    if (feedback !== null) {
      updateData.feedback = feedback;
    }
    
    return api.patch(`/job-applications/${applicationId}/`, updateData);
  },
  
  // Employers
  getEmployers: () => {
    return api.get('/employers/');
  },
  
  getEmployer: (employerId) => {
    return api.get(`/employers/${employerId}/`);
  },
  
  updateEmployer: (employerId, data) => {
    // Need to get the current employer data first to preserve the VerificationStatus
    return api.get(`/employers/${employerId}/`)
      .then(response => {
        // Get the current verification status
        const currentEmployer = response.data;
        console.log('Current employer data from API:', currentEmployer);
        
        // Ensure all required fields are included to prevent validation errors
        const completeData = {
          // Include all existing fields from current data
          ...currentEmployer,
          // Include default values for required fields if not provided
          Email: data.Email || data.email || currentEmployer.Email || '',
          CompanyName: data.CompanyName || data.companyName || currentEmployer.CompanyName || '',
          // Make sure VerificationStatus isn't accidentally changed
          VerificationStatus: currentEmployer.VerificationStatus || 'Pending',
          // Override with the actual updated data
          ...data
        };
        
        console.log('Sending employer update with data:', completeData);
        
        // Now update with complete data
        return api.put(`/employers/${employerId}/`, completeData);
      })
      .catch(error => {
        console.error('Error in updateEmployer:', error);
        // Rethrow with more context
        throw new Error(`Failed to update employer: ${error.message}`);
      });
  },
  
  // Verification Methods
  verifyStudent: (studentId, status, feedback) => {
    return api.post('/applicant-verifications/', {
      ApplicantID: studentId,
      VerificationStatus: status,
      Feedback: feedback
    });
  },

  verifyEmployer: (employerId, status, feedback) => {
    return api.post('/employer-verification/', {
      EmployerID: employerId, 
      VerificationStatus: status,
      Feedback: feedback
    });
  },

  getStudentVerificationQueue: () => {
    return api.get('/applicant-verifications/');
  },
  
  getEmployerVerificationQueue: () => {
    return api.get('/employer-verification/');
  },
  
  // Moderator functions
  getVerifications: (userType, status = 'Pending') => {
    if (userType === 'student') {
      return api.get('/applicant-verifications/')
        .then(response => {
          // Filter by status if specified
          const filteredData = status 
            ? response.data.filter(v => v.VerificationStatus === status)
            : response.data;
            
          // Get student details for each verification
          const studentPromises = filteredData.map(verification => 
            api.getStudentProfile(verification.ApplicantUCID)
              .then(studentResponse => ({
                vid: verification.VID,
                applicantUcid: verification.ApplicantUCID,
                status: verification.VerificationStatus,
                date: verification.VerificationDate,
                student: {
                  ucid: studentResponse.data.UCID,
                  name: `${studentResponse.data.FName || ''} ${studentResponse.data.LName || ''}`.trim(),
                  email: studentResponse.data.Email,
                  major: studentResponse.data.Major,
                  graduationYear: studentResponse.data.GraduationYear
                }
              }))
              .catch(() => null) // Skip if student details can't be fetched
          );
          
          return Promise.all(studentPromises)
            .then(results => ({ 
              data: results.filter(Boolean) // Remove nulls
            }));
        });
    } else if (userType === 'employer') {
      return api.get('/employer-verification/')
        .then(response => {
          // Filter by status if specified
          const filteredData = status 
            ? response.data.filter(v => v.VerificationStatus === status)
            : response.data;
            
          // Get employer details for each verification
          const employerPromises = filteredData.map(verification => 
            api.getEmployer(verification.EmployerID)
              .then(employerResponse => ({
                vid: verification.VID,
                employerId: verification.EmployerID,
                status: verification.VerificationStatus,
                date: verification.VerificationDate,
                employer: {
                  employerId: employerResponse.data.EmployerID,
                  companyName: employerResponse.data.CompanyName,
                  email: employerResponse.data.Email,
                  industry: employerResponse.data.Industry || 'Not specified'
                }
              }))
              .catch(() => null) // Skip if employer details can't be fetched
          );
          
          return Promise.all(employerPromises)
            .then(results => ({ 
              data: results.filter(Boolean) // Remove nulls
            }));
        });
    }
    return Promise.resolve({ data: [] });
  },

  // Update verification status
  updateVerificationStatus: (userType, userId, status, feedback = '') => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const moderatorId = localStorage.getItem('moderatorId');
    
    if (userType === 'student') {
      // First get existing verifications to find the one we need to update
      return api.get('/applicant-verifications/')
        .then(response => {
          // Find the most recent verification for this student
          const verifications = response.data;
          console.log('Current verification records:', verifications);
          
          // Find matching record for this student
          const studentVerifications = verifications.filter(v => 
            v.ApplicantUCID === parseInt(userId) || v.ApplicantUCID === userId
          );
          
          let vid;
          if (studentVerifications.length > 0) {
            // Get the most recent verification by VID (assuming higher VID is more recent)
            const mostRecent = studentVerifications.reduce((prev, current) => 
              (prev.VID > current.VID) ? prev : current
            );
            vid = mostRecent.VID;
            console.log(`Found existing verification record for student ${userId} with VID ${vid}`);
          }
          
          // Prepare update payload
          const payload = {
            VerificationStatus: status,
            VerificationDate: today,
            ModeratorID: parseInt(moderatorId)
          };
          
          // Add feedback only if it was actually provided and is not empty
          if (feedback && feedback.trim() !== '') {
            payload.Feedback = feedback;
          }
          
          let updatePromise;
          
          if (vid) {
            // Update existing record
            console.log(`Updating student verification VID ${vid} with payload:`, payload);
            updatePromise = api.patch(`/applicant-verifications/${vid}/`, payload);
          } else {
            // Create new record if no existing one found (fallback)
            console.log(`No existing verification found for student ${userId}, creating new record`);
            updatePromise = api.post('/applicant-verifications/', {
              ApplicantUCID: parseInt(userId),
              VerificationStatus: status,
              VerificationDate: today,
              ModeratorID: parseInt(moderatorId),
              ...(feedback && feedback.trim() !== '' ? { Feedback: feedback } : {})
            });
          }
          
          // Also update the student record with the new verification status
          return updatePromise.then(response => {
            // Map API verification status to student record status format if needed
            let studentStatus = status;
            if (status === 'Approved') studentStatus = 'Verified';
            
            // Update the student record
            return api.patch(`/students/${userId}/`, {
              VerificationStatus: studentStatus
            }).catch(err => {
              console.error(`Error updating student ${userId} verification status:`, err);
              // Return original response even if this update fails
              return response;
            });
          });
        });
    } else if (userType === 'employer') {
      // Same approach for employers
      return api.get('/employer-verification/')
        .then(response => {
          // Find the most recent verification for this employer
          const verifications = response.data;
          console.log('Current employer verification records:', verifications);
          
          // Find matching record for this employer
          const employerVerifications = verifications.filter(v => 
            v.EmployerID === parseInt(userId) || v.EmployerID === userId
          );
          
          let vid;
          if (employerVerifications.length > 0) {
            // Get the most recent verification
            const mostRecent = employerVerifications.reduce((prev, current) => 
              (prev.VID > current.VID) ? prev : current
            );
            vid = mostRecent.VID;
            console.log(`Found existing verification record for employer ${userId} with VID ${vid}`);
          }
          
          // Prepare update payload
          const payload = {
            VerificationStatus: status,
            VerificationDate: today,
            ModeratorID: parseInt(moderatorId)
          };
          
          // Add feedback only if it was actually provided and is not empty
          if (feedback && feedback.trim() !== '') {
            payload.Feedback = feedback;
          }
          
          let updatePromise;
          
          if (vid) {
            // Update existing record
            console.log(`Updating employer verification VID ${vid} with payload:`, payload);
            updatePromise = api.patch(`/employer-verification/${vid}/`, payload);
          } else {
            // Create new record if no existing one found (fallback)
            console.log(`No existing verification found for employer ${userId}, creating new record`);
            updatePromise = api.post('/employer-verification/', {
              EmployerID: parseInt(userId),
              VerificationStatus: status,
              VerificationDate: today,
              ModeratorID: parseInt(moderatorId),
              ...(feedback && feedback.trim() !== '' ? { Feedback: feedback } : {})
            });
          }
          
          // Also update the employer record with the new verification status
          return updatePromise.then(response => {
            // Map API verification status to employer record status format if needed
            let employerStatus = status;
            if (status === 'Approved') employerStatus = 'Verified';
            
            // Update the employer record
            return api.patch(`/employers/${userId}/`, {
              VerificationStatus: employerStatus
            }).catch(err => {
              console.error(`Error updating employer ${userId} verification status:`, err);
              // Return original response even if this update fails
              return response;
            });
          });
        });
    }
    return Promise.reject(new Error('Invalid user type'));
  },

  // Job approval/rejection
  updateJobStatus: (jobId, status, feedback = '') => {
    return api.patch(`/job-opening/${jobId}/`, {
      Status: status,
      Feedback: feedback,
      ModeratorID: localStorage.getItem('moderatorId')
    });
  },

  // Get pending jobs for moderation
  getPendingJobs: () => {
    return api.get('/job-opening/', {
      params: { Status: 'Pending' }
    });
  },

  // Forum posts
  getForumPosts: () => {
    return api.get('/posts/');
  },
  
  getForumPost: (postId) => {
    return api.get(`/posts/${postId}/`);
  },
  
  createForumPost: (postData) => {
    return api.post('/posts/', postData);
  },
  
  updateForumPost: (postId, postData) => {
    return api.put(`/posts/${postId}/`, postData);
  },
  
  deleteForumPost: (postId) => {
    return api.delete(`/posts/${postId}/`);
  },
  
  // For features not directly supported by the API, use client-side storage
  
  // Saved jobs (using localStorage until backend support is added)
  getSavedJobs: (ucid) => {
    // Get saved jobs from localStorage
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '{}');
    const userSavedJobs = savedJobs[ucid] || [];
    
    // If there are saved job IDs, fetch their details
    if (userSavedJobs.length > 0) {
      return Promise.all(userSavedJobs.map(jobId => apiService.getJob(jobId)))
        .then(responses => {
          return { 
            data: responses.map((response, index) => {
              // Map the backend job fields to frontend field names
              const job = response.data;
              return {
                savedJobId: index + 1,
                ucid: ucid,
                jobId: job.JobID || job.jobId,
                dateSaved: new Date().toISOString().split('T')[0],
                job: {
                  jobId: job.JobID || job.jobId,
                  employerId: job.Employer || job.employerId,
                  jobTitle: job.JobTitle || job.jobTitle,
                  companyName: job.CompanyName || 'Company', // Fallback if not available
                  location: job.Location || job.location,
                  salary: job.Salary || job.salary,
                  deadline: job.Deadline || job.deadline,
                  description: job.Description || job.description,
                  status: job.Status || job.status || 'Active',
                  isSaved: true
                }
              };
            }) 
          };
        });
    }
    
    // Return empty array if no saved jobs
    return Promise.resolve({ data: [] });
  },
  
  saveJob: (ucid, jobId) => {
    // Store in localStorage
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '{}');
    savedJobs[ucid] = savedJobs[ucid] || [];
    
    // Add jobId if not already saved
    if (!savedJobs[ucid].includes(jobId)) {
      savedJobs[ucid].push(jobId);
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    }
    
    return Promise.resolve({ data: { success: true, isSaved: true } });
  },
  
  unsaveJob: (ucid, jobId) => {
    // Remove from localStorage
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '{}');
    if (savedJobs[ucid]) {
      savedJobs[ucid] = savedJobs[ucid].filter(id => id !== jobId);
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    }
    
    return Promise.resolve({ data: { success: true, isSaved: false } });
  },
  
  isJobSaved: (ucid, jobId) => {
    // Check localStorage
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '{}');
    const isSaved = savedJobs[ucid] && savedJobs[ucid].includes(jobId);
    
    return Promise.resolve({ data: { isSaved } });
  },
  
  // User profile handling across different types
  getUserProfile: async (user) => {
    try {
      if (user.user_type === 'student') {
        // Find student by email
        const studentsResponse = await api.get('/students/');
        const student = studentsResponse.data.find(s => s.Email === user.email);
        if (student) {
          // Store UCID in localStorage for later use
          localStorage.setItem('ucid', student.UCID);
          return { ...user, ...student };
        }
      } else if (user.user_type === 'employer') {
        // Find employer by email
        const employersResponse = await api.get('/employers/');
        const employer = employersResponse.data.find(e => e.Email === user.email);
        if (employer) {
          // Store employer ID in localStorage for later use
          localStorage.setItem('employerId', employer.EmployerID);
          
          // Check if employer has a verification record
          const verificationResponse = await api.get('/employer-verification/');
          const hasVerification = verificationResponse.data.some(v => 
            v.EmployerID === employer.EmployerID || v.EmployerID === employer.EmployerID.toString()
          );
          
          // If no verification record exists, create one
          if (!hasVerification) {
            console.log(`No verification record found for employer ${employer.EmployerID}, creating one`);
            try {
              await api.post('/employer-verification/', {
                EmployerID: employer.EmployerID,
                VerificationStatus: 'Pending',
                VerificationDate: new Date().toISOString().split('T')[0]
              });
            } catch (err) {
              console.error('Error creating verification record for employer:', err);
              // Don't fail login if this fails
            }
          }
          
          return { ...user, ...employer };
        }
      } else if (user.user_type === 'moderator') {
        // For moderators, we need to first find their student record
        const studentsResponse = await api.get('/students/');
        const student = studentsResponse.data.find(s => s.Email === user.email);
        
        if (student) {
          // Then find the moderator record using the student's UCID
          const moderatorsResponse = await api.get('/moderators/');
          const moderator = moderatorsResponse.data.find(m => m.ModeratorID === student.UCID);
          
          if (moderator) {
            // Store moderator info in localStorage
            localStorage.setItem('moderatorId', moderator.ModeratorID);
            localStorage.setItem('ucid', student.UCID);
            return { ...user, ...student, ...moderator };
          }
        }
      }
      
      // Default: return the user object as-is
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return user;
    }
  },
  
  // Community score calculation (using posts and upvotes data)
  getUserCommunityScore: (userType, userId) => {
    // For now, use simplified approach based on the data we can get from the real API
    return api.get('/posts/')
      .then(response => {
        let score = 0;
        const posts = response.data || [];
        
        // Filter user's posts and count upvotes
        const userPosts = posts.filter(post => {
          if (userType === 'student' && post.authorUcid === userId) return true;
          if (userType === 'employer' && post.authorEmployerId === parseInt(userId)) return true;
          if (userType === 'moderator' && post.authorModeratorId === parseInt(userId)) return true;
          return false;
        });
        
        // Calculate score based on post count and any upvote data available
        const postCount = userPosts.length;
        const upvotes = userPosts.reduce((total, post) => total + (post.upvotes || 0), 0);
        
        // Simple formula: 2 points per post + upvotes
        score = (postCount * 2) + upvotes;
        
        return { 
          data: { 
            score,
            postCount,
            upvotes,
            postBonus: postCount * 2
          } 
        };
      })
      .catch(error => {
        console.error('Error calculating community score:', error);
        // Return a default score if API fails
        return { 
          data: { 
            score: 0,
            postCount: 0,
            upvotes: 0,
            postBonus: 0
          } 
        };
      });
  },
  
  // Verification status check
  checkVerificationStatus: (userType, userId) => {
    if (userType === 'employer') {
      // First check in VerifyEmployer table
      return api.get('/employer-verification/')
        .then(response => {
          // Find verification for this employer
          const verification = response.data.find(v => 
            v.EmployerID.toString() === userId.toString() || 
            v.EmployerID === parseInt(userId)
          );
          
          if (verification) {
            return { 
              data: { 
                status: verification.VerificationStatus,
                feedback: verification.feedback || ''
              } 
            };
          } else {
            // Fall back to employer record
            return api.get(`/employers/${userId}/`)
              .then(response => {
                return { 
                  data: { 
                    status: response.data.VerificationStatus || 'Pending',
                    feedback: response.data.feedback || ''
                  } 
                };
              });
          }
        })
        .catch(error => {
          console.error("Error checking employer verification:", error);
          return { data: { status: 'Unknown', feedback: '' } };
        });
    } else if (userType === 'student') {
      // First check in VerifyApplicant table
      return api.get('/applicant-verifications/')
        .then(response => {
          // Find verification for this student
          const verification = response.data.find(v => 
            v.ApplicantUCID.toString() === userId.toString() || 
            v.ApplicantUCID === parseInt(userId)
          );
          
          if (verification) {
            return { 
              data: { 
                status: verification.VerificationStatus,
                feedback: verification.feedback || ''
              } 
            };
          } else {
            // Fall back to student record
            return api.get(`/students/${userId}/`)
              .then(response => {
                return { 
                  data: { 
                    status: response.data.VerificationStatus || 'Pending',
                    feedback: response.data.feedback || ''
                  } 
                };
              });
          }
        })
        .catch(error => {
          console.error("Error checking student verification:", error);
          return { data: { status: 'Unknown', feedback: '' } };
        });
    }
    
    return Promise.resolve({ data: { status: 'Unknown', feedback: '' } });
  },

  // Check if user is a moderator
  checkModeratorStatus: (userId) => {
    if (!userId) return Promise.resolve({ data: { isModerator: false } });
    
    return api.get('/moderators/')
      .then(response => {
        // Check if this userId exists as a ModeratorID
        const moderator = response.data.find(m => 
          m.ModeratorID.toString() === userId.toString() || 
          m.ModeratorID === parseInt(userId)
        );
        
        return { 
          data: { 
            isModerator: !!moderator,
            moderatorId: moderator ? moderator.ModeratorID : null
          } 
        };
      })
      .catch(error => {
        console.error("Error checking moderator status:", error);
        return { data: { isModerator: false } };
      });
  }
};

export default apiService; 