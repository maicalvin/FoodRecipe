// Global Variables
let allRecipes = [];
let filteredRecipes = [];
let currentCuisineFilter = 'all';
let isCalculatorDrawerOpen = false;

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

    fetchRecipeFile('data/recipes-extended.json')
        .catch(() => fetchRecipeFile('data/recipes.json'))
        .then(data => {
            allRecipes = extractRecipesFromPayload(data).map(normalizeRecipe);
            filteredRecipes = [...allRecipes];

            if (!allRecipes.length) {
                recipeCountText.textContent = 'No recipes found in data files.';
                recipesGrid.innerHTML = '<p class="loading">No recipes are available right now.</p>';
                renderIngredientList();
                return;
            }

            renderIngredientList();
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

function hasValue(value) {
    return value !== undefined && value !== null && value !== '';
}

function formatNutrientFromNumber(value, unit) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 'Not available';
    if (unit === 'mg') return `${Math.round(numeric)}mg`;
    if (unit === 'g') return `${numeric.toFixed(1)}g`;
    return String(Math.round(numeric));
}

function normalizeRecipe(recipe) {
    const perServing = recipe.nutrition_per_serving || {};
    const sourceNutrition = recipe.nutritionInfo || {};

    return {
        ...recipe,
        cuisine: recipe.cuisine || 'General',
        emoji: recipe.emoji || '🍽️',
        description: recipe.description || 'Nutrition-focused recipe.',
        mealType: recipe.mealType || 'meal',
        prepTime: Number.isFinite(Number(recipe.prepTime)) ? Number(recipe.prepTime) : 30,
        servings: Number.isFinite(Number(recipe.servings)) ? Number(recipe.servings) : 1,
        difficulty: recipe.difficulty || 'Easy',
        ingredients: Array.isArray(recipe.ingredients) && recipe.ingredients.length
            ? recipe.ingredients
            : ['See full recipe details from your source data.'],
        instructions: Array.isArray(recipe.instructions) && recipe.instructions.length
            ? recipe.instructions
            : ['Prepare ingredients and cook using your preferred healthy method.'],
        renalNote: recipe.renalNote || 'Nutrition values shown are per serving.',
        nutritionInfo: {
            calories: hasValue(sourceNutrition.calories)
                ? sourceNutrition.calories
                : formatNutrientFromNumber(perServing.calories, null),
            potassium: hasValue(sourceNutrition.potassium)
                ? sourceNutrition.potassium
                : formatNutrientFromNumber(perServing.potassium, 'mg'),
            phosphorus: hasValue(sourceNutrition.phosphorus)
                ? sourceNutrition.phosphorus
                : formatNutrientFromNumber(perServing.phosphorus, 'mg'),
            sodium: hasValue(sourceNutrition.sodium)
                ? sourceNutrition.sodium
                : formatNutrientFromNumber(perServing.sodium, 'mg'),
            protein: hasValue(sourceNutrition.protein)
                ? sourceNutrition.protein
                : formatNutrientFromNumber(perServing.protein, 'g'),
            fiber: hasValue(sourceNutrition.fiber)
                ? sourceNutrition.fiber
                : '0.0g'
        }
    };
}

function extractRecipesFromPayload(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.recipes)) return data.recipes;
    return [];
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
let ingredientNutritionDatabase = {};
let calculatorDishIngredients = [];

const INGREDIENT_KEYWORDS = [
    { label: 'apple', terms: ['apple'] },
    { label: 'asparagus', terms: ['asparagus'] },
    { label: 'bok choy', terms: ['bok choy'] },
    { label: 'broccoli', terms: ['broccoli'] },
    { label: 'cabbage', terms: ['cabbage'] },
    { label: 'carrot', terms: ['carrot'] },
    { label: 'cauliflower', terms: ['cauliflower'] },
    { label: 'chicken', terms: ['chicken', 'gai'] },
    { label: 'cod', terms: ['cod'] },
    { label: 'cucumber', terms: ['cucumber'] },
    { label: 'egg', terms: ['egg', 'omelette', 'frittata', 'custard'] },
    { label: 'eggplant', terms: ['eggplant'] },
    { label: 'fish', terms: ['fish', 'sea bass', 'tilapia'] },
    { label: 'garlic', terms: ['garlic'] },
    { label: 'ginger', terms: ['ginger', 'galangal'] },
    { label: 'green beans', terms: ['green beans'] },
    { label: 'herbs', terms: ['herb', 'basil', 'lemongrass', 'dill'] },
    { label: 'leek', terms: ['leek'] },
    { label: 'lemon', terms: ['lemon', 'lime'] },
    { label: 'mango', terms: ['mango'] },
    { label: 'mushroom', terms: ['mushroom', 'fungus'] },
    { label: 'noodles', terms: ['noodle', 'noodles', 'pad see ew', 'pad woon sen'] },
    { label: 'papaya', terms: ['papaya'] },
    { label: 'pasta', terms: ['pasta'] },
    { label: 'pear', terms: ['pear'] },
    { label: 'pork', terms: ['pork', 'moo'] },
    { label: 'potato', terms: ['potato'] },
    { label: 'pumpkin', terms: ['pumpkin'] },
    { label: 'quinoa', terms: ['quinoa'] },
    { label: 'radish', terms: ['radish', 'daikon'] },
    { label: 'rice', terms: ['rice', 'congee', 'pilaf'] },
    { label: 'salmon', terms: ['salmon'] },
    { label: 'seafood', terms: ['seafood', 'squid', 'crab'] },
    { label: 'shrimp', terms: ['shrimp', 'prawn'] },
    { label: 'spinach', terms: ['spinach'] },
    { label: 'sweet potato', terms: ['sweet potato'] },
    { label: 'tofu', terms: ['tofu'] },
    { label: 'turkey', terms: ['turkey'] },
    { label: 'watermelon', terms: ['watermelon'] },
    { label: 'zucchini', terms: ['zucchini'] }
];

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
    const ingredientsSet = new Set(INGREDIENT_KEYWORDS.map(keyword => keyword.label));

    allRecipes.forEach(recipe => {
        if (recipe.ingredients) {
            recipe.ingredients.forEach(ingredient => {
                const baseIngredient = ingredient.split(',')[0].trim().toLowerCase();
                const cleanedIngredient = baseIngredient
                    .replace(/^[\d.\/½¼¾\s]+(cup|tbsp|tsp|g|oz|ml|lb|piece|clove|slice|lb)*\s*/i, '')
                    .trim();
                if (cleanedIngredient && cleanedIngredient.length > 2 && !cleanedIngredient.startsWith('see full recipe')) {
                    ingredientsSet.add(cleanedIngredient);
                }
            });
        }

        const searchableText = [recipe.name, recipe.description, ...(recipe.ingredients || [])]
            .join(' ')
            .toLowerCase();

        INGREDIENT_KEYWORDS.forEach(keyword => {
            if (keyword.terms.some(term => searchableText.includes(term))) {
                ingredientsSet.add(keyword.label);
            }
        });
    });

    return Array.from(ingredientsSet).sort();
}

function renderIngredientList(filterText = '') {
    const ingredientList = document.getElementById('ingredientList');
    if (!ingredientList) return;

    const normalizedFilter = filterText.toLowerCase().trim();
    const visibleIngredients = extractUniqueIngredients().filter(ingredient =>
        !normalizedFilter || ingredient.includes(normalizedFilter)
    );

    if (!visibleIngredients.length) {
        ingredientList.innerHTML = '<p class="ingredient-list-empty">No ingredients match your search.</p>';
        return;
    }

    ingredientList.innerHTML = visibleIngredients.map(ingredient => `
        <button
            type="button"
            class="ingredient-option${selectedIngredients.includes(ingredient) ? ' active' : ''}"
            onclick="toggleIngredientSelection('${ingredient.replace(/'/g, "\\'")}')"
        >
            ${ingredient}
        </button>
    `).join('');
}

function toggleIngredientSelection(ingredient) {
    if (selectedIngredients.includes(ingredient)) {
        removeIngredientTag(ingredient);
        return;
    }

    addIngredientTag(ingredient);
}

// Update ingredient suggestions
function updateIngredientSuggestions() {
    const input = document.getElementById('ingredientInput').value.toLowerCase().trim();
    const suggestionsDiv = document.getElementById('ingredientSuggestions');

    renderIngredientList(input);
    
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
    renderIngredientList();
}

// Remove ingredient tag
function removeIngredientTag(ingredient) {
    selectedIngredients = selectedIngredients.filter(ing => ing !== ingredient);
    updateIngredientTags();
    renderIngredientList(document.getElementById('ingredientInput').value);
}

function clearSelectedIngredients() {
    selectedIngredients = [];
    updateIngredientTags();
    renderIngredientList(document.getElementById('ingredientInput').value);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function loadIngredientNutrition() {
    const status = document.getElementById('calculatorDataStatus');

    fetch('data/ingredient-nutrition.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Unable to load ingredient data (${response.status})`);
            }
            return response.json();
        })
        .then(data => {
            ingredientNutritionDatabase = data || {};
            renderCalculatorIngredientOptions();
            renderCalculatorDishIngredients();

            if (status) {
                status.textContent = `${Object.keys(ingredientNutritionDatabase).length} ingredients ready for calculation.`;
            }
        })
        .catch(error => {
            console.error('Error loading ingredient nutrition data:', error);
            if (status) {
                status.textContent = 'Could not load ingredient nutrition data right now.';
            }
        });
}

function renderCalculatorIngredientOptions() {
    const select = document.getElementById('calculatorIngredientSelect');
    if (!select) return;

    const ingredientNames = Object.keys(ingredientNutritionDatabase).sort((left, right) => left.localeCompare(right));

    if (!ingredientNames.length) {
        select.innerHTML = '<option value="">Ingredient list unavailable</option>';
        return;
    }

    select.innerHTML = ingredientNames.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
}

function calculateIngredientNutrients(ingredientName, grams) {
    const perHundred = ingredientNutritionDatabase[ingredientName];
    const factor = grams / 100;

    return {
        calories: perHundred.calories * factor,
        protein: perHundred.protein * factor,
        potassium: perHundred.potassium * factor,
        phosphorus: perHundred.phosphorus * factor,
        sodium: perHundred.sodium * factor
    };
}

function addCalculatorIngredient() {
    const select = document.getElementById('calculatorIngredientSelect');
    const amountInput = document.getElementById('calculatorAmountInput');

    if (!select || !amountInput) return;

    const ingredientName = select.value;
    const grams = Number(amountInput.value);

    if (!ingredientName || !ingredientNutritionDatabase[ingredientName]) {
        alert('Please choose an ingredient from the list.');
        return;
    }

    if (!Number.isFinite(grams) || grams <= 0) {
        alert('Please enter a valid amount in grams.');
        return;
    }

    calculatorDishIngredients.push({
        id: `${ingredientName}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: ingredientName,
        grams,
        nutrients: calculateIngredientNutrients(ingredientName, grams)
    });

    renderCalculatorDishIngredients();
    amountInput.value = '100';
}

function removeCalculatorIngredient(entryId) {
    calculatorDishIngredients = calculatorDishIngredients.filter(entry => entry.id !== entryId);
    renderCalculatorDishIngredients();
}

function clearCalculatorIngredients() {
    calculatorDishIngredients = [];
    renderCalculatorDishIngredients();
}

function syncCalculatorDrawerState() {
    const drawer = document.getElementById('calculatorDrawer');
    const overlay = document.getElementById('calculatorDrawerOverlay');
    const toggle = document.getElementById('calculatorDrawerToggle');

    if (!drawer || !overlay || !toggle) return;

    drawer.classList.toggle('is-open', isCalculatorDrawerOpen);
    overlay.classList.toggle('is-open', isCalculatorDrawerOpen);
    toggle.classList.toggle('is-open', isCalculatorDrawerOpen);
    drawer.setAttribute('aria-hidden', String(!isCalculatorDrawerOpen));
    toggle.setAttribute('aria-expanded', String(isCalculatorDrawerOpen));
    toggle.textContent = isCalculatorDrawerOpen ? '🧮 Close Calculator' : '🧮 Open Calculator';
}

function openCalculatorDrawer() {
    isCalculatorDrawerOpen = true;
    syncCalculatorDrawerState();
}

function closeCalculatorDrawer() {
    isCalculatorDrawerOpen = false;
    syncCalculatorDrawerState();
}

function toggleCalculatorDrawer() {
    isCalculatorDrawerOpen = !isCalculatorDrawerOpen;
    syncCalculatorDrawerState();
}

function updateCalculatorTotals() {
    const totals = calculatorDishIngredients.reduce((accumulator, entry) => {
        accumulator.calories += entry.nutrients.calories;
        accumulator.protein += entry.nutrients.protein;
        accumulator.potassium += entry.nutrients.potassium;
        accumulator.phosphorus += entry.nutrients.phosphorus;
        accumulator.sodium += entry.nutrients.sodium;
        return accumulator;
    }, {
        calories: 0,
        protein: 0,
        potassium: 0,
        phosphorus: 0,
        sodium: 0
    });

    const caloriesEl = document.getElementById('calculatorTotalCalories');
    const proteinEl = document.getElementById('calculatorTotalProtein');
    const potassiumEl = document.getElementById('calculatorTotalPotassium');
    const phosphorusEl = document.getElementById('calculatorTotalPhosphorus');
    const sodiumEl = document.getElementById('calculatorTotalSodium');

    if (caloriesEl) caloriesEl.textContent = `${Math.round(totals.calories)} kcal`;
    if (proteinEl) proteinEl.textContent = `${totals.protein.toFixed(1)} g`;
    if (potassiumEl) potassiumEl.textContent = `${Math.round(totals.potassium).toLocaleString()} mg`;
    if (phosphorusEl) phosphorusEl.textContent = `${Math.round(totals.phosphorus).toLocaleString()} mg`;
    if (sodiumEl) sodiumEl.textContent = `${Math.round(totals.sodium).toLocaleString()} mg`;
}

function renderCalculatorDishIngredients() {
    const body = document.getElementById('calculatorIngredientsBody');
    if (!body) return;

    if (!calculatorDishIngredients.length) {
        body.innerHTML = '<tr><td colspan="6" class="calculator-empty-state">Add ingredients from the list to start calculating your dish.</td></tr>';
        updateCalculatorTotals();
        return;
    }

    body.innerHTML = calculatorDishIngredients.map(entry => `
        <tr>
            <td>${escapeHtml(entry.name)}</td>
            <td>${Math.round(entry.grams)} g</td>
            <td>${entry.nutrients.protein.toFixed(1)} g</td>
            <td>${Math.round(entry.nutrients.potassium).toLocaleString()} mg</td>
            <td>${Math.round(entry.nutrients.sodium).toLocaleString()} mg</td>
            <td>
                <button type="button" class="calculator-remove-btn" onclick="removeCalculatorIngredient('${entry.id}')">Remove</button>
            </td>
        </tr>
    `).join('');

    updateCalculatorTotals();
}

function getRecipeSearchableIngredients(recipe) {
    return [recipe.name, recipe.description, ...(recipe.ingredients || [])]
        .join(' ')
        .toLowerCase();
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
        const recipeSearchableText = getRecipeSearchableIngredients(recipe);
        
        const matchCount = selectedIngredients.filter(selected => 
            recipeSearchableText.includes(selected)
        ).length;
        
        return matchCount > 0;
    });
    
    // Sort by best match (most ingredients matched)
    matchedRecipes.sort((a, b) => {
        const aRecipeSearchableText = getRecipeSearchableIngredients(a);
        const bRecipeSearchableText = getRecipeSearchableIngredients(b);
        
        const aMatches = selectedIngredients.filter(selected => 
            aRecipeSearchableText.includes(selected)
        ).length;
        
        const bMatches = selectedIngredients.filter(selected => 
            bRecipeSearchableText.includes(selected)
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
                const recipeSearchableText = getRecipeSearchableIngredients(recipe);
                const matches = selectedIngredients.filter(selected => 
                    recipeSearchableText.includes(selected)
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

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && isCalculatorDrawerOpen) {
        closeCalculatorDrawer();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    updateIngredientTags();
    renderIngredientList();
    renderCalculatorDishIngredients();
    loadIngredientNutrition();
    syncCalculatorDrawerState();
});
