// Import Axios for making HTTP requests
import axios from 'axios';
import mockData from '../mockData.json';

// Set the base URL for API calls — use env variable if defined, otherwise default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// INTEGRATION POINT #1:
// Change this flag to 'false' when you're ready to connect to the real backend
// This is the main switch for transitioning from mock data to real API
const USE_MOCK_DATA = true;

// Create an Axios instance with base URL and default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// INTEGRATION POINT #2:
// Authentication token handling
// This interceptor adds the JWT token to all requests
// Ensure your Django backend validates these tokens correctly
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
  }
  return config;
});

// Initialize mock data for comments if it doesn't exist
if (!mockData.forumComments) {
  mockData.forumComments = [];
}

// These sample jobs are for development only
// INTEGRATION POINT #3: Remove these when connecting to real backend
// Sample active jobs with varying features
const sampleActiveJobs = [
  {
    jobId: 101,
    employerId: 2, // Tech Innovations
    jobTitle: "Full Stack Developer",
    companyName: "Tech Innovations",
    location: "Calgary, AB (Hybrid)",
    salary: 95000,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    description: "We're looking for a skilled Full Stack Developer to join our growing team. You'll work on developing and maintaining web applications using React, Node.js, and MongoDB.",
    requirements: "- 3+ years experience with JavaScript and modern frameworks\n- Experience with React and Node.js\n- Knowledge of RESTful APIs\n- Bachelor's degree in Computer Science or related field",
    responsibilities: "- Develop front-end website architecture\n- Design and develop APIs\n- Stay up-to-date with emerging technologies\n- Work in an agile environment",
    benefits: "- Competitive salary\n- Health and dental benefits\n- Flexible work hours\n- Professional development budget",
    status: "Active",
    applicationsCount: 8,
    isUrgent: true
  },
  {
    jobId: 102,
    employerId: 3, // Marketing Masters
    jobTitle: "Digital Marketing Specialist",
    companyName: "Marketing Masters",
    location: "Remote",
    salary: 75000,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
    description: "Marketing Masters is seeking a Digital Marketing Specialist to help execute and optimize digital marketing campaigns for our clients in various industries.",
    requirements: "- 2+ years experience in digital marketing\n- Knowledge of SEO, SEM, and social media platforms\n- Experience with analytics tools (Google Analytics, Facebook Insights)\n- Excellent written and verbal communication skills",
    responsibilities: "- Develop and execute digital marketing strategies\n- Monitor campaign performance\n- Create engaging content for social media\n- Report on campaign results",
    benefits: "- 100% remote work\n- Flexible schedule\n- Learning stipend\n- Performance bonuses",
    status: "Active",
    applicationsCount: 5,
    isRemote: true
  },
  {
    jobId: 103,
    employerId: 2, // Tech Innovations
    jobTitle: "UX/UI Designer",
    companyName: "Tech Innovations",
    location: "Calgary, AB (On-site)",
    salary: 85000,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    description: "Tech Innovations is looking for a talented UX/UI Designer to create beautiful and functional user experiences for our web and mobile products.",
    requirements: "- 3+ years experience in UX/UI design\n- Proficiency with design tools (Figma, Adobe XD)\n- Strong portfolio showcasing UI/UX projects\n- Knowledge of HTML/CSS is a plus",
    responsibilities: "- Create user flows, wireframes, and prototypes\n- Conduct user research and usability testing\n- Collaborate with product managers and developers\n- Ensure visual consistency across platforms",
    benefits: "- Competitive salary\n- Health and dental benefits\n- Creative work environment\n- Career advancement opportunities",
    status: "Active",
    applicationsCount: 3,
    isFeatured: true,
    deadline_approaching: true
  },
  {
    jobId: 104,
    employerId: 4, // Financial Futures
    jobTitle: "Data Analyst",
    companyName: "Financial Futures",
    location: "Calgary, AB (Hybrid)",
    salary: 80000,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days from now
    description: "Financial Futures is seeking a detail-oriented Data Analyst to interpret complex data sets and provide insights to inform business decisions.",
    requirements: "- Bachelor's degree in Statistics, Mathematics, or related field\n- Experience with data analysis tools (Excel, SQL, Python)\n- Strong analytical and problem-solving skills\n- Knowledge of data visualization tools (Tableau, Power BI)",
    responsibilities: "- Analyze and interpret financial and business data\n- Develop regular reports and dashboards\n- Identify trends and patterns in data\n- Present findings to stakeholders",
    benefits: "- Competitive salary\n- Retirement savings plan\n- Health and wellness benefits\n- Professional development opportunities",
    status: "Active",
    applicationsCount: 6,
    eligibleForInternship: true
  },
  {
    jobId: 105,
    employerId: 5, // HealthTech Solutions
    jobTitle: "Software Engineer - Healthcare",
    companyName: "HealthTech Solutions",
    location: "Edmonton, AB (On-site)",
    salary: 90000,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    description: "HealthTech Solutions is looking for a Software Engineer to join our team developing innovative healthcare technology solutions that improve patient care and streamline clinical workflows.",
    requirements: "- Bachelor's degree in Computer Science or related field\n- 2+ years of software development experience\n- Experience with Java or C#\n- Knowledge of healthcare systems (FHIR, HL7) is a plus",
    responsibilities: "- Design and develop healthcare software applications\n- Collaborate with clinical staff to understand requirements\n- Ensure compliance with healthcare regulations\n- Maintain and improve existing systems",
    benefits: "- Competitive salary\n- Comprehensive benefits package\n- Work that makes a difference in healthcare\n- Career growth opportunities",
    status: "Active",
    applicationsCount: 4,
    deadline_approaching: true
  }
];

// Assuming there's mockData with a jobs array
mockData.jobs = [...mockData.jobs, ...sampleActiveJobs];

// INTEGRATION POINT #4:
// Mock API implementation
// When connecting to the real backend, you won't need to modify this section
// as the exported API will automatically switch to the real implementation
// when USE_MOCK_DATA is set to false
const mockApi = {
  // Authentication
  login: (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === 'john.doe@ucalgary.ca' && credentials.password === 'password') {
          resolve({
            data: {
              token: 'mock-token-student',
              user: mockData.students[0],
              role: 'student'
            }
          });
        } else if (credentials.email === 'careers@ucalgary.ca' && credentials.password === 'password') {
          resolve({
            data: {
              token: 'mock-token-employer',
              user: mockData.employers[0],
              role: 'employer'
            }
          });
        } else if (credentials.email === 'admin@nextstep.ca' && credentials.password === 'password') {
          resolve({
            data: {
              token: 'mock-token-moderator',
              user: mockData.moderators[0],
              role: 'moderator'
            }
          });
        } else {
          reject({ response: { data: { message: 'Invalid credentials' } } });
        }
      }, 500);
    });
  },

  // Students
  getStudentProfile: (ucid) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const student = mockData.students.find(s => s.ucid === ucid);
        resolve({ data: student });
      }, 500);
    });
  },

  updateStudentProfile: (ucid, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { ...mockData.students.find(s => s.ucid === ucid), ...data } });
      }, 500);
    });
  },

  // Jobs
  getJobs: (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredJobs = mockData.jobs;
        
        if (filters.status) {
          filteredJobs = filteredJobs.filter(job => job.status === filters.status);
        }
        
        if (filters.employerId) {
          filteredJobs = filteredJobs.filter(job => job.employerId === filters.employerId);
        }
        
        if (filters.isUrgent) {
          filteredJobs = filteredJobs.filter(job => job.isUrgent === true);
        }
        
        if (filters.isRemote) {
          filteredJobs = filteredJobs.filter(job => job.isRemote === true);
        }
        
        if (filters.eligibleForInternship) {
          filteredJobs = filteredJobs.filter(job => job.eligibleForInternship === true);
        }
        
        resolve({
          status: 200,
          data: filteredJobs
        });
      }, 300);
    });
  },

  getJob: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const job = mockData.jobs.find(j => j.jobId === parseInt(id));
        if (job) {
          resolve({ data: job });
        } else {
          reject({ response: { data: { message: 'Job not found' } } });
        }
      }, 500);
    });
  },

  createJob: (jobData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newJob = {
          ...jobData,
          jobId: Math.max(...mockData.jobs.map(j => j.jobId)) + 1,
          companyName: mockData.employers.find(e => e.employerId === jobData.employerId)?.companyName,
          // New jobs default to Pending status, awaiting moderator approval
          status: 'Pending',
          // Track feedback if job needs changes
          feedback: ''
        };
        
        // Add to mock data for local state
        mockData.jobs.push(newJob);
        
        resolve({ data: newJob });
      }, 500);
    });
  },

  updateJob: (id, jobData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const jobIndex = mockData.jobs.findIndex(j => j.jobId === parseInt(id));
        if (jobIndex !== -1) {
          const updatedJob = { ...mockData.jobs[jobIndex], ...jobData };
          
          // Update the job in our mock data
          mockData.jobs[jobIndex] = updatedJob;
          
          resolve({ data: updatedJob });
        } else {
          reject({ response: { data: { message: 'Job not found' } } });
        }
      }, 500);
    });
  },

  // Add a method to reject a job with feedback
  rejectJob: (id, feedback) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const jobIndex = mockData.jobs.findIndex(j => j.jobId === parseInt(id));
        if (jobIndex !== -1) {
          // Update status to Rejected and add feedback
          mockData.jobs[jobIndex].status = 'Rejected';
          mockData.jobs[jobIndex].feedback = feedback || '';
          
          resolve({ data: mockData.jobs[jobIndex] });
        } else {
          reject({ response: { data: { message: 'Job not found' } } });
        }
      }, 500);
    });
  },

  deleteJob: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true } });
      }, 500);
    });
  },

  // Applications
  getApplications: (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredApplications = [...mockData.applications];
        
        if (filters.applicantUcid) {
          filteredApplications = filteredApplications.filter(app => app.applicantUcid === filters.applicantUcid);
        }
        if (filters.employerId) {
          filteredApplications = filteredApplications.filter(app => app.employerId === filters.employerId);
        }
        if (filters.jobId) {
          filteredApplications = filteredApplications.filter(app => app.jobId === filters.jobId);
        }
        
        // Enrich application data with student and job info
        const enrichedApplications = filteredApplications.map(app => {
          const student = mockData.students.find(s => s.ucid === app.applicantUcid);
          const job = mockData.jobs.find(j => j.jobId === app.jobId);
          return {
            ...app,
            student,
            job
          };
        });

        resolve({ data: enrichedApplications });
      }, 500);
    });
  },

  // Method to get all applications for a specific student
  getStudentApplications: (ucid) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get applications for this student
        let applications = mockData.applications.filter(app => app.applicantUcid === ucid);
        
        // Enrich application data with job info
        const enrichedApplications = applications.map(app => {
          const job = mockData.jobs.find(j => j.jobId === app.jobId);
          return {
            ...app,
            job
          };
        });

        resolve({ data: enrichedApplications });
      }, 500);
    });
  },

  // New method for company applications management
  getCompanyApplications: (employerId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get applications for this employer
        let applications = mockData.applications.filter(app => {
          const job = mockData.jobs.find(j => j.jobId === app.jobId);
          return job && job.employerId === parseInt(employerId);
        });
        
        // Enrich application data with student and job info
        const enrichedApplications = applications.map(app => {
          const student = mockData.students.find(s => s.ucid === app.applicantUcid);
          const job = mockData.jobs.find(j => j.jobId === app.jobId);
          return {
            ...app,
            student,
            job
          };
        });

        resolve({ data: enrichedApplications });
      }, 500);
    });
  },

  // Add a new method to get company jobs
  getCompanyJobs: (employerId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get jobs for this employer
        const jobs = mockData.jobs.filter(job => job.employerId === parseInt(employerId));
        
        // For each job, count the applications
        const jobsWithApplicationCounts = jobs.map(job => {
          const applicationsCount = mockData.applications.filter(app => app.jobId === job.jobId).length;
          return {
            ...job,
            applicationsCount
          };
        });

        resolve({ data: jobsWithApplicationCounts });
      }, 500);
    });
  },

  // Add a new method to get job applicants
  getJobApplicants: (jobId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get applications for this job
        const applications = mockData.applications.filter(app => app.jobId === parseInt(jobId));
        
        // Enrich application data with student info
        const enrichedApplications = applications.map(app => {
          const student = mockData.students.find(s => s.ucid === app.applicantUcid);
          return {
            ...app,
            student
          };
        });

        resolve({ data: enrichedApplications });
      }, 500);
    });
  },

  // Add a new method to get details for a specific application
  getApplicationDetail: (applicationId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const application = mockData.applications.find(app => app.applicationId === parseInt(applicationId));
        
        if (!application) {
          reject({ response: { data: { message: 'Application not found' } } });
          return;
        }
        
        // Enrich application with student and job data
        const student = mockData.students.find(s => s.ucid === application.applicantUcid);
        const job = mockData.jobs.find(j => j.jobId === application.jobId);
        
        const enrichedApplication = {
          ...application,
          student,
          job
        };

        resolve({ data: enrichedApplication });
      }, 500);
    });
  },

  applyForJob: (applicationData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newApplication = {
          ...applicationData,
          applicationId: Math.max(...mockData.applications.map(a => a.applicationId)) + 1,
          status: 'Submitted',
          dateApplied: new Date().toISOString().split('T')[0]
        };
        resolve({ data: newApplication });
      }, 500);
    });
  },

  updateApplicationStatus: (id, status, feedback = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // For backward compatibility, now delegates to updateApplicationFeedback
        const data = { status };
        if (feedback) {
          data.feedback = feedback;
        }
        
        // Find and update the application in our mock data
        const appIndex = mockData.applications.findIndex(app => app.applicationId === parseInt(id));
        if (appIndex !== -1) {
          const updatedApp = { 
            ...mockData.applications[appIndex], 
            ...data,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          mockData.applications[appIndex] = updatedApp;
          resolve({ data: updatedApp });
        } else {
          resolve({ 
            data: { 
              success: true, 
              status,
              message: 'Application updated successfully'
            } 
          });
        }
      }, 500);
    });
  },

  // New method to update application feedback and status
  updateApplicationFeedback: (applicationId, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appIndex = mockData.applications.findIndex(app => app.applicationId === parseInt(applicationId));
        if (appIndex !== -1) {
          const updatedApp = { 
            ...mockData.applications[appIndex], 
            ...data,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          mockData.applications[appIndex] = updatedApp;
          resolve({ data: updatedApp });
        } else {
          reject({ response: { data: { message: 'Application not found' } } });
        }
      }, 500);
    });
  },

  // Saved Jobs
  getSavedJobs: (ucid) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get saved job IDs for this student
        const savedJobRecords = mockData.savedJobs.filter(sj => sj.ucid === ucid);
        
        // Enrich with the full job data
        const enrichedSavedJobs = savedJobRecords.map(savedJob => {
          const job = mockData.jobs.find(j => j.jobId === savedJob.jobId);
          return {
            ...savedJob,
            job
          };
        });
        
        resolve({ data: enrichedSavedJobs });
      }, 500);
    });
  },

  saveJob: (ucid, jobId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if job exists
        const job = mockData.jobs.find(j => j.jobId === jobId);
        if (!job) {
          reject({ response: { data: { message: 'Job not found' } } });
          return;
        }
        
        // Check if already saved
        const alreadySaved = mockData.savedJobs.some(sj => sj.ucid === ucid && sj.jobId === jobId);
        if (alreadySaved) {
          resolve({ data: { message: 'Job already saved' } });
          return;
        }
        
        // Create new saved job record
        const newSavedJob = {
          savedJobId: Math.max(...mockData.savedJobs.map(sj => sj.savedJobId), 0) + 1,
          ucid,
          jobId,
          dateSaved: new Date().toISOString().split('T')[0]
        };
        
        // For local state update, we'll add it to our mock data copy
        mockData.savedJobs.push(newSavedJob);
        
        resolve({ data: newSavedJob });
      }, 500);
    });
  },

  unsaveJob: (ucid, jobId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // For local state update, we'll remove it from our mock data copy
        const index = mockData.savedJobs.findIndex(sj => sj.ucid === ucid && sj.jobId === jobId);
        if (index !== -1) {
          mockData.savedJobs.splice(index, 1);
        }
        
        resolve({ data: { success: true } });
      }, 500);
    });
  },

  isJobSaved: (ucid, jobId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSaved = mockData.savedJobs.some(sj => sj.ucid === ucid && sj.jobId === jobId);
        resolve({ data: { isSaved } });
      }, 500);
    });
  },

  // Verification
  getVerifications: (type, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data;
        if (type === 'student') {
          data = mockData.verifications;
          if (status) {
            data = data.filter(v => v.verificationStatus === status);
          }
          // Enrich with student data
          data = data.map(v => {
            const student = mockData.students.find(s => s.ucid === v.applicantUcid);
            return { ...v, student };
          });
        } else if (type === 'employer') {
          data = mockData.employerVerifications;
          if (status) {
            data = data.filter(v => v.verificationStatus === status);
          }
          // Enrich with employer data
          data = data.map(v => {
            const employer = mockData.employers.find(e => e.employerId === v.employerId);
            return { ...v, employer };
          });
        }
        resolve({ data });
      }, 500);
    });
  },

  verifyEntity: (type, id, status, feedback = '') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type === 'student') {
          // Update student verification status
          const studentIndex = mockData.students.findIndex(s => s.ucid === id);
          if (studentIndex !== -1) {
            mockData.students[studentIndex].verificationStatus = status;
            if (status === 'Rejected' && feedback) {
              mockData.students[studentIndex].feedback = feedback;
            } else if (status === 'Verified') {
              // Remove any previous feedback
              delete mockData.students[studentIndex].feedback;
            }
          }
          
          // Update verification record
          const verificationIndex = mockData.verifications.findIndex(v => v.applicantUcid === id);
          if (verificationIndex !== -1) {
            mockData.verifications[verificationIndex].verificationStatus = status;
            mockData.verifications[verificationIndex].verificationDate = status === 'Verified' ? new Date().toISOString().split('T')[0] : null;
          }
        } else if (type === 'employer') {
          // Update employer verification status
          const employerIndex = mockData.employers.findIndex(e => e.employerId === parseInt(id));
          if (employerIndex !== -1) {
            mockData.employers[employerIndex].verificationStatus = status;
            if (status === 'Rejected' && feedback) {
              mockData.employers[employerIndex].feedback = feedback;
            } else if (status === 'Verified') {
              // Remove any previous feedback
              delete mockData.employers[employerIndex].feedback;
            }
          }
          
          // Update verification record
          const verificationIndex = mockData.employerVerifications.findIndex(v => v.employerId === parseInt(id));
          if (verificationIndex !== -1) {
            mockData.employerVerifications[verificationIndex].verificationStatus = status;
            mockData.employerVerifications[verificationIndex].verificationDate = status === 'Verified' ? new Date().toISOString().split('T')[0] : null;
          }
        }
        
        resolve({ data: { success: true, status, feedback } });
      }, 500);
    });
  },
  
  // Approve student or employer verification
  approveVerification: (type, id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = mockApi.verifyEntity(type, id, 'Verified');
        resolve(result);
      }, 500);
    });
  },
  
  // Reject student or employer verification with feedback
  rejectVerification: (type, id, feedback) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!feedback || feedback.trim() === '') {
          reject({ response: { data: { message: 'Feedback is required for rejection' } } });
          return;
        }
        
        const result = mockApi.verifyEntity(type, id, 'Rejected', feedback);
        resolve(result);
      }, 500);
    });
  },
  
  // Check verification status
  checkVerificationStatus: (type, id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let status = 'Unknown';
        let feedback = '';
        
        if (type === 'student') {
          const student = mockData.students.find(s => s.ucid === id);
          if (student) {
            status = student.verificationStatus || 'Pending';
            feedback = student.feedback || '';
          }
        } else if (type === 'employer') {
          const employer = mockData.employers.find(e => e.employerId === parseInt(id));
          if (employer) {
            status = employer.verificationStatus || 'Pending';
            feedback = employer.feedback || '';
          }
        }
        
        resolve({ data: { status, feedback } });
      }, 500);
    });
  },

  // Posts
  getPosts: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Enrich posts with student data
        const enrichedPosts = mockData.posts.map(post => {
          const student = mockData.students.find(s => s.ucid === post.vucid);
          return { ...post, student };
        });
        resolve({ data: enrichedPosts });
      }, 500);
    });
  },

  createPost: (postData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPost = {
          ...postData,
          postId: Math.max(...mockData.posts.map(p => p.postId)) + 1,
          date: new Date().toISOString().split('T')[0]
        };
        resolve({ data: newPost });
      }, 500);
    });
  },

  // Forum Methods
  getForumPosts: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = {
          ucid: localStorage.getItem('ucid'),
          employerId: localStorage.getItem('employerId'),
          moderatorId: localStorage.getItem('moderatorId')
        };
        
        // Calculate community scores for each user type
        const communityScores = {
          students: {},
          employers: {},
          moderators: {}
        };
        
        // Calculate scores based on upvotes received
        mockData.forumPosts.forEach(post => {
          if (post.authorType === 'student' && post.authorUcid) {
            communityScores.students[post.authorUcid] = (communityScores.students[post.authorUcid] || 0) + post.upvotes;
          } else if (post.authorType === 'employer' && post.authorEmployerId) {
            communityScores.employers[post.authorEmployerId] = (communityScores.employers[post.authorEmployerId] || 0) + post.upvotes;
          } else if (post.authorType === 'moderator' && post.authorModeratorId) {
            communityScores.moderators[post.authorModeratorId] = (communityScores.moderators[post.authorModeratorId] || 0) + post.upvotes;
          }
        });
        
        // Check if user has upvoted each post
        const enrichedPosts = mockData.forumPosts.map(post => {
          const hasUpvoted = mockData.forumUpvotes.some(upvote => 
            upvote.forumPostId === post.forumPostId && 
            ((currentUser.ucid && upvote.ucid === currentUser.ucid) ||
             (currentUser.employerId && upvote.employerId === parseInt(currentUser.employerId)) ||
             (currentUser.moderatorId && upvote.moderatorId === parseInt(currentUser.moderatorId)))
          );
          
          // Count comments for this post
          const commentCount = mockData.forumComments ? 
            mockData.forumComments.filter(comment => comment.forumPostId === post.forumPostId).length : 0;
          
          // Add author's community score
          let communityScore = 0;
          if (post.authorType === 'student' && post.authorUcid) {
            communityScore = communityScores.students[post.authorUcid] || 0;
          } else if (post.authorType === 'employer' && post.authorEmployerId) {
            communityScore = communityScores.employers[post.authorEmployerId] || 0;
          } else if (post.authorType === 'moderator' && post.authorModeratorId) {
            communityScore = communityScores.moderators[post.authorModeratorId] || 0;
          }
          
          return {
            ...post,
            hasUpvoted,
            commentCount,
            communityScore
          };
        });
        
        resolve({ data: enrichedPosts });
      }, 500);
    });
  },

  createForumPost: (postData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Validate that at least one author ID is specified
          if (!postData.authorUcid && !postData.authorEmployerId && !postData.authorModeratorId) {
            reject({ response: { data: { message: 'Author information is required' } } });
            return;
          }
          
          // Determine author type and name
          let authorType, authorName, companyName;
          
          if (postData.authorUcid) {
            const student = mockData.students.find(s => s.ucid === postData.authorUcid);
            if (!student) {
              reject({ response: { data: { message: 'Student not found' } } });
              return;
            }
            authorType = 'student';
            authorName = student.name;
          } else if (postData.authorEmployerId) {
            const employer = mockData.employers.find(e => e.employerId === parseInt(postData.authorEmployerId));
            if (!employer) {
              reject({ response: { data: { message: 'Employer not found' } } });
              return;
            }
            authorType = 'employer';
            companyName = employer.companyName;
          } else {
            const moderator = mockData.moderators.find(m => m.moderatorId === parseInt(postData.authorModeratorId));
            if (!moderator) {
              reject({ response: { data: { message: 'Moderator not found' } } });
              return;
            }
            authorType = 'moderator';
          }
          
          // Create new post
          const newPost = {
            forumPostId: Math.max(...mockData.forumPosts.map(p => p.forumPostId), 0) + 1,
            title: postData.title,
            content: postData.content,
            authorUcid: postData.authorUcid || null,
            authorEmployerId: postData.authorEmployerId ? parseInt(postData.authorEmployerId) : null,
            authorModeratorId: postData.authorModeratorId ? parseInt(postData.authorModeratorId) : null,
            authorType,
            authorName,
            companyName,
            datePosted: new Date().toISOString().split('T')[0],
            upvotes: 0,
            hasUpvoted: false // The creator hasn't upvoted yet
          };
          
          // Add to mock data
          mockData.forumPosts.push(newPost);
          
          resolve({ data: newPost });
        } catch (err) {
          reject({ response: { data: { message: 'Error creating forum post', error: err.message } } });
        }
      }, 500);
    });
  },

  upvoteForumPost: (postId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const post = mockData.forumPosts.find(p => p.forumPostId === postId);
        if (!post) {
          reject({ response: { data: { message: 'Forum post not found' } } });
          return;
        }
        
        const currentUser = {
          ucid: localStorage.getItem('ucid'),
          employerId: localStorage.getItem('employerId'),
          moderatorId: localStorage.getItem('moderatorId')
        };
        
        // Ensure the user is logged in
        if (!currentUser.ucid && !currentUser.employerId && !currentUser.moderatorId) {
          reject({ response: { data: { message: 'Authentication required' } } });
          return;
        }
        
        // Check if user has already upvoted this post
        const hasUpvoted = mockData.forumUpvotes.some(upvote => 
          upvote.forumPostId === postId && 
          ((currentUser.ucid && upvote.ucid === currentUser.ucid) ||
           (currentUser.employerId && upvote.employerId === parseInt(currentUser.employerId)) ||
           (currentUser.moderatorId && upvote.moderatorId === parseInt(currentUser.moderatorId)))
        );
        
        if (hasUpvoted) {
          reject({ response: { data: { message: 'You have already upvoted this post' } } });
          return;
        }
        
        // Create new upvote record
        const newUpvote = {
          upvoteId: Math.max(...mockData.forumUpvotes.map(u => u.upvoteId), 0) + 1,
          forumPostId: postId
        };
        
        // Add appropriate user ID
        if (currentUser.ucid) {
          newUpvote.ucid = currentUser.ucid;
        } else if (currentUser.employerId) {
          newUpvote.employerId = parseInt(currentUser.employerId);
        } else {
          newUpvote.moderatorId = parseInt(currentUser.moderatorId);
        }
        
        // Add to mock data
        mockData.forumUpvotes.push(newUpvote);
        
        // Increment upvote count for the post
        const postIndex = mockData.forumPosts.findIndex(p => p.forumPostId === postId);
        mockData.forumPosts[postIndex].upvotes += 1;
        
        // Get information about the author for the response
        let authorInfo = null;
        if (post.authorType === 'student' && post.authorUcid) {
          const student = mockData.students.find(s => s.ucid === post.authorUcid);
          authorInfo = {
            type: 'student',
            name: student?.name || 'Student',
            id: post.authorUcid
          };
        } else if (post.authorType === 'employer' && post.authorEmployerId) {
          const employer = mockData.employers.find(e => e.employerId === post.authorEmployerId);
          authorInfo = {
            type: 'employer',
            name: employer?.companyName || 'Employer',
            id: post.authorEmployerId
          };
        } else if (post.authorType === 'moderator' && post.authorModeratorId) {
          authorInfo = {
            type: 'moderator',
            name: 'Moderator',
            id: post.authorModeratorId
          };
        }
        
        resolve({ 
          data: { 
            success: true,
            message: "Upvote recorded successfully. This contributes to the author's community score.",
            authorInfo 
          } 
        });
      }, 500);
    });
  },

  deleteForumPost: (postId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const postIndex = mockData.forumPosts.findIndex(p => p.forumPostId === postId);
        if (postIndex === -1) {
          reject({ response: { data: { message: 'Forum post not found' } } });
          return;
        }
        
        const post = mockData.forumPosts[postIndex];
        const currentUser = {
          ucid: localStorage.getItem('ucid'),
          employerId: localStorage.getItem('employerId'),
          moderatorId: localStorage.getItem('moderatorId'),
          userRole: localStorage.getItem('userRole')
        };
        
        // Check if user is authorized to delete this post
        // (Either the post author or a moderator)
        const isAuthor = 
          (currentUser.ucid && post.authorUcid === currentUser.ucid) ||
          (currentUser.employerId && post.authorEmployerId === parseInt(currentUser.employerId)) ||
          (currentUser.moderatorId && post.authorModeratorId === parseInt(currentUser.moderatorId));
        
        const isModerator = currentUser.userRole === 'moderator';
        
        if (!isAuthor && !isModerator) {
          reject({ response: { data: { message: 'Not authorized to delete this post' } } });
          return;
        }
        
        // Remove post from mock data
        mockData.forumPosts.splice(postIndex, 1);
        
        // Remove associated upvotes
        mockData.forumUpvotes = mockData.forumUpvotes.filter(u => u.forumPostId !== postId);
        
        // Remove associated comments
        if (mockData.forumComments) {
          mockData.forumComments = mockData.forumComments.filter(c => c.forumPostId !== postId);
        }
        
        resolve({ data: { success: true } });
      }, 500);
    });
  },
  
  // New methods for forum comments
  getForumComments: (postId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!mockData.forumComments) {
          mockData.forumComments = [];
        }
        
        // Get comments for this post
        const comments = mockData.forumComments.filter(comment => 
          comment.forumPostId === postId
        );
        
        // Sort by date (newest first)
        const sortedComments = comments.sort((a, b) => 
          new Date(b.datePosted) - new Date(a.datePosted)
        );
        
        resolve({ data: sortedComments });
      }, 500);
    });
  },
  
  createForumComment: (commentData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Validate that we have post ID and content
          if (!commentData.forumPostId || !commentData.content) {
            reject({ response: { data: { message: 'Post ID and content are required' } } });
            return;
          }
          
          // Validate that at least one author ID is specified
          if (!commentData.authorUcid && !commentData.authorEmployerId && !commentData.authorModeratorId) {
            reject({ response: { data: { message: 'Author information is required' } } });
            return;
          }
          
          // Determine author type and name
          let authorType, authorName, companyName;
          
          if (commentData.authorUcid) {
            const student = mockData.students.find(s => s.ucid === commentData.authorUcid);
            if (!student) {
              reject({ response: { data: { message: 'Student not found' } } });
              return;
            }
            authorType = 'student';
            authorName = student.name;
          } else if (commentData.authorEmployerId) {
            const employer = mockData.employers.find(e => e.employerId === parseInt(commentData.authorEmployerId));
            if (!employer) {
              reject({ response: { data: { message: 'Employer not found' } } });
              return;
            }
            authorType = 'employer';
            companyName = employer.companyName;
          } else {
            const moderator = mockData.moderators.find(m => m.moderatorId === parseInt(commentData.authorModeratorId));
            if (!moderator) {
              reject({ response: { data: { message: 'Moderator not found' } } });
              return;
            }
            authorType = 'moderator';
          }
          
          // Ensure forumComments array exists
          if (!mockData.forumComments) {
            mockData.forumComments = [];
          }
          
          // Create new comment
          const newComment = {
            commentId: Math.max(...(mockData.forumComments.map(c => c.commentId) || [0]), 0) + 1,
            forumPostId: commentData.forumPostId,
            content: commentData.content,
            authorUcid: commentData.authorUcid || null,
            authorEmployerId: commentData.authorEmployerId ? parseInt(commentData.authorEmployerId) : null,
            authorModeratorId: commentData.authorModeratorId ? parseInt(commentData.authorModeratorId) : null,
            authorType,
            authorName,
            companyName,
            datePosted: new Date().toISOString()
          };
          
          // Add to mock data
          mockData.forumComments.push(newComment);
          
          resolve({ data: newComment });
        } catch (err) {
          reject({ response: { data: { message: 'Error creating comment', error: err.message } } });
        }
      }, 500);
    });
  },
  
  deleteForumComment: (commentId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!mockData.forumComments) {
          reject({ response: { data: { message: 'Comment not found' } } });
          return;
        }
        
        const commentIndex = mockData.forumComments.findIndex(c => c.commentId === commentId);
        if (commentIndex === -1) {
          reject({ response: { data: { message: 'Comment not found' } } });
          return;
        }
        
        const comment = mockData.forumComments[commentIndex];
        const currentUser = {
          ucid: localStorage.getItem('ucid'),
          employerId: localStorage.getItem('employerId'),
          moderatorId: localStorage.getItem('moderatorId'),
          userRole: localStorage.getItem('userRole')
        };
        
        // Check if user is authorized to delete this comment
        // (Either the comment author or a moderator)
        const isAuthor = 
          (currentUser.ucid && comment.authorUcid === currentUser.ucid) ||
          (currentUser.employerId && comment.authorEmployerId === parseInt(currentUser.employerId)) ||
          (currentUser.moderatorId && comment.authorModeratorId === parseInt(currentUser.moderatorId));
        
        const isModerator = currentUser.userRole === 'moderator';
        
        if (!isAuthor && !isModerator) {
          reject({ response: { data: { message: 'Not authorized to delete this comment' } } });
          return;
        }
        
        // Remove comment from mock data
        mockData.forumComments.splice(commentIndex, 1);
        
        resolve({ data: { success: true } });
      }, 500);
    });
  },

  // Get user's community score (total upvotes received)
  getUserCommunityScore: (userType, userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let score = 0;
        
        // Filter posts by the specific user
        const userPosts = mockData.forumPosts.filter(post => {
          if (userType === 'student' && post.authorUcid === userId) return true;
          if (userType === 'employer' && post.authorEmployerId === parseInt(userId)) return true;
          if (userType === 'moderator' && post.authorModeratorId === parseInt(userId)) return true;
          return false;
        });
        
        // Sum up all upvotes (each upvote = 1 point)
        score = userPosts.reduce((total, post) => total + post.upvotes, 0);
        
        // Calculate bonus points based on number of posts (each post = 2 bonus points, up to 10 posts)
        const postBonus = Math.min(userPosts.length, 10) * 2;
        
        // Add bonus points for regular engagement
        score += postBonus;
        
        resolve({ 
          data: { 
            score,
            postCount: userPosts.length,
            upvotes: userPosts.reduce((total, post) => total + post.upvotes, 0),
            postBonus
          } 
        });
      }, 500);
    });
  }
};

// INTEGRATION POINT #5:
// Real API implementation 
// Add any additional methods needed for the real API here
// The existing axios instance (api) will be used for real API calls

// INTEGRATION POINT #6:
// Additional real API methods
// If your Django endpoints don't match the mock API method names exactly,
// you can create adapter methods here to maintain compatibility with existing components
/*
// Example adapter pattern:
const realApi = {
  ...api,
  
  // Example: If backend uses a different endpoint structure for login
  login: (credentials) => {
    return api.post('/auth/token/', credentials);
  },
  
  // Example: If backend uses different parameter formats
  getStudentProfile: (ucid) => {
    return api.get(`/students/${ucid}/`);
  },
}
*/

// INTEGRATION POINT #7:
// Export the appropriate API based on the USE_MOCK_DATA flag
// When ready to use the real backend, just set USE_MOCK_DATA to false
export default USE_MOCK_DATA ? mockApi : api;
