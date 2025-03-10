import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
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
    budget: 25,
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
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  // Pantry item animation variants
  const pantryItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', stiffness: 500, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      transition: { duration: 0.2 } 
    }
  };
  
  if (initialLoad) {
    return <div className="loading-spinner-container"><span className="loading-spinner"></span></div>;
  }
  
  return (
    <motion.div
      className="preferences-form-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.form 
        className="preferences-form"
        onSubmit={handleSubmit}
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="form-title"
        >
          Your Meal Preferences
        </motion.h2>
        
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            className="success-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            Preferences saved successfully!
          </motion.div>
        )}
        
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
        
        <motion.div className="form-group budget-group" variants={itemVariants}>
          <label htmlFor="budget">Weekly Budget (USD)</label>
          <div className="budget-slider-container">
            <input
              type="range"
              id="budget"
              name="budget"
              min="0"
              max="50"
              step="1"
              value={preferences.budget}
              onChange={handleChange}
              disabled={loading}
              className="budget-slider"
            />
            <motion.div 
              className="budget-value-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.span 
                className="budget-value"
                key={preferences.budget}
                initial={{ scale: 1.2, y: -10, color: 'var(--primary-light)' }}
                animate={{ scale: 1, y: 0, color: 'var(--text-color)' }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                ${preferences.budget}
              </motion.span>
            </motion.div>
          </div>
          <div className="budget-labels">
            <span>$0</span>
            <span>$25</span>
            <span>$50</span>
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
          
          <AnimatePresence>
            {preferences.pantryItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ul className="pantry-items-list">
                  <AnimatePresence>
                    {preferences.pantryItems.map((item, index) => (
                      <motion.li 
                        key={item + index}
                        variants={pantryItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="pantry-item"
                        layout
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => removePantryItem(index)}
                          disabled={loading}
                          className="remove-pantry-button"
                          aria-label={`Remove ${item}`}
                        >
                          ×
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div 
          className="form-actions" 
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <motion.button
            type="submit"
            className="submit-button"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            initial={{ boxShadow: "0 4px 15px rgba(76, 44, 122, 0.4)" }}
            whileHover={{ 
              boxShadow: "0 8px 25px rgba(76, 44, 122, 0.6)",
              y: -2
            }}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Save & Generate Recipes'
            )}
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default PreferencesForm;
