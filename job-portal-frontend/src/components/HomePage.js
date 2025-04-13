import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // We'll style this separately

const HomePage = () => {
  return (
    <div className="home-container">
      <section className="hero">
        <h1>Find Your Dream Career</h1>
        <p>
          UCalgary Job Board connects University of Calgary students with employers for internships, part-time, and full-time opportunities.
        </p>
        <div className="hero-buttons">
          <Link to="/jobs" className="primary-btn">Browse Jobs</Link>
          <Link to="/register" className="secondary-btn">Create Account</Link>
        </div>
      </section>

      <section className="features">
        <h2>How It Works</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <span>👤</span>
            <h3>Create Your Profile</h3>
            <p>Build your profile to showcase your skills or company info.</p>
          </div>
          <div className="feature-card">
            <span>🔍</span>
            <h3>Search Opportunities</h3>
            <p>Students can browse and search job postings that match them.</p>
          </div>
          <div className="feature-card">
            <span>📝</span>
            <h3>Apply with Ease</h3>
            <p>Submit applications directly and track your status easily.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>For Employers</h2>
        <p>
          Post job opportunities and connect with talented UCalgary students and graduates.
        </p>
        <Link to="/register" className="cta-btn">Get Started</Link>
      </section>

      <section className="stats">
        <h2>UCalgary Job Board Impact</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>500+</h3>
            <p>Active Job Postings</p>
          </div>
          <div className="stat-card">
            <h3>1,000+</h3>
            <p>Registered Students</p>
          </div>
          <div className="stat-card">
            <h3>200+</h3>
            <p>Employer Partners</p>
          </div>
          <div className="stat-card">
            <h3>80%</h3>
            <p>Success Rate</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
