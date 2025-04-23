import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, ListGroup, Alert, Spinner, Modal, InputGroup, Pagination } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPostModal, setShowPostModal] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  
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
  
  // Determine if user is a moderator
  const isModerator = userRole === 'moderator';
  
  // INTEGRATION POINT #2:
  // API data fetching
  // This will work automatically when switching to real API
  // if your Django endpoints match the expected response format
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.getForumPosts();
        
        // INTEGRATION POINT #3:
        // Data format compatibility check:
        // Ensure your Django API returns data in the expected format
        // Expected response.data format:
        // [
        //   {
        //     forumPostId: number,
        //     title: string,
        //     content: string,
        //     authorUcid: string|null,
        //     authorEmployerId: number|null,
        //     authorModeratorId: number|null,
        //     authorName: string,
        //     authorType: 'student'|'employer'|'moderator',
        //     datePosted: string (ISO date),
        //     upvotes: number
        //   },
        //   ...
        // ]
        setPosts(response.data);
        setFilteredPosts(response.data);
        
        // If a post ID is provided in URL, find and open that post
        if (postIdParam) {
          const targetPost = response.data.find(post => post.forumPostId === parseInt(postIdParam));
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
  
  // Set active tab based on URL parameter
  useEffect(() => {
    if (tabParam === 'my-posts') {
      setActiveTab('my-posts');
    } else {
      setActiveTab('all');
    }
  }, [tabParam]);
  
  // Filter and sort posts when search term or sort criteria changes
  useEffect(() => {
    // First filter posts based on search term and active tab
    let results = posts;
    
    // Filter by my posts if that tab is active
    if (activeTab === 'my-posts') {
      results = posts.filter(post => 
        (ucid && post.authorUcid === ucid) || 
        (employerId && post.authorEmployerId === parseInt(employerId)) ||
        (moderatorId && post.authorModeratorId === parseInt(moderatorId))
      );
    }
    
    // Then filter by search term
    if (searchTerm.trim() !== '') {
      const lowercaseSearch = searchTerm.toLowerCase();
      results = results.filter(post => 
        post.title.toLowerCase().includes(lowercaseSearch) || 
        post.content.toLowerCase().includes(lowercaseSearch) ||
        (post.authorName && post.authorName.toLowerCase().includes(lowercaseSearch)) ||
        (post.companyName && post.companyName.toLowerCase().includes(lowercaseSearch))
      );
    }
    
    // Then sort the filtered results
    results = [...results].sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.datePosted) - new Date(a.datePosted);
      } else if (sortBy === 'popular') {
        return b.upvotes - a.upvotes;
      }
      return 0;
    });
    
    setFilteredPosts(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, sortBy, posts, activeTab, ucid, employerId, moderatorId]);
  
  // INTEGRATION POINT #4:
  // Creating new forum posts
  // Adjust the data format if your Django API requires different field names
  const handleCreatePost = async () => {
    // Validate form
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert("Please fill in both the title and content fields.");
      return;
    }
    
    try {
      setSubmittingPost(true);
      
      // INTEGRATION POINT #5:
      // Create post payload
      // You might need to adjust this structure for your Django API
      const postData = {
        title: newPostTitle,
        content: newPostContent,
        // Include appropriate ID based on user role
        authorUcid: ucid || null,
        authorEmployerId: employerId || null,
        authorModeratorId: moderatorId || null
        
        // For Django integration, you might need to adjust field names:
        // ucid: ucid || null,
        // employer_id: employerId || null,
        // moderator_id: moderatorId || null
      };
      
      const response = await api.createForumPost(postData);
      
      // Add the new post to state
      setPosts([response.data, ...posts]);
      
      // Reset form and close modal
      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPostModal(false);
      setSubmittingPost(false);
    } catch (err) {
      console.error("Error creating forum post:", err);
      alert("Failed to create post. Please try again.");
      setSubmittingPost(false);
    }
  };
  
  // INTEGRATION POINT #6:
  // Upvoting posts
  // Ensure your Django API has an endpoint for upvoting
  const handleUpvote = async (postId) => {
    if (!canPost) {
      alert("You need to be logged in to upvote posts.");
      return;
    }
    
    try {
      await api.upvoteForumPost(postId);
      
      // Update the upvote count in local state
      setPosts(posts.map(post => {
        if (post.forumPostId === postId) {
          return { ...post, upvotes: post.upvotes + 1, hasUpvoted: true };
        }
        return post;
      }));
      
      // Show a success message
      alert("Thanks for your upvote! This contributes to the author's community score.");
    } catch (err) {
      console.error("Error upvoting post:", err);
      alert("Failed to upvote post. You might have already upvoted this post.");
    }
  };
  
  // INTEGRATION POINT #7:
  // Moderator functionality
  // Ensure your Django API has proper authorization for deletion
  const handleDeletePost = async (postId) => {
    // Get the post to check if user is the author
    const post = posts.find(p => p.forumPostId === postId);
    if (!post) return;
    
    // Check if user is allowed to delete this post
    const isPostAuthor = 
      (ucid && post.authorUcid === ucid) || 
      (employerId && post.authorEmployerId === parseInt(employerId)) ||
      (moderatorId && post.authorModeratorId === parseInt(moderatorId));
    
    if (!isPostAuthor && !isModerator) return;
    
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
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
  // These functions don't need to change when integrating with Django
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
                  </Button>
                )}
              </div>
            </Col>
          </Row>
          
          <Row className="align-items-center">
            <Col md={6} className="mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                <Form.Control
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex justify-content-md-end">
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
                  Most Popular
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
          <i className="bi bi-shield me-2"></i>
          <strong>Moderator Mode</strong> - You have the ability to delete inappropriate posts
        </Alert>
      )}
      
      {/* Forum posts */}
      {filteredPosts.length === 0 ? (
        <Alert variant="info">
          {searchTerm ? 
            `No posts match your search for "${searchTerm}". Try different keywords or clear your search.` : 
            'No posts yet. Be the first to create a post in the community forum!'}
        </Alert>
      ) : (
        <div>
          {currentPosts.map(post => (
            <Card key={post.forumPostId} className="mb-3 shadow-sm">
              <Card.Body>
                <div className="d-flex">
                  {/* Upvote section */}
                  <div className="me-3 text-center" style={{ minWidth: '60px' }}>
                    <Button 
                      variant={post.hasUpvoted ? "primary" : "outline-primary"}
                      size="sm"
                      className="rounded-circle p-0 shadow-sm"
                      style={{ width: '38px', height: '38px' }}
                      onClick={() => handleUpvote(post.forumPostId)}
                      disabled={!canPost || post.hasUpvoted}
                      title={post.hasUpvoted ? "You've already upvoted this post" : "Upvote this post to contribute to author's community score"}
                    >
                      <i className="bi bi-hand-thumbs-up"></i>
                    </Button>
                    <div className="mt-1">
                      <strong>{post.upvotes}</strong>
                    </div>
                  </div>
                  
                  {/* Post content */}
                  <div className="flex-grow-1">
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
                        (ucid && post.authorUcid === ucid) || 
                        (employerId && post.authorEmployerId === parseInt(employerId)) ||
                        (moderatorId && post.authorModeratorId === parseInt(moderatorId))) && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeletePost(post.forumPostId)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      )}
                    </div>
                    <p className="text-muted mb-2">
                      <small>
                        Posted by{' '}
                        <strong>
                          {post.authorType === 'student' ? post.authorName : 
                           post.authorType === 'employer' ? post.companyName : 
                           'Moderator'}
                        </strong>
                        {' '}on {formatDate(post.datePosted)}
                      </small>
                      <Badge 
                        bg={
                          post.authorType === 'student' ? 'info' : 
                          post.authorType === 'employer' ? 'primary' : 
                          'danger'
                        }
                        className="ms-2"
                      >
                        {post.authorType === 'student' ? 'Student' : 
                         post.authorType === 'employer' ? 'Employer' : 
                         'Moderator'}
                      </Badge>
                      <Badge bg="success" className="ms-2" title="Community Score">
                        <i className="bi bi-star-fill me-1"></i>
                        {post.communityScore}
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
              <Form.Label>Post Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter a descriptive title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                maxLength={100}
              />
              <Form.Text className="text-muted">
                {newPostTitle.length}/100 characters
              </Form.Text>
            </Form.Group>
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewPostModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreatePost}
            disabled={submittingPost || !newPostTitle.trim() || !newPostContent.trim()}
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
                         currentPost.authorType === 'employer' ? currentPost.companyName : 
                         'Moderator'}
                      </strong>
                      {' '}on {formatDate(currentPost.datePosted)}
                    </small>
                    <Badge 
                      bg={
                        currentPost.authorType === 'student' ? 'info' : 
                        currentPost.authorType === 'employer' ? 'primary' : 
                        'danger'
                      }
                      className="ms-2"
                    >
                      {currentPost.authorType === 'student' ? 'Student' : 
                       currentPost.authorType === 'employer' ? 'Employer' : 
                       'Moderator'}
                    </Badge>
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <Badge bg="success" className="me-3" style={{ fontSize: '0.9rem', padding: '8px' }}>
                    <i className="bi bi-star-fill me-1"></i>
                    Community Score: {currentPost.communityScore || 0}
                  </Badge>
                  
                  <div className="d-flex align-items-center">
                    <Button 
                      variant={currentPost.hasUpvoted ? "primary" : "outline-primary"}
                      size="sm"
                      className="rounded-circle p-0 d-flex align-items-center justify-content-center me-2"
                      style={{ width: '38px', height: '38px' }}
                      onClick={() => handleUpvote(currentPost.forumPostId)}
                      disabled={!canPost || currentPost.hasUpvoted}
                      title={currentPost.hasUpvoted ? "You've already upvoted this post" : "Upvote this post to contribute to author's community score"}
                    >
                      <i className="bi bi-hand-thumbs-up"></i>
                    </Button>
                    <strong>{currentPost.upvotes}</strong>
                  </div>
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
                (ucid && currentPost.authorUcid === ucid) || 
                (employerId && currentPost.authorEmployerId === parseInt(employerId)) ||
                (moderatorId && currentPost.authorModeratorId === parseInt(moderatorId))) && (
                <div className="text-end">
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => {
                      handleDeletePost(currentPost.forumPostId);
                    }}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete Post
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