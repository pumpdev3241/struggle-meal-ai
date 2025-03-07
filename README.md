# StruggleMeal AI

StruggleMeal AI is a responsive web application designed to help students create budget-friendly meal plans with "struggle meal" recipes. The application uses AI to generate customized recipes based on user preferences, dietary restrictions, cooking skill level, and budget.

## Features

- **AI-Powered Recipe Generator**: Generates customized "struggle meal" recipes based on user input.
- **User Preferences Input**: Allows users to enter food preferences, dietary needs, cooking skills, and budget.
- **Recipe Selection and Filters**: Displays AI-generated recipes with details like prep time, cost per serving, and embedded YouTube videos.
- **Shopping List Generator**: Creates an optimized grocery list based on selected recipes.
- **User Authentication**: Login/signup system using Supabase auth.
- **Freemium Model**: Free tier with limited recipes and ads, premium tier with unlimited recipes and additional features.
- **Modern UI Design**: Clean, vibrant design with smooth animations and dark mode support.
- **Responsive Design**: Works on desktop, tablet, and mobile devices.

## Tech Stack

- **Frontend**: React (JavaScript), CSS
- **Backend/Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini Flash 2.0 (with fallback to Gemini 1.0 or Hugging Face)
- **YouTube Integration**: YouTube Data API
- **Deployment**: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- Google Gemini API key (optional)
- YouTube Data API key (optional)
- Firebase account (for deployment)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/struggle-meal-ai.git
   cd struggle-meal-ai
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your API keys:
   ```
   cp .env.example .env
   ```

4. Set up Supabase:
   - Create a new Supabase project
   - Create the following tables:
     - users (id, email, preferences JSON, budget, subscription_status, usage_count)
     - recipes (id, user_id, name, ingredients JSON, cost, prep_time, youtube_link, nutritional_info JSON)
     - shopping_lists (id, user_id, items JSON, total_cost, completed boolean)
     - ingredients (id, name, avg_cost)
     - favorites (id, user_id, recipe_id)
     - history (id, user_id, meal_plan JSON)
     - usage (id, user_id, recipe_count)
   - Enable Supabase auth

5. Start the development server:
   ```
   npm start
   ```

### Deployment

1. Build the project:
   ```
   npm run build
   ```

2. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

3. Login to Firebase:
   ```
   firebase login
   ```

4. Initialize Firebase (if not already done):
   ```
   firebase init
   ```

5. Deploy to Firebase:
   ```
   firebase deploy
   ```

## Usage

1. Sign up or log in to your account.
2. Enter your food preferences, dietary restrictions, cooking skill level, and budget.
3. Browse the AI-generated recipes and select the ones you like.
4. View your shopping list based on the selected recipes.
5. Export or share your shopping list.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Supabase](https://supabase.io/) for the backend and authentication
- [Google Gemini](https://ai.google.dev/) for AI-powered recipe generation
- [YouTube Data API](https://developers.google.com/youtube/v3) for video integration
- [Firebase](https://firebase.google.com/) for hosting
- [React](https://reactjs.org/) for the frontend framework
- [Framer Motion](https://www.framer.com/motion/) for animations
