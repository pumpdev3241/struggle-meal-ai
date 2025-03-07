import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { saveUserPreferences, getUserPreferences } from '../../services/supabaseClient';

/**
 * User preferences form component
 * @param {Object} props - Component props
 * @param {string} props.userId - User ID
 * @param {Function} props.onSubmit - Function to call on form submission
 * @returns {JSX.Element} - PreferencesForm component
 */
const PreferencesForm = ({ userId, onSubmit }) => {
  const [preferences, setPreferences] = useState({
    foodPreferences: '',
    dietaryRestrictions: '',
    skillLevel: 'beginner',
    budget: 20,
    pantryItems: []
  });
  const [pantryInput, setPantryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Fetch user preferences on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) {
        setInitialLoad(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await getUserPreferences(userId);
        
        if (error) {
          console.error('Error fetching preferences:', error);
        } else if (data && data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };
    
    fetchPreferences();
  }, [userId]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: name === 'budget' ? Number(value) : value
    }));
  };
  
  // Handle pantry item input
  const handlePantryInputChange = (e) => {
    setPantryInput(e.target.value);
  };
  
  // Add pantry item
  const addPantryItem = () => {
    if (!pantryInput.trim()) return;
    
    setPreferences(prev => ({
      ...prev,
      pantryItems: [...prev.pantryItems, pantryInput.trim()]
    }));
    
    setPantryInput('');
  };
  
  // Remove pantry item
  const removePantryItem = (index) => {
    setPreferences(prev => ({
      ...prev,
      pantryItems: prev.pantryItems.filter((_, i) => i !== index)
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Validate form
    if (!preferences.foodPreferences) {
      setError('Please enter your food preferences');
      return;
    }
    
    setLoading(true);
    
    try {
      if (userId) {
        // Save preferences to Supabase
        const { error } = await saveUserPreferences(userId, preferences);
        
        if (error) {
          setError('Error saving preferences. Please try again.');
          console.error('Error saving preferences:', error);
        } else {
          setSuccess(true);
          
          // Call onSubmit with preferences
          if (onSubmit) {
            onSubmit(preferences);
          }
        }
      } else {
        // No user ID, just call onSubmit
        if (onSubmit) {
          onSubmit(preferences);
        }
        setSuccess(true);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error saving preferences:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Form animation variants
  const formVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  // Form item animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  if (initialLoad) {
    return <div className="loading-spinner-container"><span className="loading-spinner"></span></div>;
  }
  
  return (
    <motion.form 
      className="preferences-form"
      onSubmit={handleSubmit}
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <h2>Your Meal Preferences</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Preferences saved successfully!</div>}
      
      <motion.div className="form-group" variants={itemVariants}>
        <label htmlFor="foodPreferences">Food Preferences</label>
        <input
          type="text"
          id="foodPreferences"
          name="foodPreferences"
          value={preferences.foodPreferences}
          onChange={handleChange}
          placeholder="e.g., spicy chicken, pasta, vegetarian"
          disabled={loading}
          required
        />
        <small>What kinds of food do you enjoy?</small>
      </motion.div>
      
      <motion.div className="form-group" variants={itemVariants}>
        <label htmlFor="dietaryRestrictions">Dietary Restrictions</label>
        <input
          type="text"
          id="dietaryRestrictions"
          name="dietaryRestrictions"
          value={preferences.dietaryRestrictions}
          onChange={handleChange}
          placeholder="e.g., no dairy, gluten-free, vegan"
          disabled={loading}
        />
        <small>Any foods you can't or don't eat?</small>
      </motion.div>
      
      <motion.div className="form-group" variants={itemVariants}>
        <label htmlFor="skillLevel">Cooking Skill Level</label>
        <select
          id="skillLevel"
          name="skillLevel"
          value={preferences.skillLevel}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <small>How comfortable are you in the kitchen?</small>
      </motion.div>
      
      <motion.div className="form-group" variants={itemVariants}>
        <label htmlFor="budget">Weekly Budget (USD)</label>
        <div className="budget-slider-container">
          <input
            type="range"
            id="budget"
            name="budget"
            min="10"
            max="100"
            step="5"
            value={preferences.budget}
            onChange={handleChange}
            disabled={loading}
          />
          <span className="budget-value">${preferences.budget}</span>
        </div>
        <small>How much can you spend on food per week?</small>
      </motion.div>
      
      <motion.div className="form-group pantry-items-group" variants={itemVariants}>
        <label>Pantry Items (Optional)</label>
        <div className="pantry-input-container">
          <input
            type="text"
            value={pantryInput}
            onChange={handlePantryInputChange}
            placeholder="e.g., rice, soy sauce, olive oil"
            disabled={loading}
          />
          <button
            type="button"
            onClick={addPantryItem}
            disabled={!pantryInput.trim() || loading}
            className="add-pantry-button"
          >
            Add
          </button>
        </div>
        <small>What ingredients do you already have?</small>
        
        {preferences.pantryItems.length > 0 && (
          <ul className="pantry-items-list">
            {preferences.pantryItems.map((item, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="pantry-item"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removePantryItem(index)}
                  disabled={loading}
                  className="remove-pantry-button"
                >
                  ×
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
      
      <motion.div className="form-actions" variants={itemVariants}>
        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            'Save & Generate Recipes'
          )}
        </button>
      </motion.div>
    </motion.form>
  );
};

export default PreferencesForm;
