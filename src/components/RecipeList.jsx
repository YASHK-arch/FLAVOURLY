import React from 'react';
import RecipeCard from './RecipeCard';

const RecipeList = ({ recipes, favorites, onToggleFavorite, onShowDetails, loading, error }) => {
  if (loading) {
    return (
      <div className="state-container">
        <div className="loader"></div>
        <p>Finding delicious recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container error">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="state-container empty">
        <div className="empty-icon">🍽️</div>
        <p>No recipes found. Try searching for a different ingredient or meal!</p>
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map(recipe => (
        <RecipeCard 
          key={recipe.idMeal}
          recipe={recipe}
          isFavorite={favorites.some(fav => fav.idMeal === recipe.idMeal)}
          onToggleFavorite={onToggleFavorite}
          onShowDetails={onShowDetails}
        />
      ))}
    </div>
  );
};

export default RecipeList;
