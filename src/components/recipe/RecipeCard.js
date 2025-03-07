import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
      y: -5,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  return (
    <motion.div
      className={`recipe-card ${expanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={toggleExpanded}
    >
      <div className="recipe-card-header">
        <h3>{recipe.name}</h3>
        <div className="recipe-card-actions">
          <button
            className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
            onClick={handleFavoriteToggle}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
          <button
            className={`select-button ${isSelected ? 'selected' : ''}`}
            onClick={handleSelect}
            aria-label={isSelected ? 'Remove from meal plan' : 'Add to meal plan'}
          >
            {isSelected ? '✓' : '+'}
          </button>
        </div>
      </div>
      
      <div className="recipe-card-info">
        <div className="recipe-card-meta">
          <span className="prep-time">
            <i className="icon-clock"></i> {recipe.prepTime}
          </span>
          <span className="cost">
            <i className="icon-dollar"></i> ${recipe.costPerServing.toFixed(2)}/serving
          </span>
          <span className="servings">
            <i className="icon-user"></i> {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
          </span>
        </div>
      </div>
      
      {expanded && (
        <div className="recipe-card-details">
          <div className="recipe-ingredients">
            <h4>Ingredients</h4>
            <ul>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                  <span className="ingredient-amount">{ingredient.amount}</span>
                  <span className="ingredient-name">{ingredient.name}</span>
                  <span className="ingredient-cost">${ingredient.cost.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="recipe-total-cost">
              <span>Total Cost: ${recipe.totalCost.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="recipe-instructions">
            <h4>Instructions</h4>
            <ol>
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
          
          {youtubeVideo && (
            <div className="recipe-video">
              <h4>Video Tutorial</h4>
              <YouTube videoId={youtubeVideo.id} opts={youtubeOpts} />
              <p className="video-title">{youtubeVideo.title}</p>
            </div>
          )}
          
          {loading && (
            <div className="loading-spinner-container">
              <span className="loading-spinner"></span>
              <p>Loading video tutorial...</p>
            </div>
          )}
        </div>
      )}
      
      <div className="recipe-card-footer">
        <button 
          className="expand-button"
          onClick={toggleExpanded}
          aria-label={expanded ? 'Show less' : 'Show more'}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
    </motion.div>
  );
};

export default RecipeCard;
