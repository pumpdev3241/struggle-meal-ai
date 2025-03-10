import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { signOut, getCurrentUser } from '../../services/supabaseClient';

/**
 * Navigation bar component
 * @param {Object} props - Component props
 * @param {boolean} props.isLoggedIn - Whether the user is logged in
 * @param {Function} props.onLoginClick - Function to call when login button is clicked
 * @param {Function} props.onLogoutSuccess - Function to call when logout is successful
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @param {Function} props.onDarkModeToggle - Function to call when dark mode is toggled
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.setActiveTab - Function to set active tab
 * @param {boolean} props.hasRecipes - Whether recipes are available
 * @param {boolean} props.hasSelectedRecipes - Whether recipes are selected
 * @returns {JSX.Element} - Navbar component
 */
const Navbar = ({ 
  isLoggedIn, 
  onLoginClick, 
  onLogoutSuccess,
  darkMode,
  onDarkModeToggle,
  activeTab,
  setActiveTab,
  hasRecipes,
  hasSelectedRecipes
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // Fetch user email on component mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      if (!isLoggedIn) return;
      
      try {
        const { data, error } = await getCurrentUser();
        
        if (error) {
          console.error('Error fetching user:', error);
        } else if (data && data.user) {
          setUserEmail(data.user.email);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    
    fetchUserEmail();
  }, [isLoggedIn]);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      } else {
        setMobileMenuOpen(false);
        if (onLogoutSuccess) {
          onLogoutSuccess();
        }
      }
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };
  
  // Handle login click
  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    if (onLoginClick) {
      onLoginClick();
    }
  };
  
  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    if (onDarkModeToggle) {
      onDarkModeToggle();
    }
  };
  
  // Mobile menu animation variants
  const menuVariants = {
    closed: { 
      opacity: 0,
      x: '100%',
      transition: { duration: 0.3 }
    },
    open: { 
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <nav className={`navbar ${darkMode ? 'dark' : 'light'}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="/">
            <h1>StruggleMeal AI</h1>
          </a>
        </div>
        
        <div className="navbar-menu">
          {/* Main navigation */}
          <div className="nav-links">
            <button 
              className={`nav-link ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              Home
            </button>
            <button 
              className={`nav-link ${activeTab === 'recipes' ? 'active' : ''}`}
              onClick={() => setActiveTab('recipes')}
              disabled={!hasRecipes}
            >
              Recipes
            </button>
            <button 
              className={`nav-link ${activeTab === 'shopping-list' ? 'active' : ''}`}
              onClick={() => setActiveTab('shopping-list')}
              disabled={!hasSelectedRecipes}
            >
              Shopping List
            </button>
          </div>
        </div>
        
        <div className="navbar-actions">
          {/* Dark mode toggle */}
          <button 
            className="dark-mode-toggle"
            onClick={handleDarkModeToggle}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          {/* User menu */}
          <div className="user-section">
            {isLoggedIn ? (
              <div className="user-menu">
                <span className="user-email">{userEmail}</span>
                <button 
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                className="login-button"
                onClick={handleLoginClick}
              >
                Login / Sign Up
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <motion.div 
        className="mobile-menu"
        variants={menuVariants}
        initial="closed"
        animate={mobileMenuOpen ? 'open' : 'closed'}
      >
        <div className="mobile-menu-header">
          <h2>Menu</h2>
          <button 
            className="close-menu-button"
            onClick={toggleMobileMenu}
          >
            ×
          </button>
        </div>
        
        <div className="mobile-menu-content">
          <a href="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="/recipes" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Recipes</a>
          <a href="/shopping-list" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Shopping List</a>
          
          {isLoggedIn && (
            <a href="/favorites" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Favorites</a>
          )}
          
          <div className="mobile-menu-footer">
            {isLoggedIn ? (
              <>
                <span className="user-email">{userEmail}</span>
                <button 
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                className="login-button"
                onClick={handleLoginClick}
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
