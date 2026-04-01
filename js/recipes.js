// Global Variables
let allRecipes = [];
let filteredRecipes = [];
let currentCuisineFilter = 'all';

const RENAL_GUIDANCE_MG = {
    potassiumPerMeal: 700,
    sodiumPerMeal: 600,
    phosphorusPerMeal: 300
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadRecipes();
});

// Load recipes from JSON file
function loadRecipes() {
    const recipesGrid = document.getElementById('recipesGrid');
    const recipeCountText = document.getElementById('recipeCountText');

    const withTimeout = (promise, ms) => {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Recipe request timed out')), ms))
        ]);
    };

    const fetchRecipeFile = (filePath) => {
        return withTimeout(fetch(filePath), 8000)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Unable to load ${filePath} (${response.status})`);
                }
                return response.json();
            });
    };

    fetchRecipeFile('data/recipes.json')
        .catch(() => fetchRecipeFile('data/recipes-extended.json'))
        .then(data => {
            allRecipes = data.recipes || [];
            filteredRecipes = [...allRecipes];

            if (!allRecipes.length) {
                recipeCountText.textContent = 'No recipes found in data files.';
                recipesGrid.innerHTML = '<p class="loading">No recipes are available right now.</p>';
                return;
            }

            displayRecipes(filteredRecipes);
        })
        .catch(error => {
            console.error('Error loading recipes:', error);
            recipeCountText.textContent = 'Unable to load recipes';
            recipesGrid.innerHTML = '<p class="loading">Could not load recipes. If you opened this file directly, run a local server and open recipes.html from http://localhost.</p>';
        });

    setTimeout(() => {
        if (!allRecipes.length && recipesGrid && recipesGrid.textContent.includes('Loading recipes')) {
            recipeCountText.textContent = 'Loading took too long';
            recipesGrid.innerHTML = '<p class="loading">Loading is taking too long. Please refresh once or run from a local server.</p>';
        }
    }, 10000);
}

function parseNutrientMg(value) {
    if (value === undefined || value === null) return null;
    const numeric = String(value).replace(/[^\d.]/g, '');
    if (!numeric) return null;
    const parsed = Number(numeric);
    return Number.isNaN(parsed) ? null : parsed;
}

function formatMg(value) {
    const mg = parseNutrientMg(value);
    if (mg === null) return 'Not available';
    return `${mg.toLocaleString()} mg`;
}

function getRenalLevel(valueMg, limitMg) {
    if (valueMg === null) return 'No data';
    if (valueMg <= limitMg * 0.75) return 'Good';
    if (valueMg <= limitMg) return 'Watch';
    return 'High';
}

function getServingWeight(recipe) {
    return recipe.servingWeight || recipe.servingWeightGrams || recipe.weightPerServing || null;
}

function getServingWeightLabel(recipe) {
    const servingWeight = getServingWeight(recipe);
    if (!servingWeight) return 'Serving weight: Not provided';
    return `Serving weight: ${servingWeight}`;
}

// Filter recipes by cuisine
function filterByCuisine(cuisine, clickEvent) {
    currentCuisineFilter = cuisine;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (clickEvent && clickEvent.target) {
        clickEvent.target.classList.add('active');
    }
    
    // Filter recipes
    if (cuisine === 'all') {
        filteredRecipes = [...allRecipes];
    } else {
        filteredRecipes = allRecipes.filter(recipe => recipe.cuisine.toLowerCase() === cuisine);
    }
    
    // Apply other filters
    applyFilters();
    displayRecipes(filteredRecipes);
}

// Apply all filters
function applyFilters() {
    let recipes = currentCuisineFilter === 'all' 
        ? [...allRecipes] 
        : allRecipes.filter(r => r.cuisine.toLowerCase() === currentCuisineFilter);
    
    // Apply meal type filter
    const mealType = document.getElementById('mealTypeFilter').value;
    if (mealType) {
        recipes = recipes.filter(r => r.mealType.toLowerCase() === mealType);
    }
    
    // Apply prep time filter
    const prepTime = document.getElementById('prepTimeFilter').value;
    if (prepTime) {
        recipes = recipes.filter(r => {
            const time = r.prepTime;
            if (prepTime === 'quick') return time < 30;
            if (prepTime === 'medium') return time >= 30 && time <= 60;
            if (prepTime === 'long') return time > 60;
            return true;
        });
    }
    
    filteredRecipes = recipes;
}

// Filter recipes
function filterRecipes() {
    applyFilters();
    displayRecipes(filteredRecipes);
}

// Search recipes
function searchRecipes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        applyFilters();
        displayRecipes(filteredRecipes);
        return;
    }
    
    const results = filteredRecipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm) ||
        (recipe.ingredients && recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm)))
    );
    
    displayRecipes(results);
}

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    applyFilters();
    displayRecipes(filteredRecipes);
}

// Display recipes in grid
function displayRecipes(recipes) {
    const grid = document.getElementById('recipesGrid');
    const countText = document.getElementById('recipeCountText');
    
    countText.textContent = `Showing ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}`;
    
    if (recipes.length === 0) {
        grid.innerHTML = '<p class="loading">No recipes found matching your criteria.</p>';
        return;
    }
    
    grid.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" onclick="openRecipeModal(${recipe.id})">
            <div class="recipe-image">${recipe.emoji || '🍽️'}</div>
            <div class="recipe-content">
                <span class="recipe-cuisine">${recipe.cuisine}</span>
                <h3>${recipe.name}</h3>
                <div class="recipe-details">
                    <div class="recipe-detail-item">⏱️ ${recipe.prepTime} min</div>
                    <div class="recipe-detail-item">👥 ${recipe.servings} servings</div>
                    <div class="recipe-detail-item">${recipe.mealType}</div>
                </div>
                <p class="recipe-description">${recipe.description}</p>
                <div class="serving-weight-text">${getServingWeightLabel(recipe)}</div>
                <div class="recipe-nutrition">
                    <div class="nutrition-badge"><strong>K:</strong> ${formatMg(recipe.nutritionInfo.potassium)}</div>
                    <div class="nutrition-badge"><strong>P:</strong> ${formatMg(recipe.nutritionInfo.phosphorus)}</div>
                    <div class="nutrition-badge"><strong>Na:</strong> ${formatMg(recipe.nutritionInfo.sodium)}</div>
                </div>
                <div class="nutrition-total">Total K + Na: ${(parseNutrientMg(recipe.nutritionInfo.potassium) !== null && parseNutrientMg(recipe.nutritionInfo.sodium) !== null) ? `${(parseNutrientMg(recipe.nutritionInfo.potassium) + parseNutrientMg(recipe.nutritionInfo.sodium)).toLocaleString()} mg` : 'Not available'}</div>
                <button class="btn btn-primary" style="margin-top: 15px;">View Recipe</button>
            </div>
        </div>
    `).join('');
}

// Open recipe modal
function openRecipeModal(recipeId) {
    const normalizedRecipeId = Number(recipeId);
    const recipe = allRecipes.find(r => Number(r.id) === normalizedRecipeId);
    if (!recipe) return;
    
    const modal = document.getElementById('recipeModal');
    const modalBody = document.getElementById('modalBody');

    const potassiumMg = parseNutrientMg(recipe.nutritionInfo.potassium);
    const sodiumMg = parseNutrientMg(recipe.nutritionInfo.sodium);
    const phosphorusMg = parseNutrientMg(recipe.nutritionInfo.phosphorus);
    const totalKNa = potassiumMg !== null && sodiumMg !== null ? potassiumMg + sodiumMg : null;
    const servingWeightLabel = getServingWeightLabel(recipe);
    
    const ingredientsList = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
    const instructionsList = recipe.instructions.map(inst => `<li>${inst}</li>`).join('');
    
    const nutritionHTML = `
        <div class="nutrition-grid">
            <div class="nutrition-item">
                <div class="label">Calories</div>
                <div class="value">${recipe.nutritionInfo.calories}</div>
            </div>
            <div class="nutrition-item">
                <div class="label">Potassium</div>
                <div class="value">${formatMg(recipe.nutritionInfo.potassium)}</div>
            </div>
            <div class="nutrition-item">
                <div class="label">Phosphorus</div>
                <div class="value">${formatMg(recipe.nutritionInfo.phosphorus)}</div>
            </div>
            <div class="nutrition-item">
                <div class="label">Sodium</div>
                <div class="value">${formatMg(recipe.nutritionInfo.sodium)}</div>
            </div>
            <div class="nutrition-item">
                <div class="label">Protein</div>
                <div class="value">${recipe.nutritionInfo.protein}</div>
            </div>
            <div class="nutrition-item">
                <div class="label">Fiber</div>
                <div class="value">${recipe.nutritionInfo.fiber}</div>
            </div>
            <div class="nutrition-item">
                <div class="label">Total K + Na</div>
                <div class="value">${totalKNa !== null ? `${totalKNa.toLocaleString()} mg` : 'Not available'}</div>
            </div>
        </div>
    `;

    const renalGuidanceHTML = `
        <div class="renal-guidance">
            <h4>Renal Mineral Guidance (Per Meal)</h4>
            <div class="renal-guidance-grid">
                <div class="renal-guidance-item">
                    <div class="guidance-label">Potassium</div>
                    <div class="guidance-value">${formatMg(recipe.nutritionInfo.potassium)}</div>
                    <div class="guidance-status">Level: ${getRenalLevel(potassiumMg, RENAL_GUIDANCE_MG.potassiumPerMeal)} (target <= ${RENAL_GUIDANCE_MG.potassiumPerMeal} mg)</div>
                </div>
                <div class="renal-guidance-item">
                    <div class="guidance-label">Sodium</div>
                    <div class="guidance-value">${formatMg(recipe.nutritionInfo.sodium)}</div>
                    <div class="guidance-status">Level: ${getRenalLevel(sodiumMg, RENAL_GUIDANCE_MG.sodiumPerMeal)} (target <= ${RENAL_GUIDANCE_MG.sodiumPerMeal} mg)</div>
                </div>
                <div class="renal-guidance-item">
                    <div class="guidance-label">Phosphorus</div>
                    <div class="guidance-value">${formatMg(recipe.nutritionInfo.phosphorus)}</div>
                    <div class="guidance-status">Level: ${getRenalLevel(phosphorusMg, RENAL_GUIDANCE_MG.phosphorusPerMeal)} (target <= ${RENAL_GUIDANCE_MG.phosphorusPerMeal} mg)</div>
                </div>
                <div class="renal-guidance-item">
                    <div class="guidance-label">Serving Weight</div>
                    <div class="guidance-value">${servingWeightLabel.replace('Serving weight: ', '')}</div>
                    <div class="guidance-status">Nutrient amounts above are shown per recipe serving.</div>
                </div>
            </div>
        </div>
    `;
    
    const renalNoteHTML = `
        <div class="renal-note">
            <h4>📋 Renal Health Note</h4>
            <p>${recipe.renalNote}</p>
        </div>
    `;
    
    modalBody.innerHTML = `
        <div class="recipe-detail">
            <h2>${recipe.name} ${recipe.emoji || ''}</h2>

            <div class="recipe-detail-layout">
                <div class="recipe-main-column">
                    <div class="recipe-detail-info">
                        <div class="detail-info-box">
                            <h4>Cuisine</h4>
                            <p>${recipe.cuisine}</p>
                        </div>
                        <div class="detail-info-box">
                            <h4>Preparation Time</h4>
                            <p>${recipe.prepTime} minutes</p>
                        </div>
                        <div class="detail-info-box">
                            <h4>Servings</h4>
                            <p>${recipe.servings}</p>
                        </div>
                        <div class="detail-info-box">
                            <h4>Difficulty</h4>
                            <p>${recipe.difficulty}</p>
                        </div>
                    </div>

                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${ingredientsList}
                    </ul>

                    <h3>Instructions</h3>
                    <ol class="instructions-list">
                        ${instructionsList}
                    </ol>
                </div>

                <aside class="recipe-side-column">
                    <h3>Nutritional Information</h3>
                    <div class="nutrition-info">
                        ${nutritionHTML}
                    </div>
                    ${renalGuidanceHTML}
                    ${renalNoteHTML}
                </aside>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close recipe modal
function closeRecipeModal() {
    document.getElementById('recipeModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(clickEvent) {
    const modal = document.getElementById('recipeModal');
    if (clickEvent.target === modal) {
        modal.style.display = 'none';
    }
}

// ==============================================
// NEW FEATURES: PNG EXPORT & INGREDIENT FINDER
// ==============================================

// Global variable for selected ingredients
let selectedIngredients = [];

// Download recipe as PNG
function downloadRecipeAsPNG() {
    const modalContent = document.querySelector('.recipe-detail');
    
    if (!modalContent) {
        alert('Recipe not found. Please try again.');
        return;
    }
    
    // Create a temporary container for the recipe
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '30px';
    tempContainer.style.width = '800px';
    tempContainer.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    
    // Clone and enhance the recipe content
    tempContainer.innerHTML = `
        <div style="border: 2px solid #667eea; border-radius: 15px; padding: 30px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px;">
                <h1 style="color: #667eea; font-size: 28px; margin: 0 0 10px 0;">🥗 NutriCare Recipes</h1>
                <h2 style="color: #333; font-size: 24px; margin: 0;">
                    ${modalContent.querySelector('h2').textContent}
                </h2>
                <p style="color: #999; font-size: 12px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            ${modalContent.innerHTML}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; font-size: 11px; color: #999;">
                <p>⚠️ Consult with a healthcare provider before making dietary changes. • Visit: nutricare-recipes.com</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(tempContainer);
    
    html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
    }).then(canvas => {
        // Convert canvas to PNG and download
        const link = document.createElement('a');
        const recipeName = modalContent.querySelector('h2').textContent.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `Recipe_${recipeName}_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Remove temporary container
        document.body.removeChild(tempContainer);
        
        alert('✅ Recipe downloaded as PNG successfully!');
    }).catch(error => {
        console.error('Error generating PNG:', error);
        document.body.removeChild(tempContainer);
        alert('❌ Error generating PNG. Please try again.');
    });
}

// Extract unique ingredients from all recipes
function extractUniqueIngredients() {
    const ingredientsSet = new Set();
    
    allRecipes.forEach(recipe => {
        if (recipe.ingredients) {
            recipe.ingredients.forEach(ingredient => {
                // Extract base ingredient name (first word)
                const baseIngredient = ingredient.split(',')[0].trim().toLowerCase();
                // Remove common words and quantities
                const cleanedIngredient = baseIngredient
                    .replace(/^[\d.\/½¼¾\s]+(cup|tbsp|tsp|g|oz|ml|lb|piece|clove|slice|lb)*\s*/i, '')
                    .trim();
                if (cleanedIngredient && cleanedIngredient.length > 2) {
                    ingredientsSet.add(cleanedIngredient);
                }
            });
        }
    });
    
    return Array.from(ingredientsSet).sort();
}

// Update ingredient suggestions
function updateIngredientSuggestions() {
    const input = document.getElementById('ingredientInput').value.toLowerCase().trim();
    const suggestionsDiv = document.getElementById('ingredientSuggestions');
    
    if (input.length < 1) {
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    const allIngredients = extractUniqueIngredients();
    const filtered = allIngredients.filter(ing => 
        ing.includes(input) && !selectedIngredients.includes(ing)
    ).slice(0, 10);
    
    if (filtered.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    suggestionsDiv.innerHTML = filtered.map(ingredient => `
        <div class="suggestion-item" onclick="addIngredientTag('${ingredient}')">
            ${ingredient}
        </div>
    `).join('');
    
    suggestionsDiv.style.display = 'block';
}

// Add ingredient tag
function addIngredientTag(ingredient) {
    if (!selectedIngredients.includes(ingredient)) {
        selectedIngredients.push(ingredient);
    }
    
    document.getElementById('ingredientInput').value = '';
    document.getElementById('ingredientSuggestions').style.display = 'none';
    updateIngredientTags();
}

// Remove ingredient tag
function removeIngredientTag(ingredient) {
    selectedIngredients = selectedIngredients.filter(ing => ing !== ingredient);
    updateIngredientTags();
}

// Update ingredient tags display
function updateIngredientTags() {
    const tagsContainer = document.getElementById('selectedIngredientsTags');
    
    if (selectedIngredients.length === 0) {
        tagsContainer.innerHTML = '<p style="color: #999; font-style: italic;">No ingredients selected yet</p>';
        return;
    }
    
    tagsContainer.innerHTML = selectedIngredients.map(ingredient => `
        <span class="ingredient-tag">
            ${ingredient}
            <span class="tag-remove" onclick="removeIngredientTag('${ingredient}')">✕</span>
        </span>
    `).join('');
}

// Find recipes by selected ingredients
function findRecipesByIngredients() {
    if (selectedIngredients.length === 0) {
        alert('Please select at least one ingredient');
        return;
    }
    
    const matchedRecipes = allRecipes.filter(recipe => {
        if (!recipe.ingredients) return false;
        
        // Convert recipe ingredients to lowercase for matching
        const recipeIngredientsLower = recipe.ingredients.map(ing => ing.toLowerCase());
        
        // Check how many selected ingredients are in this recipe
        const matchCount = selectedIngredients.filter(selected => 
            recipeIngredientsLower.some(recipeIng => recipeIng.includes(selected))
        ).length;
        
        return matchCount > 0;
    });
    
    // Sort by best match (most ingredients matched)
    matchedRecipes.sort((a, b) => {
        const aRecipeIngredientsLower = a.ingredients.map(ing => ing.toLowerCase());
        const bRecipeIngredientsLower = b.ingredients.map(ing => ing.toLowerCase());
        
        const aMatches = selectedIngredients.filter(selected => 
            aRecipeIngredientsLower.some(recipeIng => recipeIng.includes(selected))
        ).length;
        
        const bMatches = selectedIngredients.filter(selected => 
            bRecipeIngredientsLower.some(recipeIng => recipeIng.includes(selected))
        ).length;
        
        return bMatches - aMatches;
    });
    
    displayIngredientResults(matchedRecipes);
}

// Display ingredient search results
function displayIngredientResults(recipes) {
    const resultsDiv = document.getElementById('ingredientResults');
    
    if (recipes.length === 0) {
        resultsDiv.innerHTML = `
            <div class="no-results">
                <p>❌ No recipes found with selected ingredients.</p>
                <p style="font-size: 0.9em; color: #999;">Try selecting different ingredients or add more items.</p>
            </div>
        `;
        resultsDiv.style.display = 'block';
        return;
    }
    
    resultsDiv.innerHTML = `
        <div class="results-header">
            <h3>🎉 Found ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} with your ingredients!</h3>
            <p>Click on a recipe to view full details</p>
        </div>
        <div class="ingredient-results-grid">
            ${recipes.map(recipe => {
                // Calculate match percentage
                const recipeIngredientsLower = recipe.ingredients.map(ing => ing.toLowerCase());
                const matches = selectedIngredients.filter(selected => 
                    recipeIngredientsLower.some(recipeIng => recipeIng.includes(selected))
                ).length;
                const matchPercentage = Math.round((matches / selectedIngredients.length) * 100);
                
                return `
                    <div class="ingredient-result-card" onclick="openRecipeModal(${recipe.id})">
                        <div class="match-badge">${matchPercentage}% Match</div>
                        <div class="recipe-emoji">${recipe.emoji || '🍽️'}</div>
                        <h4>${recipe.name}</h4>
                        <p class="recipe-cuisine">${recipe.cuisine}</p>
                        <p class="recipe-description">${recipe.description}</p>
                        <div class="recipe-meta">
                            <span>⏱️ ${recipe.prepTime} min</span>
                            <span>👥 ${recipe.servings}</span>
                        </div>
                        <div class="ingredient-result-nutrition">
                            <span>K: ${formatMg(recipe.nutritionInfo.potassium)}</span>
                            <span>Na: ${formatMg(recipe.nutritionInfo.sodium)}</span>
                        </div>
                        <button class="btn btn-primary" style="width: 100%; margin-top: 10px;">View Recipe</button>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    resultsDiv.style.display = 'block';
}

// Close ingredient suggestions when clicking outside
document.addEventListener('click', function(event) {
    const suggestionsDiv = document.getElementById('ingredientSuggestions');
    const ingredientInput = document.getElementById('ingredientInput');
    
    if (suggestionsDiv && !ingredientInput.contains(event.target) && !suggestionsDiv.contains(event.target)) {
        suggestionsDiv.style.display = 'none';
    }
});
