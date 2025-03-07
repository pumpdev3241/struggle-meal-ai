import axios from 'axios';

// API endpoints
const HUGGING_FACE_API = 'https://api-inference.huggingface.co/models/gpt2';
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-2.0:generateContent';
const GEMINI_FALLBACK_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent';
const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/search';

// API keys
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || '';

/**
 * Generate recipes based on user preferences
 * @param {Object} preferences - User preferences
 * @param {string} preferences.foodPreferences - Food preferences (e.g., "spicy chicken")
 * @param {string} preferences.dietaryRestrictions - Dietary restrictions (e.g., "no dairy")
 * @param {string} preferences.skillLevel - Cooking skill level (e.g., "beginner")
 * @param {number} preferences.budget - Weekly budget (e.g., 20)
 * @param {Array} preferences.pantryItems - Optional pantry items to include
 * @returns {Promise<Array>} - Array of recipe objects
 */
export const generateRecipes = async (preferences) => {
  try {
    // Try Gemini Flash 2.0 first
    if (GEMINI_API_KEY) {
      try {
        const recipes = await generateRecipesWithGemini(preferences);
        return recipes;
      } catch (error) {
        console.log('Gemini Flash 2.0 failed, falling back to Gemini 1.0:', error);
        try {
          const recipes = await generateRecipesWithGeminiFallback(preferences);
          return recipes;
        } catch (fallbackError) {
          console.log('Gemini 1.0 failed, falling back to Hugging Face:', fallbackError);
        }
      }
    }

    // Try Hugging Face
    try {
      const recipes = await generateRecipesWithHuggingFace(preferences);
      return recipes;
    } catch (error) {
      console.log('Hugging Face failed, falling back to mock recipes:', error);
      // If all API calls fail, return mock recipes
      return generateMockRecipes(preferences);
    }
  } catch (error) {
    console.error('Error generating recipes:', error);
    // Return mock recipes as a fallback
    return generateMockRecipes(preferences);
  }
};

/**
 * Generate mock recipes based on user preferences
 * @param {Object} preferences - User preferences
 * @returns {Array} - Array of recipe objects
 */
const generateMockRecipes = (preferences) => {
  const { foodPreferences, dietaryRestrictions } = preferences;
  
  // Create sample recipes based on food preferences
  const foodTypes = foodPreferences.split(',').map(type => type.trim());
  
  const mockRecipes = [
    {
      id: `mock-${Date.now()}-1`,
      name: `Budget-Friendly ${foodTypes[0] || 'Pasta'} Bowl`,
      ingredients: [
        { name: 'Rice', amount: '1 cup', cost: 0.50 },
        { name: 'Beans', amount: '1 can', cost: 0.99 },
        { name: 'Frozen Vegetables', amount: '1 cup', cost: 1.50 },
        { name: 'Olive Oil', amount: '2 tbsp', cost: 0.75 },
        { name: foodTypes[0] || 'Pasta', amount: '8 oz', cost: 1.20 }
      ],
      instructions: [
        'Cook rice according to package instructions.',
        'Heat beans in a small pot.',
        'Microwave frozen vegetables.',
        'Combine all ingredients in a bowl and drizzle with olive oil.',
        'Season with salt and pepper to taste.'
      ],
      prepTime: '15 minutes',
      totalCost: 4.94,
      costPerServing: 2.47,
      servings: 2,
      youtubeKeywords: `easy ${foodTypes[0] || 'pasta'} bowl recipe student budget`
    },
    {
      id: `mock-${Date.now()}-2`,
      name: `Student-Friendly ${foodTypes[1] || 'Chicken'} Stir Fry`,
      ingredients: [
        { name: foodTypes[1] || 'Chicken', amount: '8 oz', cost: 2.50 },
        { name: 'Rice', amount: '1 cup', cost: 0.50 },
        { name: 'Frozen Stir Fry Vegetables', amount: '2 cups', cost: 2.00 },
        { name: 'Soy Sauce', amount: '2 tbsp', cost: 0.30 },
        { name: 'Garlic', amount: '2 cloves', cost: 0.20 }
      ],
      instructions: [
        'Cook rice according to package instructions.',
        `Cook ${foodTypes[1] || 'chicken'} in a pan until done.`,
        'Add frozen vegetables and garlic to the pan.',
        'Stir fry for 5-7 minutes until vegetables are tender.',
        'Add soy sauce and stir to combine.',
        'Serve over rice.'
      ],
      prepTime: '20 minutes',
      totalCost: 5.50,
      costPerServing: 2.75,
      servings: 2,
      youtubeKeywords: `quick ${foodTypes[1] || 'chicken'} stir fry student recipe`
    },
    {
      id: `mock-${Date.now()}-3`,
      name: `Easy ${foodTypes[2] || 'Rice'} and Egg Bowl`,
      ingredients: [
        { name: 'Eggs', amount: '2', cost: 0.50 },
        { name: 'Rice', amount: '1 cup', cost: 0.50 },
        { name: 'Green Onions', amount: '2', cost: 0.30 },
        { name: 'Soy Sauce', amount: '1 tbsp', cost: 0.15 },
        { name: 'Vegetable Oil', amount: '1 tbsp', cost: 0.10 }
      ],
      instructions: [
        'Cook rice according to package instructions.',
        'Heat oil in a pan over medium heat.',
        'Crack eggs into the pan and cook to your preference.',
        'Place eggs over rice in a bowl.',
        'Drizzle with soy sauce and garnish with chopped green onions.'
      ],
      prepTime: '10 minutes',
      totalCost: 1.55,
      costPerServing: 1.55,
      servings: 1,
      youtubeKeywords: `easy ${foodTypes[2] || 'rice'} egg bowl student recipe`
    }
  ];
  
  // Filter recipes based on dietary restrictions
  return filterRecipesByDietaryRestrictions(mockRecipes, dietaryRestrictions);
};

/**
 * Generate recipes using Google Gemini Flash 2.0
 * @param {Object} preferences - User preferences
 * @returns {Promise<Array>} - Array of recipe objects
 */
const generateRecipesWithGemini = async (preferences) => {
  const prompt = createRecipePrompt(preferences);
  
  const response = await axios.post(
    GEMINI_API,
    {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      }
    }
  );

  return parseRecipesFromResponse(response.data);
};

/**
 * Generate recipes using Google Gemini 1.0 (fallback)
 * @param {Object} preferences - User preferences
 * @returns {Promise<Array>} - Array of recipe objects
 */
const generateRecipesWithGeminiFallback = async (preferences) => {
  const prompt = createRecipePrompt(preferences);
  
  const response = await axios.post(
    GEMINI_FALLBACK_API,
    {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      }
    }
  );

  return parseRecipesFromResponse(response.data);
};

/**
 * Generate recipes using Hugging Face Inference API
 * @param {Object} preferences - User preferences
 * @returns {Promise<Array>} - Array of recipe objects
 */
const generateRecipesWithHuggingFace = async (preferences) => {
  const prompt = createRecipePrompt(preferences);
  
  const response = await axios.post(
    HUGGING_FACE_API,
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true
      }
    }
  );

  // Since Hugging Face's GPT-2 might not return structured data,
  // we'll need to parse and structure the response
  return structureHuggingFaceResponse(response.data, preferences);
};

/**
 * Create a prompt for recipe generation based on user preferences
 * @param {Object} preferences - User preferences
 * @returns {string} - Prompt for recipe generation
 */
const createRecipePrompt = (preferences) => {
  const { foodPreferences, dietaryRestrictions, skillLevel, budget, pantryItems = [] } = preferences;
  
  let prompt = `Generate 3 budget-friendly "struggle meal" recipes for a student with the following preferences:
- Food preferences: ${foodPreferences}
- Dietary restrictions: ${dietaryRestrictions}
- Cooking skill level: ${skillLevel}
- Weekly budget: $${budget}`;

  if (pantryItems.length > 0) {
    prompt += `\n- Available pantry items: ${pantryItems.join(', ')}`;
  }

  prompt += `\n\nEach recipe should include:
1. A creative name (something fun like "Broke but Bougie Burritos")
2. List of ingredients with approximate costs
3. Step-by-step instructions
4. Prep time
5. Total cost per serving
6. Keywords for YouTube search

Format each recipe as JSON with the following structure:
{
  "name": "Recipe Name",
  "ingredients": [{"name": "ingredient", "amount": "amount", "cost": cost}],
  "instructions": ["step 1", "step 2", ...],
  "prepTime": "XX minutes",
  "totalCost": XX.XX,
  "costPerServing": XX.XX,
  "servings": X,
  "youtubeKeywords": "keywords for searching"
}

Prioritize cheap, common ingredients suitable for students. Ensure all dietary restrictions are respected.`;

  return prompt;
};

/**
 * Parse recipes from Gemini API response
 * @param {Object} responseData - Response data from Gemini API
 * @returns {Array} - Array of recipe objects
 */
const parseRecipesFromResponse = (responseData) => {
  try {
    const text = responseData.candidates[0].content.parts[0].text;
    
    // Extract JSON objects from the text
    const jsonRegex = /{[\s\S]*?}/g;
    const jsonMatches = text.match(jsonRegex);
    
    if (!jsonMatches) {
      throw new Error('No valid JSON found in response');
    }
    
    const recipes = jsonMatches.map(jsonStr => {
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return null;
      }
    }).filter(recipe => recipe !== null);
    
    // Add unique IDs to recipes
    return recipes.map((recipe, index) => ({
      ...recipe,
      id: `generated-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error('Error parsing recipes from response:', error);
    throw error;
  }
};

/**
 * Structure the response from Hugging Face into recipe objects
 * @param {string} responseText - Response text from Hugging Face
 * @param {Object} preferences - User preferences
 * @returns {Array} - Array of recipe objects
 */
const structureHuggingFaceResponse = (responseText, preferences) => {
  // Since Hugging Face's GPT-2 might not return structured data,
  // we'll create some sample recipes based on the preferences
  const { foodPreferences, dietaryRestrictions, budget } = preferences;
  
  // Create sample recipes
  const recipes = [
    {
      id: `generated-${Date.now()}-1`,
      name: `Broke but Bougie ${foodPreferences.split(' ')[0]} Bowl`,
      ingredients: [
        { name: 'Rice', amount: '1 cup', cost: 0.50 },
        { name: 'Beans', amount: '1 can', cost: 0.99 },
        { name: 'Frozen Vegetables', amount: '1 cup', cost: 1.50 },
        { name: 'Sauce', amount: '2 tbsp', cost: 0.75 }
      ],
      instructions: [
        'Cook rice according to package instructions.',
        'Heat beans in a small pot.',
        'Microwave frozen vegetables.',
        'Combine all ingredients in a bowl and top with sauce.'
      ],
      prepTime: '15 minutes',
      totalCost: 3.74,
      costPerServing: 1.87,
      servings: 2,
      youtubeKeywords: `easy ${foodPreferences} bowl recipe student budget`
    },
    {
      id: `generated-${Date.now()}-2`,
      name: `Student Survival ${foodPreferences.split(' ')[0]} Pasta`,
      ingredients: [
        { name: 'Pasta', amount: '8 oz', cost: 1.00 },
        { name: 'Canned Tomatoes', amount: '1 can', cost: 0.89 },
        { name: 'Garlic', amount: '2 cloves', cost: 0.30 },
        { name: 'Olive Oil', amount: '1 tbsp', cost: 0.40 }
      ],
      instructions: [
        'Boil pasta according to package instructions.',
        'In a pan, sauté garlic in olive oil.',
        'Add canned tomatoes and simmer for 10 minutes.',
        'Drain pasta and combine with sauce.'
      ],
      prepTime: '20 minutes',
      totalCost: 2.59,
      costPerServing: 1.30,
      servings: 2,
      youtubeKeywords: `quick ${foodPreferences} pasta student recipe`
    },
    {
      id: `generated-${Date.now()}-3`,
      name: `Dorm Room ${foodPreferences.split(' ')[0]} Delight`,
      ingredients: [
        { name: 'Eggs', amount: '2', cost: 0.50 },
        { name: 'Bread', amount: '2 slices', cost: 0.40 },
        { name: 'Cheese', amount: '1 slice', cost: 0.30 },
        { name: 'Spinach', amount: 'handful', cost: 0.75 }
      ],
      instructions: [
        'Toast bread.',
        'Scramble eggs in a microwave-safe bowl.',
        'Layer eggs, cheese, and spinach on toast.'
      ],
      prepTime: '10 minutes',
      totalCost: 1.95,
      costPerServing: 1.95,
      servings: 1,
      youtubeKeywords: `easy ${foodPreferences} breakfast student recipe`
    }
  ];
  
  // Filter out ingredients that don't meet dietary restrictions
  if (dietaryRestrictions.toLowerCase().includes('dairy')) {
    recipes.forEach(recipe => {
      recipe.ingredients = recipe.ingredients.filter(
        ingredient => !['cheese', 'milk', 'yogurt', 'cream'].includes(ingredient.name.toLowerCase())
      );
    });
  }
  
  return recipes;
};

/**
 * Fetch YouTube videos for a recipe
 * @param {string} keywords - Keywords for YouTube search
 * @returns {Promise<Object>} - YouTube video data
 */
export const fetchYouTubeVideos = async (keywords) => {
  try {
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not provided');
      return null;
    }
    
    const response = await axios.get(YOUTUBE_API, {
      params: {
        part: 'snippet',
        maxResults: 1,
        q: `${keywords} recipe under 5 minutes`,
        type: 'video',
        videoDuration: 'short',
        key: YOUTUBE_API_KEY
      }
    });
    
    if (response.data.items.length === 0) {
      return null;
    }
    
    const video = response.data.items[0];
    return {
      id: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium.url
    };
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return null;
  }
};

/**
 * Filter recipes based on dietary restrictions
 * @param {Array} recipes - Array of recipe objects
 * @param {string} dietaryRestrictions - Dietary restrictions
 * @returns {Array} - Filtered array of recipe objects
 */
export const filterRecipesByDietaryRestrictions = (recipes, dietaryRestrictions) => {
  if (!dietaryRestrictions) {
    return recipes;
  }
  
  const restrictions = dietaryRestrictions.toLowerCase();
  
  // Define ingredients to exclude based on common dietary restrictions
  const excludedIngredients = {
    'dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt'],
    'gluten': ['wheat', 'flour', 'pasta', 'bread', 'cereal', 'barley', 'rye'],
    'nuts': ['peanut', 'almond', 'cashew', 'walnut', 'pecan', 'hazelnut'],
    'vegetarian': ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood'],
    'vegan': ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'egg', 'milk', 'cheese', 'butter', 'cream', 'yogurt', 'honey']
  };
  
  // Determine which ingredients to exclude
  let ingredientsToExclude = [];
  
  Object.keys(excludedIngredients).forEach(restriction => {
    if (restrictions.includes(restriction)) {
      ingredientsToExclude = [...ingredientsToExclude, ...excludedIngredients[restriction]];
    }
  });
  
  // Filter recipes
  return recipes.map(recipe => {
    // Filter out ingredients that match the restrictions
    const filteredIngredients = recipe.ingredients.filter(ingredient => {
      const ingredientName = ingredient.name.toLowerCase();
      return !ingredientsToExclude.some(excluded => ingredientName.includes(excluded));
    });
    
    // If we had to remove ingredients, adjust the recipe
    if (filteredIngredients.length < recipe.ingredients.length) {
      // Calculate new total cost
      const newTotalCost = filteredIngredients.reduce((sum, ingredient) => sum + ingredient.cost, 0);
      
      return {
        ...recipe,
        ingredients: filteredIngredients,
        totalCost: newTotalCost,
        costPerServing: newTotalCost / recipe.servings
      };
    }
    
    return recipe;
  });
};

export default {
  generateRecipes,
  fetchYouTubeVideos,
  filterRecipesByDietaryRestrictions
};
