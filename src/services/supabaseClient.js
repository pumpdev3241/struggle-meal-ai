import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

// User preferences functions
export const saveUserPreferences = async (userId, preferences) => {
  const { data, error } = await supabase
    .from('users')
    .upsert({ 
      id: userId, 
      preferences: preferences,
      updated_at: new Date()
    });
  return { data, error };
};

export const getUserPreferences = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('preferences')
    .eq('id', userId)
    .single();
  return { data, error };
};

// Recipe functions
export const saveRecipe = async (recipe) => {
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipe);
  return { data, error };
};

export const getRecipes = async (userId) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
};

export const getFavoriteRecipes = async (userId) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('recipe_id')
    .eq('user_id', userId);
  
  if (error) return { data: null, error };
  
  const recipeIds = data.map(fav => fav.recipe_id);
  
  if (recipeIds.length === 0) return { data: [], error: null };
  
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('*')
    .in('id', recipeIds);
  
  return { data: recipes, error: recipesError };
};

export const toggleFavoriteRecipe = async (userId, recipeId, isFavorite) => {
  if (isFavorite) {
    // Remove from favorites
    const { data, error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);
    return { data, error };
  } else {
    // Add to favorites
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, recipe_id: recipeId });
    return { data, error };
  }
};

// Shopping list functions
export const saveShoppingList = async (userId, items, totalCost) => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .upsert({ 
      user_id: userId, 
      items: items,
      total_cost: totalCost,
      completed: false,
      updated_at: new Date()
    });
  return { data, error };
};

export const getShoppingList = async (userId) => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .single();
  return { data, error };
};

export const updateShoppingListItem = async (userId, itemIndex, completed) => {
  // First get the current shopping list
  const { data: currentList, error: getError } = await getShoppingList(userId);
  
  if (getError) return { data: null, error: getError };
  
  // Update the specific item
  const updatedItems = [...currentList.items];
  updatedItems[itemIndex] = { ...updatedItems[itemIndex], completed };
  
  // Save the updated list
  const { data, error } = await supabase
    .from('shopping_lists')
    .update({ 
      items: updatedItems,
      updated_at: new Date()
    })
    .eq('id', currentList.id);
  
  return { data, error };
};

// Usage tracking functions
export const incrementUsageCount = async (userId) => {
  // First check if user exists in usage table
  const { data: existingData, error: checkError } = await supabase
    .from('usage')
    .select('recipe_count')
    .eq('user_id', userId)
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    return { data: null, error: checkError };
  }
  
  if (existingData) {
    // Update existing record
    const { data, error } = await supabase
      .from('usage')
      .update({ 
        recipe_count: existingData.recipe_count + 1,
        updated_at: new Date()
      })
      .eq('user_id', userId);
    return { data, error };
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('usage')
      .insert({ 
        user_id: userId, 
        recipe_count: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    return { data, error };
  }
};

export const getUserUsageCount = async (userId) => {
  const { data, error } = await supabase
    .from('usage')
    .select('recipe_count')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

// Subscription status functions
export const getUserSubscriptionStatus = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserSubscriptionStatus = async (userId, status) => {
  const { data, error } = await supabase
    .from('users')
    .update({ 
      subscription_status: status,
      updated_at: new Date()
    })
    .eq('id', userId);
  return { data, error };
};

// Export the supabase client for direct use
export default supabase;
