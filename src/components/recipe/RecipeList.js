import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeCard from './RecipeCard';
import { getRecipes, getFavoriteRecipes, getUserUsageCount, getUserSubscriptionStatus } from '../../services/supabaseClient';
import { filterRecipesByDietaryRestrictions } from '../../services/aiService';

/**
 * Recipe list component
 * @param {Object} props - Component props
 * @param {Array} props.recipes - Array of recipe objects
 * @param {string} props.userId - User ID
 * @param {string} props.dietaryRestrictions - Dietary restrictions
 * @param {Function} props.onRecipeSelect - Function to call when a recipe is selected
 * @param {Array} props.selectedRecipes - Array of selected recipe IDs
 * @returns {JSX.Element} - RecipeList component
 */
const RecipeList = ({ 
  recipes = [], 
  userId, 
  dietaryRestrictions,
  onRecipeSelect,
  selectedRecipes = []
}) => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [usageCount, setUsageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumBanner, setShowPremiumBanner] = useState(false);
  
  // Fetch favorite recipes on component mount
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await getFavoriteRecipes(userId);
        
        if (error) {
          console.error('Error fetching favorites:', error);
        } else if (data) {
          setFavoriteRecipes(data);
          setFavoriteIds(new Set(data.map(recipe => recipe.id)));
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };
    
    fetchFavorites();
  }, [userId]);
  
  // Fetch usage count and subscription status on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      try {
        // Fetch usage count
        const { data: usageData, error: usageError } = await getUserUsageCount(userId);
        
        if (usageError) {
          console.error('Error fetching usage count:', usageError);
        } else if (usageData) {
          setUsageCount(usageData.recipe_count || 0);
        }
        
        // Fetch subscription status
        const { data: subData, error: subError } = await getUserSubscriptionStatus(userId);
        
        if (subError) {
          console.error('Error fetching subscription status:', subError);
        } else if (subData) {
          setIsPremium(subData.subscription_status === 'premium');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    
    fetchUserData();
  }, [userId]);
  
  // Show premium banner if user has generated more than 3 recipes and is not premium
  useEffect(() => {
    if (usageCount > 3 && !isPremium) {
      setShowPremiumBanner(true);
    }
  }, [usageCount, isPremium]);
  
  // Filter and sort recipes
  const filteredAndSortedRecipes = useMemo(() => {
    // First, filter by dietary restrictions
    let result = recipes;
    
    if (dietaryRestrictions) {
      result = filterRecipesByDietaryRestrictions(result, dietaryRestrictions);
    }
    
    // Then, apply additional filters
    if (filter === 'favorites') {
      result = result.filter(recipe => favoriteIds.has(recipe.id));
    } else if (filter === 'selected') {
      result = result.filter(recipe => selectedRecipes.includes(recipe.id));
    } else if (filter === 'quick') {
      result = result.filter(recipe => {
        const prepTimeMinutes = parseInt(recipe.prepTime.replace(/\D/g, ''));
        return prepTimeMinutes <= 30;
      });
    }
    
    // Finally, sort the recipes
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.costPerServing - b.costPerServing);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.costPerServing - a.costPerServing);
    } else if (sortBy === 'time-asc') {
      result = [...result].sort((a, b) => {
        const aTime = parseInt(a.prepTime.replace(/\D/g, ''));
        const bTime = parseInt(b.prepTime.replace(/\D/g, ''));
        return aTime - bTime;
      });
    }
    
    return result;
  }, [recipes, filter, sortBy, favoriteIds, selectedRecipes, dietaryRestrictions]);
  
  // Handle favorite toggle
  const handleFavoriteToggle = (recipeId, isFavorite) => {
    if (isFavorite) {
      setFavoriteIds(prev => new Set([...prev, recipeId]));
    } else {
      setFavoriteIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(recipeId);
        return newSet;
      });
    }
  };
  
  // Handle recipe selection
  const handleRecipeSelect = (recipe, isSelected) => {
    if (onRecipeSelect) {
      onRecipeSelect(recipe, isSelected);
    }
  };
  
  // List animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    }
  };
  
  // Premium banner animation variants
  const bannerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  return (
    <div className="recipe-list-container">
      {/* Premium banner */}
      <AnimatePresence>
        {showPremiumBanner && (
          <motion.div 
            className="premium-banner"
            variants={bannerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="premium-banner-content">
              <h3>Upgrade to Premium</h3>
              <p>You've reached the free tier limit of 3 recipes. Upgrade to premium for unlimited recipes, ad-free experience, and more!</p>
              <button className="premium-button">Go Premium - Only $1.99/month</button>
            </div>
            <button 
              className="close-banner-button"
              onClick={() => setShowPremiumBanner(false)}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Filter and sort controls */}
      <div className="recipe-controls">
        <div className="filter-controls">
          <label htmlFor="filter">Filter:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Recipes</option>
            <option value="favorites">Favorites</option>
            <option value="selected">Selected for Meal Plan</option>
            <option value="quick">Quick (Under 30 min)</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <label htmlFor="sortBy">Sort By:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="time-asc">Prep Time: Fastest First</option>
          </select>
        </div>
      </div>
      
      {/* Recipe list */}
      {filteredAndSortedRecipes.length > 0 ? (
        <motion.div 
          className="recipe-grid"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredAndSortedRecipes.map(recipe => (
            <motion.div
              key={recipe.id}
              className="recipe-card-wrapper"
              variants={cardVariants}
              whileHover={{ 
                y: -10, 
                transition: { type: "spring", stiffness: 300, damping: 20 } 
              }}
            >
              <RecipeCard
                recipe={recipe}
                isFavorite={favoriteIds.has(recipe.id)}
                userId={userId}
                onFavoriteToggle={handleFavoriteToggle}
                onSelect={handleRecipeSelect}
                isSelected={selectedRecipes.includes(recipe.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="no-recipes">
          <p>No recipes found. Try adjusting your filters or preferences.</p>
        </div>
      )}
      
      {/* Ad placeholder for free users */}
      {!isPremium && (
        <div className="ad-placeholder">
          <p>Advertisement</p>
          <div className="ad-content">
            <span>Ad Space - Your Ad Here</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeList;
