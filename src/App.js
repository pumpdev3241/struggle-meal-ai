import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AuthModal from './components/auth/AuthModal';
import PreferencesForm from './components/preferences/PreferencesForm';
import RecipeList from './components/recipe/RecipeList';
import ShoppingList from './components/shopping/ShoppingList';
import SEO from './components/SEO';
import { getCurrentUser, incrementUsageCount, getUserSubscriptionStatus } from './services/supabaseClient';
import { generateRecipes } from './services/aiService';
import './styles/App.css';

function App() {
  // User state
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  // UI state
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('preferences');
  
  // Data state
  const [userPreferences, setUserPreferences] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if user is logged in on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await getCurrentUser();
        
        if (error) {
          console.error('Error checking user:', error);
          // Skip further checks if there's an error (likely due to missing Supabase credentials)
          return;
        } 
        
        if (data && data.user) {
          setUser(data.user);
          setIsLoggedIn(true);
          
          // Check if user is premium
          const { data: subData, error: subError } = await getUserSubscriptionStatus(data.user.id);
          
          if (subError) {
            console.error('Error checking subscription status:', subError);
          } else if (subData) {
            setIsPremium(subData.subscription_status === 'premium');
          }
        }
      } catch (err) {
        console.error('Error checking user:', err);
      }
    };
    
    checkUser();
    
    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);
  
  // Update body class when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Save dark mode preference
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  // Handle login success
  const handleLoginSuccess = (userData) => {
    setUser(userData.user);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
  };
  
  // Handle logout success
  const handleLogoutSuccess = () => {
    setUser(null);
    setIsLoggedIn(false);
    setUserPreferences(null);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Handle preferences submission
  const handlePreferencesSubmit = async (preferences) => {
    setUserPreferences(preferences);
    setLoading(true);
    setError(null);
    
    try {
      // Generate recipes based on preferences
      const generatedRecipes = await generateRecipes(preferences);
      setRecipes(generatedRecipes);
      
      // Increment usage count if user is logged in
      if (isLoggedIn && user) {
        await incrementUsageCount(user.id);
      }
      
      // Switch to recipes tab
      setActiveTab('recipes');
    } catch (err) {
      setError('Error generating recipes. Please try again.');
      console.error('Error generating recipes:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle recipe selection
  const handleRecipeSelect = (recipe, isSelected) => {
    if (isSelected) {
      setSelectedRecipes(prev => [...prev, recipe]);
    } else {
      setSelectedRecipes(prev => prev.filter(r => r.id !== recipe.id));
    }
  };
  
  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };
  
  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'preferences':
        return (
          <motion.div
            key="preferences"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="tab-content"
          >
            <PreferencesForm
              userId={user?.id}
              onSubmit={handlePreferencesSubmit}
            />
          </motion.div>
        );
      case 'recipes':
        return (
          <motion.div
            key="recipes"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="tab-content"
          >
            <RecipeList
              recipes={recipes}
              userId={user?.id}
              dietaryRestrictions={userPreferences?.dietaryRestrictions}
              onRecipeSelect={handleRecipeSelect}
              selectedRecipes={selectedRecipes.map(r => r.id)}
            />
          </motion.div>
        );
      case 'shopping-list':
        return (
          <motion.div
            key="shopping-list"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="tab-content"
          >
            <ShoppingList
              selectedRecipes={selectedRecipes}
              userId={user?.id}
              isPremium={isPremium}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <SEO />
      
      <Navbar
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutSuccess={handleLogoutSuccess}
        darkMode={darkMode}
        onDarkModeToggle={toggleDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasRecipes={recipes.length > 0}
        hasSelectedRecipes={selectedRecipes.length > 0}
      />
      
      <main className="main-content">
        
        {/* Loading and error states */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner-container">
              <span className="loading-spinner"></span>
              <p>Generating your recipes...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Tab content */}
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </main>
      
      <Footer darkMode={darkMode} />
      
      {/* Auth modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
