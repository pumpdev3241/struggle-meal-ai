import React from 'react';
import { Helmet } from 'react-helmet';

/**
 * SEO component for adding meta tags and structured data
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.canonical - Canonical URL
 * @param {Object} props.recipe - Recipe data for structured data (optional)
 * @returns {JSX.Element} - SEO component
 */
const SEO = ({ title, description, canonical, recipe }) => {
  const siteTitle = 'StruggleMeal AI';
  const defaultDescription = 'Budget-friendly meal plans with struggle meal recipes for students';
  const siteUrl = 'https://struggle-meal-ai.web.app';
  
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const pageDescription = description || defaultDescription;
  const pageUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  
  // Generate recipe structured data if recipe is provided
  const recipeStructuredData = recipe ? {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.name,
    author: {
      '@type': 'Organization',
      name: siteTitle
    },
    datePublished: new Date().toISOString(),
    description: `A budget-friendly recipe for students: ${recipe.name}`,
    prepTime: `PT${recipe.prepTime.replace(/\D/g, '')}M`,
    cookTime: `PT${recipe.prepTime.replace(/\D/g, '')}M`,
    totalTime: `PT${recipe.prepTime.replace(/\D/g, '')}M`,
    keywords: recipe.youtubeKeywords,
    recipeYield: `${recipe.servings} serving${recipe.servings > 1 ? 's' : ''}`,
    recipeIngredient: recipe.ingredients.map(ing => `${ing.amount} ${ing.name}`),
    recipeInstructions: recipe.instructions.map(step => ({
      '@type': 'HowToStep',
      text: step
    })),
    nutrition: {
      '@type': 'NutritionInformation',
      servingSize: '1 serving'
    }
  } : null;
  
  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageUrl} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      
      {/* Structured data */}
      {recipe && (
        <script type="application/ld+json">
          {JSON.stringify(recipeStructuredData)}
        </script>
      )}
      
      {/* Website structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteTitle,
          url: siteUrl,
          description: defaultDescription,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
