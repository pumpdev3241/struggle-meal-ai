import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube from 'react-youtube';
import { fetchYouTubeVideos } from '../../services/aiService';
import { toggleFavoriteRecipe } from '../../services/supabaseClient';

/**
 * Recipe card component
 * @param {Object} props - Component props
 * @param {Object} props.recipe - Recipe data
 * @param {boolean} props.isFavorite - Whether the recipe is a favorite
 * @param {string} props.userId - User ID
 * @param {Function} props.onFavoriteToggle - Function to call when favorite is toggled
 * @param {Function} props.onSelect - Function to call when recipe is selected
 * @param {boolean} props.isSelected - Whether the recipe is selected
 * @returns {JSX.Element} - RecipeCard component
 */
const RecipeCard = ({ 
  recipe, 
  isFavorite = false, 
  userId, 
  onFavoriteToggle,
  onSelect,
  isSelected = false
}) => {
  const [expanded, setExpanded] = useState(false);
  const [youtubeVideo, setYoutubeVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch YouTube video on component mount
  useEffect(() => {
    const getYouTubeVideo = async () => {
      if (!recipe.youtubeKeywords) return;
      
      try {
        setLoading(true);
        const video = await fetchYouTubeVideos(recipe.youtubeKeywords);
        if (video) {
          setYoutubeVideo(video);
        }
      } catch (error) {
        console.error('Error fetching YouTube video:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getYouTubeVideo();
  }, [recipe.youtubeKeywords]);
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    
    if (!userId) return;
    
    try {
      const { error } = await toggleFavoriteRecipe(userId, recipe.id, isFavorite);
      
      if (error) {
        console.error('Error toggling favorite:', error);
      } else if (onFavoriteToggle) {
        onFavoriteToggle(recipe.id, !isFavorite);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };
  
  // Handle recipe selection
  const handleSelect = (e) => {
    e.stopPropagation();
    
    if (onSelect) {
      onSelect(recipe, !isSelected);
    }
  };
  
  // YouTube options
  const youtubeOpts = {
    height: '200',
    width: '100%',
    playerVars: {
      autoplay: 0,
    },
  };
  
  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
    hover: {
      scale: 1.02,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  // Details animation variants
  const detailsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        height: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2, delay: 0.1 }
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { 
        height: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    }
  };
  
  return (
    <motion.div
      className={`recipe-card ${expanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={!expanded ? "hover" : undefined}
      layoutId={`recipe-card-${recipe.id}`}
    >
      <div className="recipe-card-image">
        <div className="recipe-image-placeholder">
          <span>{recipe.name.charAt(0)}</span>
        </div>
        {isSelected && (
          <motion.div 
            className="recipe-selected-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <span>✓</span>
          </motion.div>
        )}
      </div>
      <motion.div 
        className="recipe-card-header"
        onClick={toggleExpanded}
      >
        <motion.h3 layoutId={`recipe-title-${recipe.id}`}>{recipe.name}</motion.h3>
        <div className="recipe-card-actions">
          <motion.button
            className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
            onClick={handleFavoriteToggle}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {isFavorite ? '★' : '☆'}
          </motion.button>
          <motion.button
            className={`select-button ${isSelected ? 'selected' : ''}`}
            onClick={handleSelect}
            aria-label={isSelected ? 'Remove from meal plan' : 'Add to meal plan'}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {isSelected ? '✓' : '+'}
          </motion.button>
        </div>
      </motion.div>
      
      <motion.div 
        className="recipe-card-info"
        onClick={toggleExpanded}
      >
        <motion.div className="recipe-card-meta" layoutId={`recipe-meta-${recipe.id}`}>
          <span className="prep-time">
            <i className="icon-clock"></i> {recipe.prepTime}
          </span>
          <span className="cost">
            <i className="icon-dollar"></i> ${recipe.costPerServing.toFixed(2)}/serving
          </span>
          <span className="servings">
            <i className="icon-user"></i> {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
          </span>
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            className="recipe-card-details"
            variants={detailsVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <div className="recipe-ingredients">
              <motion.h4 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Ingredients
              </motion.h4>
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {recipe.ingredients.map((ingredient, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <span className="ingredient-amount">{ingredient.amount}</span>
                    <span className="ingredient-name">{ingredient.name}</span>
                    <span className="ingredient-cost">${ingredient.cost.toFixed(2)}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div 
                className="recipe-total-cost"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span>Total Cost: ${recipe.totalCost.toFixed(2)}</span>
              </motion.div>
            </div>
            
            <div className="recipe-instructions">
              <motion.h4
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Instructions
              </motion.h4>
              <motion.ol
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {recipe.instructions.map((step, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    {step}
                  </motion.li>
                ))}
              </motion.ol>
            </div>
            
            {youtubeVideo && (
              <motion.div 
                className="recipe-video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h4>Video Tutorial</h4>
                <div className="video-container">
                  <YouTube videoId={youtubeVideo.id} opts={youtubeOpts} />
                </div>
                <p className="video-title">{youtubeVideo.title}</p>
              </motion.div>
            )}
            
            {loading && (
              <div className="loading-spinner-container">
                <span className="loading-spinner"></span>
                <p>Loading video tutorial...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="recipe-card-footer"
        layout
      >
        <motion.button 
          className="expand-button"
          onClick={toggleExpanded}
          aria-label={expanded ? 'Show less' : 'Show more'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default RecipeCard;
