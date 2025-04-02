import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #4a69bd;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
`;

const NavMenu = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 0;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    background: white;
    bottom: 0;
    left: 0;
    transition: width 0.3s;
  }

  &:hover:after {
    width: 100%;
  }
`;

const Button = styled.button`
  background-color: white;
  color: #4a69bd;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">NextStep</Logo>
        
        <NavMenu>
          <NavLink to="/jobs">Browse Jobs</NavLink>
          
          {currentUser ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              
              {currentUser.role === 'employer' && (
                <NavLink to="/post-job">Post a Job</NavLink>
              )}
              
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Button onClick={() => navigate('/register')}>Register</Button>
            </>
          )}
        </NavMenu>
      </Nav>
    </HeaderContainer>
  );
};

export default Header; 