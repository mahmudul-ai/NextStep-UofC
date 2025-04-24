import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, ListGroup, Alert, Spinner, Modal, InputGroup, Pagination, FormControl } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'popular'
  const [currentPage, setCurrentPage] = useState(1);
  const [showPostModal, setShowPostModal] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [testingPost, setTestingPost] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [userPostCount, setUserPostCount] = useState(0);
  
  // Get URL search params
  const [searchParams] = useSearchParams();
  const postIdParam = searchParams.get('postId');
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my-posts'
  
  const POSTS_PER_PAGE = 5;
  
  // INTEGRATION POINT #1:
  // User authentication info from localStorage
  // When integrating with Django's authentication system,
  // ensure these values are properly set during login
  const ucid = localStorage.getItem('ucid');
  const employerId = localStorage.getItem('employerId');
  const moderatorId = localStorage.getItem('moderatorId');
  const userRole = localStorage.getItem('userRole');
  
  // Determine if user can post (any authenticated user)
  const canPost = !!(ucid || employerId || moderatorId);
  
  // Enhanced moderator status check - checking both userRole and moderatorId
  const isModerator = userRole === 'moderator' || !!moderatorId;
  
  // INTEGRATION POINT #2:
  // API data fetching
  // This will work automatically when switching to real API
  // if your Django endpoints match the expected response format
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.getForumPosts();
        
        // Enhance the post data with author information
        const enhancedPosts = await enhancePostsWithAuthorInfo(response.data);
        
        setPosts(enhancedPosts);
        setFilteredPosts(enhancedPosts);
        
        // If a post ID is provided in URL, find and open that post
        if (postIdParam) {
          const targetPost = enhancedPosts.find(post => post.forumPostId === parseInt(postIdParam));
          if (targetPost) {
            setCurrentPost(targetPost);
            setShowPostModal(true);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching forum posts:", err);
        setError("Failed to load forum posts. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [postIdParam]);
  
  // Function to enhance posts with author information
  const enhancePostsWithAuthorInfo = async (postsData) => {
    if (!postsData || postsData.length === 0) return postsData;
    
    try {
      console.log('Enhancing posts with author info:', postsData);
      
      // Get student data for matching author IDs
      const studentResponse = await api.get('/students/');
      const students = studentResponse.data || [];
      console.log('Retrieved students:', students);
      
      // Get employer data for matching author IDs
      const employerResponse = await api.get('/employers/');
      const employers = employerResponse.data || [];
      console.log('Retrieved employers:', employers);
      
      // Get moderator data
      const moderatorResponse = await api.get('/moderators/');
      const moderators = moderatorResponse.data || [];
      const moderatorIds = moderators.map(m => m.ModeratorID.toString());
      console.log('Retrieved moderators:', moderators);
      
      // Count posts by each author to calculate community score
      const authorPostCounts = {};
      postsData.forEach(post => {
        const authorId = post.authorId || post.VUCID;
        if (authorId) {
          const authorIdStr = authorId.toString();
          authorPostCounts[authorIdStr] = (authorPostCounts[authorIdStr] || 0) + 1;
        }
      });
      console.log('Author post counts:', authorPostCounts);
      
      // Update current user's post count if logged in
      const currentUserId = ucid || employerId || moderatorId;
      if (currentUserId) {
        setUserPostCount(authorPostCounts[currentUserId.toString()] || 0);
      }
      
      // Create a direct mapping of IDs to names and types for quick lookup
      const userMap = {};
      
      // Add all students to the map
      students.forEach(student => {
        const id = student.UCID.toString();
        userMap[id] = {
          name: `${student.FName} ${student.LName}`,
          type: 'student',
          isModerator: moderatorIds.includes(id),
          postCount: authorPostCounts[id] || 0
        };
      });
      
      // Add all employers to the map
      employers.forEach(employer => {
        const id = employer.EmployerID.toString();
        userMap[id] = {
          name: employer.CompanyName,
          type: 'employer',
          isModerator: false,
          postCount: authorPostCounts[id] || 0
        };
      });
      
      console.log('User ID mapping:', userMap);
      
      // Process each post to add author information
      const enhancedPosts = [];
      
      for (const post of postsData) {
        // Standardize the post format first
        const standardPost = {
          forumPostId: post.forumPostId || post.PostID,
          content: post.content || post.Content,
          datePosted: post.datePosted || post.Date,
          VUCID: post.VUCID,
          authorId: post.authorId || post.VUCID
        };
        
        // Handle different post structures - posts might have authorId, VUCID, or other fields
        const authorId = standardPost.authorId;
        if (!authorId) {
          console.log('No author ID found for post:', post);
          enhancedPosts.push(standardPost);
          continue;
        }
        
        const authorIdStr = authorId.toString();
        console.log(`Processing post ${standardPost.forumPostId}, author ID: ${authorIdStr}`);
        
        // Look up the author in our mapping
        const userInfo = userMap[authorIdStr];
        if (userInfo) {
          console.log(`Found user info for ID ${authorIdStr}:`, userInfo);
          
          // If user is a moderator, set appropriate type
          const authorType = userInfo.isModerator ? 'moderator' : userInfo.type;
          
          enhancedPosts.push({
            ...standardPost,
            authorType,
            authorName: userInfo.name,
            isModerator: userInfo.isModerator,
            authorPostCount: userInfo.postCount || authorPostCounts[authorIdStr] || 0,
            communityScore: userInfo.postCount || authorPostCounts[authorIdStr] || 0,
            // For employers, also set companyName
            ...(userInfo.type === 'employer' ? { companyName: userInfo.name } : {})
          });
        } else {
          console.log(`No user info found for ID ${authorIdStr}`);
          // No matching user found
          enhancedPosts.push({
            ...standardPost,
            authorType: 'unknown',
            authorName: `User ${authorIdStr}`,
            isModerator: false,
            authorPostCount: authorPostCounts[authorIdStr] || 0,
            communityScore: authorPostCounts[authorIdStr] || 0
          });
        }
      }
      
      console.log('Enhanced posts:', enhancedPosts);
      return enhancedPosts;
    } catch (error) {
      console.error('Error enhancing posts with author info:', error);
      return postsData.map(post => ({
        forumPostId: post.forumPostId || post.PostID,
        content: post.content || post.Content,
        datePosted: post.datePosted || post.Date,
        VUCID: post.VUCID,
        authorId: post.VUCID || post.authorId,
        authorType: 'unknown',
        authorName: `User ${post.VUCID || post.authorId || 'Unknown'}`,
        isModerator: false,
        communityScore: 0
      }));
    }
  };
  
  // Set active tab based on URL parameter
  useEffect(() => {
    if (tabParam === 'my-posts') {
      setActiveTab('my-posts');
    } else {
      setActiveTab('all');
    }
  }, [tabParam]);
  
  // Update filtered posts when filters change
  useEffect(() => {
    if (!posts) return;
    
    let filtered = [...posts];
    
    // Filter by tab
    if (activeTab === 'my-posts') {
      const userId = ucid || employerId || moderatorId;
      filtered = filtered.filter(post => {
        const postAuthorId = post.authorId || post.VUCID;
        return postAuthorId && postAuthorId.toString() === userId?.toString();
      });
    }
    
    // Sort posts
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.authorPostCount || 0) - (a.authorPostCount || 0));
    }
    
    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [posts, activeTab, sortBy, ucid, employerId, moderatorId]);
  
  // INTEGRATION POINT #4:
  // Creating new forum posts
  // Adjust the data format if your Django API requires different field names
  const handleCreatePost = async () => {
    // Validate form - only check content now
    if (!newPostContent.trim()) {
      alert("Please enter content for your post.");
      return;
    }
    
    try {
      setSubmittingPost(true);
      
      const authorId = ucid || employerId || moderatorId;
      if (!authorId) {
        alert("No user ID found. Please ensure you're logged in.");
        setSubmittingPost(false);
        return;
      }
      
      // Get current date in YYYY-MM-DD format like the test function uses
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Use the same format that worked in the test (Format 5)
      const postData = {
        Content: newPostContent,
        VUCID: parseInt(authorId),
        Date: currentDate
      };
      
      console.log('Creating forum post with data:', postData);
      
      // Import axios directly at the top of the file
      // Use direct axios call with explicit headers like in Format 5
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
      const response = await axios.post(`${API_BASE_URL}/posts/`, postData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      console.log('Post created successfully:', response.data);
      
      // Add the new post to state - we need to format it to match the expected structure
      const newPost = {
        forumPostId: response.data.PostID,
        content: response.data.Content,
        datePosted: response.data.Date,
        VUCID: response.data.VUCID, // Keep the original VUCID format
        authorId: response.data.VUCID, // Also include as authorId for compatibility
        // Add author type and name based on current user
        authorType: userRole || 'student',
        authorName: localStorage.getItem('userName') || `User ${response.data.VUCID}`,
        // Community score will be calculated when posts are enhanced
        communityScore: 1 // New post, so score is 1
      };
      
      setPosts([newPost, ...posts]);
      
      // Reset form and close modal
      setNewPostContent('');
      setShowNewPostModal(false);
      setSubmittingPost(false);
      
      // Show success message
      alert("Post created successfully!");
    } catch (err) {
      console.error("Error creating forum post:", err);
      alert("Failed to create post. Please try again.");
      setSubmittingPost(false);
    }
  };
  
  // New test function to debug post creation
  const handleTestPostCreation = async () => {
    if (!newPostContent.trim()) {
      alert("Please enter some content to test post creation.");
      return;
    }
    
    try {
      setTestingPost(true);
      setTestResults(null);
      
      console.log('Testing post creation with content:', newPostContent);
      console.log('Using author ID:', ucid || employerId || moderatorId);
      
      const authorId = ucid || employerId || moderatorId;
      if (!authorId) {
        alert("No user ID found. Please ensure you're logged in.");
        setTestingPost(false);
        return;
      }
      
      const results = await api.testCreatePost(newPostContent, authorId);
      console.log('Test post creation results:', results);
      
      setTestResults(results);
      
      if (results.success) {
        alert(`Post created successfully using format: ${results.message}`);
      } else {
        alert(`All post creation formats failed. Check console for details.`);
      }
    } catch (err) {
      console.error("Error in test post creation:", err);
      setTestResults({
        success: false,
        message: err.message,
        error: err
      });
      alert("Error testing post creation. Check console for details.");
    } finally {
      setTestingPost(false);
    }
  };
  
  // INTEGRATION POINT #7:
  // Moderator functionality
  // Ensure your Django API has proper authorization for deletion
  const handleDeletePost = async (postId) => {
    // Get the post to check if user is the author
    const post = posts.find(p => p.forumPostId === postId);
    if (!post) return;
    
    const currentUserId = ucid || employerId || moderatorId;
    
    // Skip author check for moderators
    if (!isModerator) {
      // Check if user is allowed to delete this post
      const isPostAuthor = 
        (post.authorId && post.authorId.toString() === currentUserId?.toString()) ||
        (ucid && post.authorUcid === ucid) || 
        (employerId && post.authorEmployerId === parseInt(employerId)) ||
        (moderatorId && post.authorModeratorId === parseInt(moderatorId));
      
      if (!isPostAuthor) return;
    }
    
    if (window.confirm(isModerator && !post.authorId.toString() === currentUserId?.toString() 
      ? "You are deleting another user's post as a moderator. This action cannot be undone."
      : "Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await api.deleteForumPost(postId);
        
        // Remove the post from local state
        setPosts(posts.filter(post => post.forumPostId !== postId));
        
        // Close the modal if it's open
        if (showPostModal && currentPost && currentPost.forumPostId === postId) {
          setShowPostModal(false);
        }
      } catch (err) {
        console.error("Error deleting post:", err);
        alert("Failed to delete post. Please try again.");
      }
    }
  };
  
  // Open post modal to view a specific post in full
  const openPostModal = (post) => {
    setCurrentPost(post);
    setShowPostModal(true);
  };
  
  // INTEGRATION POINT #8:
  // Data formatting utilities
  // Fix date formatting to ensure no timezone adjustment
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      // Use direct string manipulation to avoid timezone issues
      // Expected format: YYYY-MM-DD
      const parts = dateString.split('-');
      if (parts.length !== 3) {
        return dateString; // Return original if not in expected format
      }
      
      const year = parts[0];
      const month = parseInt(parts[1]);
      const day = parseInt(parts[2]);
      
      // Map month number to name
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[month - 1]; // -1 because array is 0-indexed
      
      return `${monthName} ${day}, ${year}`;
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString;
    }
  };
  
  // Calculate pagination
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  
  // Generate pagination items
  const paginationItems = [];
  
  // Always show first page
  paginationItems.push(
    <Pagination.Item 
      key={1} 
      active={currentPage === 1}
      onClick={() => setCurrentPage(1)}
    >
      1
    </Pagination.Item>
  );
  
  // Add ellipsis if needed
  if (currentPage > 3) {
    paginationItems.push(<Pagination.Ellipsis key="ellipsis-1" />);
  }
  
  // Show pages around current page
  for (let number = Math.max(2, currentPage - 1); number <= Math.min(totalPages - 1, currentPage + 1); number++) {
    paginationItems.push(
      <Pagination.Item 
        key={number} 
        active={number === currentPage}
        onClick={() => setCurrentPage(number)}
      >
        {number}
      </Pagination.Item>
    );
  }
  
  // Add ellipsis if needed
  if (currentPage < totalPages - 2) {
    paginationItems.push(<Pagination.Ellipsis key="ellipsis-2" />);
  }
  
  // Always show last page
  if (totalPages > 1) {
    paginationItems.push(
      <Pagination.Item 
        key={totalPages} 
        active={currentPage === totalPages}
        onClick={() => setCurrentPage(totalPages)}
      >
        {totalPages}
      </Pagination.Item>
    );
  }
  
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading forum posts...</span>
        </Spinner>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-0">Community Forum</h1>
          <p className="text-muted">Share your thoughts and insights with the NextStep community</p>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => setShowNewPostModal(true)}
            disabled={!canPost}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create New Post
          </Button>
        </Col>
      </Row>
      
      {/* Error alert */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Search and filter card */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center mb-3">
            <Col>
              <div className="d-flex align-items-center">
                <Button 
                  variant={activeTab === 'all' ? "primary" : "outline-primary"}
                  onClick={() => setActiveTab('all')}
                  className="me-2"
                >
                  All Posts
                </Button>
                {canPost && (
                  <Button 
                    variant={activeTab === 'my-posts' ? "primary" : "outline-primary"}
                    onClick={() => setActiveTab('my-posts')}
                  >
                    My Posts
                    {userPostCount > 0 && (
                      <Badge 
                        bg="success" 
                        className="ms-2" 
                        pill
                      >
                        {userPostCount}
                      </Badge>
                    )}
                  </Button>
                )}
              </div>
            </Col>
          </Row>
          
          <Row className="align-items-center">
            <Col className="d-flex justify-content-md-end">
              <div>
                <strong className="me-2">Sort by:</strong>
                <Button 
                  variant={sortBy === 'recent' ? "primary" : "outline-primary"} 
                  size="sm"
                  className="me-2"
                  onClick={() => setSortBy('recent')}
                >
                  Most Recent
                </Button>
                <Button 
                  variant={sortBy === 'popular' ? "primary" : "outline-primary"} 
                  size="sm"
                  onClick={() => setSortBy('popular')}
                >
                  Most Active
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* User status card */}
      {!canPost && (
        <Alert variant="info" className="mb-4">
          <i className="bi bi-info-circle me-2"></i>
          Sign in to create posts and upvote content to contribute to community scores
        </Alert>
      )}
      
      {isModerator && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-shield-fill me-2"></i>
          <strong>Moderator Mode Active</strong> - You have the ability to delete any posts in the forum
        </Alert>
      )}
      
      {/* Forum posts */}
      {filteredPosts.length === 0 ? (
        <Alert variant="info">
          {activeTab === 'my-posts' ? 
            'You haven\'t created any posts yet. Create a new post to join the discussion!' : 
            'No posts yet. Be the first to create a post in the community forum!'}
        </Alert>
      ) : (
        <div>
          {currentPosts.map(post => (
            <Card key={post.forumPostId} className="mb-3 shadow-sm">
              <Card.Body>
                <div>
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 
                      className="mb-1" 
                      style={{ cursor: 'pointer', color: '#0d6efd' }} 
                      onClick={() => openPostModal(post)}
                    >
                      {post.title}
                    </h5>
                    {/* Delete button for moderators or post author */}
                    {(isModerator || 
                      (post.authorId && post.authorId.toString() === (ucid || employerId || moderatorId)?.toString()) ||
                      (ucid && post.authorUcid === ucid) || 
                      (employerId && post.authorEmployerId === parseInt(employerId)) ||
                      (moderatorId && post.authorModeratorId === parseInt(moderatorId))) && (
                      <Button 
                        variant={isModerator && !(
                          (post.authorId && post.authorId.toString() === (ucid || employerId || moderatorId)?.toString()) ||
                          (ucid && post.authorUcid === ucid) || 
                          (employerId && post.authorEmployerId === parseInt(employerId)) ||
                          (moderatorId && post.authorModeratorId === parseInt(moderatorId))
                        ) ? "danger" : "outline-danger"}
                        size="sm"
                        onClick={() => handleDeletePost(post.forumPostId)}
                        title={isModerator && !(
                          (post.authorId && post.authorId.toString() === (ucid || employerId || moderatorId)?.toString()) ||
                          (ucid && post.authorUcid === ucid) || 
                          (employerId && post.authorEmployerId === parseInt(employerId)) ||
                          (moderatorId && post.authorModeratorId === parseInt(moderatorId))
                        ) ? "Delete as moderator" : "Delete post"}
                      >
                        <i className="bi bi-trash"></i>
                        {isModerator && !(
                          (post.authorId && post.authorId.toString() === (ucid || employerId || moderatorId)?.toString()) ||
                          (ucid && post.authorUcid === ucid) || 
                          (employerId && post.authorEmployerId === parseInt(employerId)) ||
                          (moderatorId && post.authorModeratorId === parseInt(moderatorId))
                        ) && <span className="ms-1" style={{fontSize: "0.8rem"}}>Mod</span>}
                      </Button>
                    )}
                  </div>
                  <p className="text-muted mb-2">
                    <small>
                      Posted by{' '}
                      <strong>
                        {post.authorType === 'student' ? post.authorName : 
                         post.authorType === 'employer' ? (post.companyName || post.authorName) : 
                         post.authorType === 'moderator' ? (post.authorName || 'Moderator') :
                         `User ${post.authorId || post.VUCID || 'Unknown'}`}
                      </strong>
                      {' '}on {formatDate(post.datePosted)}
                    </small>
                    <Badge 
                      bg={
                        post.authorType === 'student' ? 'info' : 
                        post.authorType === 'employer' ? 'primary' : 
                        post.authorType === 'moderator' ? 'danger' :
                        'secondary'
                      }
                      className="ms-2"
                    >
                      {post.authorType === 'student' ? 'Student' : 
                       post.authorType === 'employer' ? 'Employer' : 
                       post.authorType === 'moderator' ? 'Moderator' :
                       'User'}
                    </Badge>
                  </p>
                  <div className="mt-3">
                    <p className="mb-0" style={{ 
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis'
                    }}>
                      {post.content}
                    </p>
                  </div>
                  
                  {/* View button */}
                  <div className="mt-3">
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => openPostModal(post)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      View Post
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  onClick={() => setCurrentPage(currentPage => Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                />
                {paginationItems}
                <Pagination.Next 
                  onClick={() => setCurrentPage(currentPage => Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </div>
      )}
      
      {/* New Post Modal */}
      <Modal show={showNewPostModal} onHide={() => setShowNewPostModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Create New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Post Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Share your thoughts, advice, or experiences..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
            </Form.Group>
            
            {testResults && (
              <div className="mt-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h6>Test Results:</h6>
                <p><strong>Status:</strong> {testResults.success ? 'Success' : 'Failed'}</p>
                <p><strong>Message:</strong> {testResults.message}</p>
                {testResults.attempts && testResults.attempts.length > 0 && (
                  <div>
                    <p><strong>Attempts:</strong></p>
                    <ul>
                      {testResults.attempts.map((attempt, idx) => (
                        <li key={idx}>
                          {attempt.format}: {attempt.success ? 'Success' : 'Failed'} 
                          {attempt.error && <div><small>Error: {JSON.stringify(attempt.error)}</small></div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="info" 
            onClick={handleTestPostCreation}
            disabled={testingPost || !newPostContent.trim()}
            className="me-auto"
          >
            {testingPost ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Testing Post...
              </>
            ) : "Test Post Creation"}
          </Button>
          
          <Button variant="secondary" onClick={() => setShowNewPostModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreatePost}
            disabled={submittingPost || !newPostContent.trim()}
          >
            {submittingPost ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Posting...
              </>
            ) : "Post"}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* View Post Modal */}
      <Modal 
        show={showPostModal} 
        onHide={() => setShowPostModal(false)} 
        size="lg"
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton>
          <Modal.Title>{currentPost?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentPost ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <p className="text-muted mb-0">
                    <small>
                      Posted by{' '}
                      <strong>
                        {currentPost.authorType === 'student' ? currentPost.authorName : 
                         currentPost.authorType === 'employer' ? (currentPost.companyName || currentPost.authorName) : 
                         currentPost.authorType === 'moderator' ? (currentPost.authorName || 'Moderator') :
                         `User ${currentPost.authorId || currentPost.VUCID || 'Unknown'}`}
                      </strong>
                      {' '}on {formatDate(currentPost.datePosted)}
                    </small>
                    <Badge 
                      bg={
                        currentPost.authorType === 'student' ? 'info' : 
                        currentPost.authorType === 'employer' ? 'primary' : 
                        currentPost.authorType === 'moderator' ? 'danger' :
                        'secondary'
                      }
                      className="ms-2"
                    >
                      {currentPost.authorType === 'student' ? 'Student' : 
                       currentPost.authorType === 'employer' ? 'Employer' : 
                       currentPost.authorType === 'moderator' ? 'Moderator' :
                       'User'}
                    </Badge>
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <Badge bg="success" className="me-3" style={{ fontSize: '0.9rem', padding: '8px' }}>
                    <i className="bi bi-chat-square-text me-1"></i>
                    Posts Created: {currentPost.authorPostCount || currentPost.communityScore || 0}
                  </Badge>
                </div>
              </div>
              
              <Card className="mb-4">
                <Card.Body>
                  {currentPost.content.split('\n').map((paragraph, index) => (
                    paragraph ? <p key={index} className="mb-2">{paragraph}</p> : <br key={index} />
                  ))}
                </Card.Body>
              </Card>
              
              {/* Delete button for moderators or post author */}
              {(isModerator || 
                (currentPost.authorId && currentPost.authorId.toString() === (ucid || employerId || moderatorId)?.toString()) ||
                (ucid && currentPost.authorUcid === ucid) || 
                (employerId && currentPost.authorEmployerId === parseInt(employerId)) ||
                (moderatorId && currentPost.authorModeratorId === parseInt(moderatorId))) && (
                <div className="text-end">
                  <Button 
                    variant={isModerator && !(
                      (currentPost.authorId && currentPost.authorId.toString() === (ucid || employerId || moderatorId)?.toString()) ||
                      (ucid && currentPost.authorUcid === ucid) || 
                      (employerId && currentPost.authorEmployerId === parseInt(employerId)) ||
                      (moderatorId && currentPost.authorModeratorId === parseInt(moderatorId))
                    ) ? "danger" : "outline-danger"}
                    size="sm"
                    onClick={() => {
                      handleDeletePost(currentPost.forumPostId);
                    }}
                    title={isModerator && !(
                      (currentPost.authorId && currentPost.authorId.toString() === (ucid || employerId || moderatorId)?.toString()) ||
                      (ucid && currentPost.authorUcid === ucid) || 
                      (employerId && currentPost.authorEmployerId === parseInt(employerId)) ||
                      (moderatorId && currentPost.authorModeratorId === parseInt(moderatorId))
                    ) ? "Delete as moderator" : "Delete your post"}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete Post
                    {isModerator && !(
                      (currentPost.authorId && currentPost.authorId.toString() === (ucid || employerId || moderatorId)?.toString()) ||
                      (ucid && currentPost.authorUcid === ucid) || 
                      (employerId && currentPost.authorEmployerId === parseInt(employerId)) ||
                      (moderatorId && currentPost.authorModeratorId === parseInt(moderatorId))
                    ) && <span className="ms-1">(Moderator Action)</span>}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" /> 
              <span className="ms-2">Loading post...</span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPostModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Forum; 