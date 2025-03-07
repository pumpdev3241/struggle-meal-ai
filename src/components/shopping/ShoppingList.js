import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveShoppingList, getShoppingList, updateShoppingListItem } from '../../services/supabaseClient';

/**
 * Shopping list component
 * @param {Object} props - Component props
 * @param {Array} props.selectedRecipes - Array of selected recipe objects
 * @param {string} props.userId - User ID
 * @param {boolean} props.isPremium - Whether the user is a premium user
 * @returns {JSX.Element} - ShoppingList component
 */
const ShoppingList = ({ selectedRecipes = [], userId, isPremium = false }) => {
  const [shoppingItems, setShoppingItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Generate shopping list from selected recipes
  useEffect(() => {
    if (selectedRecipes.length === 0) return;
    
    // Combine ingredients from all recipes
    const ingredientMap = new Map();
    
    selectedRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const key = ingredient.name.toLowerCase();
        
        if (ingredientMap.has(key)) {
          // Ingredient already exists, update amount and cost
          const existingIngredient = ingredientMap.get(key);
          ingredientMap.set(key, {
            ...existingIngredient,
            // This is a simplification; in a real app, you'd need to handle different units
            amount: `${existingIngredient.amount} + ${ingredient.amount}`,
            cost: existingIngredient.cost + ingredient.cost
          });
        } else {
          // New ingredient
          ingredientMap.set(key, {
            name: ingredient.name,
            amount: ingredient.amount,
            cost: ingredient.cost,
            completed: false
          });
        }
      });
    });
    
    // Convert map to array
    const items = Array.from(ingredientMap.values());
    
    // Calculate total cost
    const total = items.reduce((sum, item) => sum + item.cost, 0);
    
    setShoppingItems(items);
    setTotalCost(total);
    
    // Save shopping list to Supabase if user is logged in
    if (userId) {
      saveShoppingListToSupabase(items, total);
    }
  }, [selectedRecipes, userId]);
  
  // Fetch existing shopping list from Supabase on component mount
  useEffect(() => {
    const fetchShoppingList = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const { data, error } = await getShoppingList(userId);
        
        if (error) {
          console.error('Error fetching shopping list:', error);
        } else if (data && data.items) {
          setShoppingItems(data.items);
          setTotalCost(data.total_cost);
        }
      } catch (err) {
        console.error('Error fetching shopping list:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShoppingList();
  }, [userId]);
  
  // Save shopping list to Supabase
  const saveShoppingListToSupabase = async (items, total) => {
    try {
      setLoading(true);
      const { error } = await saveShoppingList(userId, items, total);
      
      if (error) {
        setError('Error saving shopping list. Please try again.');
        console.error('Error saving shopping list:', error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error saving shopping list:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle item completion
  const toggleItemCompletion = async (index) => {
    const updatedItems = [...shoppingItems];
    updatedItems[index] = {
      ...updatedItems[index],
      completed: !updatedItems[index].completed
    };
    
    setShoppingItems(updatedItems);
    
    // Update item in Supabase if user is logged in
    if (userId) {
      try {
        const { error } = await updateShoppingListItem(
          userId,
          index,
          updatedItems[index].completed
        );
        
        if (error) {
          console.error('Error updating shopping list item:', error);
        }
      } catch (err) {
        console.error('Error updating shopping list item:', err);
      }
    }
  };
  
  // Export shopping list as PDF
  const exportAsPDF = () => {
    if (!isPremium) {
      setError('PDF export is a premium feature. Please upgrade to premium.');
      return;
    }
    
    // In a real app, you'd use react-pdf or a similar library to generate a PDF
    alert('PDF export functionality would be implemented here.');
  };
  
  // Copy shopping list to clipboard
  const copyToClipboard = () => {
    const text = shoppingItems
      .map(item => `${item.name} (${item.amount}) - $${item.cost.toFixed(2)}`)
      .join('\n');
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setSuccess('Shopping list copied to clipboard!');
        setTimeout(() => setSuccess(false), 3000);
      })
      .catch(err => {
        setError('Failed to copy to clipboard.');
        console.error('Error copying to clipboard:', err);
      });
  };
  
  // Share shopping list via email
  const shareViaEmail = () => {
    if (!isPremium) {
      setError('Sharing is a premium feature. Please upgrade to premium.');
      return;
    }
    
    const subject = 'My StruggleMeal Shopping List';
    const body = shoppingItems
      .map(item => `${item.name} (${item.amount}) - $${item.cost.toFixed(2)}`)
      .join('%0D%0A');
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  
  // List animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };
  
  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  if (loading && shoppingItems.length === 0) {
    return <div className="loading-spinner-container"><span className="loading-spinner"></span></div>;
  }
  
  return (
    <div className="shopping-list-container">
      <h2>Shopping List</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{typeof success === 'string' ? success : 'Shopping list saved!'}</div>}
      
      {shoppingItems.length > 0 ? (
        <>
          <div className="shopping-list-header">
            <div className="shopping-list-total">
              <span>Total Cost: ${totalCost.toFixed(2)}</span>
            </div>
            
            <div className="shopping-list-actions">
              <button 
                className="action-button export-button"
                onClick={exportAsPDF}
                disabled={loading}
              >
                <i className="icon-pdf"></i> Export PDF
              </button>
              
              <button 
                className="action-button copy-button"
                onClick={copyToClipboard}
                disabled={loading}
              >
                <i className="icon-copy"></i> Copy
              </button>
              
              <button 
                className="action-button share-button"
                onClick={shareViaEmail}
                disabled={loading}
              >
                <i className="icon-share"></i> Share
              </button>
            </div>
          </div>
          
          <motion.ul 
            className="shopping-list"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {shoppingItems.map((item, index) => (
              <motion.li 
                key={index}
                className={`shopping-item ${item.completed ? 'completed' : ''}`}
                variants={itemVariants}
              >
                <label className="shopping-item-label">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleItemCompletion(index)}
                    disabled={loading}
                  />
                  <span className="shopping-item-name">{item.name}</span>
                  <span className="shopping-item-amount">{item.amount}</span>
                  <span className="shopping-item-cost">${item.cost.toFixed(2)}</span>
                </label>
                
                {/* Affiliate link placeholder */}
                <a 
                  href={`https://www.walmart.com/search/?query=${encodeURIComponent(item.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="affiliate-link"
                >
                  Buy on Walmart
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </>
      ) : (
        <div className="empty-shopping-list">
          <p>Your shopping list is empty. Select recipes to generate a shopping list.</p>
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

export default ShoppingList;
