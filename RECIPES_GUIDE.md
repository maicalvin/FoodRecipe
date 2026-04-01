# Recipe Management Guide

## 📖 Overview

This guide explains how to manage, expand, and customize the NutriCare Recipes database.

## 🔧 Adding New Recipes

### Method 1: Direct JSON Editing

1. Open `data/recipes.json`
2. Find the last recipe in the array
3. Add a new recipe object following this structure:

```json
{
  "id": 361,
  "name": "Recipe Name",
  "cuisine": "Chinese|Western|Thai",
  "emoji": "🍽️",
  "description": "Brief description of the dish",
  "mealType": "breakfast|lunch|dinner|snack|dessert",
  "prepTime": 30,
  "servings": 4,
  "difficulty": "Easy|Medium|Hard",
  "ingredients": [
    "Ingredient 1 with quantity",
    "Ingredient 2 with quantity",
    "Ingredient 3 with quantity"
  ],
  "instructions": [
    "Step 1 description",
    "Step 2 description",
    "Step 3 description"
  ],
  "nutritionInfo": {
    "calories": "280",
    "potassium": "380mg",
    "phosphorus": "210mg",
    "sodium": "85mg",
    "protein": "32g",
    "fiber": "2g"
  },
  "renalNote": "Explanation of why this recipe is suitable for renal patients"
}
```

### Method 2: Using the Recipe Generator Script

Run the Python script to auto-generate recipes:

```bash
python3 generate_recipes.py
```

This will create 360+ recipes automatically with realistic nutritional values.

## 📊 Nutritional Information Guidelines

### For Renal Patients - Important Minerals

#### Potassium (K)
- **Low potassium recipes:** <120mg per serving
- **Moderate:** 120-300mg per serving
- **High:** >300mg per serving (use cautiously)
- **CKD Stage 4-5:** Should avoid high potassium foods

**Low Potassium Foods:**
- White rice, white bread
- Cabbage, cucumber, zucchini
- Green beans, carrots
- White fish, chicken breast
- Egg whites

**High Potassium Foods (to limit):**
- Bananas, oranges, tomatoes
- Potatoes, sweet potatoes
- Spinach, Swiss chard
- Beans, nuts
- Whole grains

#### Phosphorus (P)
- **Low:** <80mg per serving
- **Moderate:** 80-200mg per serving
- **High:** >200mg per serving

**High Phosphorus Sources (limit):**
- Dairy products
- Meat, poultry, fish (limit portions)
- Whole grains
- Nuts and seeds
- Processed foods

#### Sodium (Na)
- **Target:** <85mg per serving for renal patients
- **Per day:** <2000mg total
- **Cooking tip:** Use herbs and spices for flavor instead of salt

### Protein Content
- **Per serving:** 20-35g for renal patients
- **Total daily:** Based on CKD stage and body weight
- **Best sources:** Lean meats, fish,egg whites, low-fat dairy

## 🌍 Cuisine-Specific Tips

### Chinese Cuisine Adaptations
- Use low-sodium soy sauce (save 200+ mg sodium per recipe)
- Steaming preserves nutrients better than deep frying
- Fresh ginger adds flavor without sodium
- Stir-fries with minimal oil are light and kidney-friendly
- White rice instead of brown rice (lower potassium)

### Western Cuisine Adaptations
- Baking/grilling instead of frying reduces fat
- Herb seasoning replaces salt
- Portion control of protein is key
- Light cream sauces instead of heavy ones
- Grilled vegetables with minimal salt

### Thai Cuisine Adaptations
- Fresh herbs (basil, cilantro) add flavor
- Lime juice reduces need for salt
- Light coconut milk (not full-fat)
- Fresh vegetables and lean proteins
- Limit fish sauce (high sodium) - use low-sodium versions
- Reduce chili for sensitive patients

## 📝 Recipe Template Examples

### Easy: Steamed Dish

```json
{
  "id": 100,
  "name": "Steamed Fish with Lemon",
  "cuisine": "Western",
  "emoji": "🐟",
  "description": "Simple steamed white fish with lemon herb",
  "mealType": "dinner",
  "prepTime": 20,
  "servings": 2,
  "difficulty": "Easy",
  "ingredients": [
    "8 oz white fish fillet (cod or tilapia)",
    "1 lemon, sliced",
    "1 tbsp fresh dill",
    "Water for steaming"
  ],
  "instructions": [
    "Fill steamer with water and bring to boil",
    "Place fish on steaming plate",
    "Top with lemon slices and dill",
    "Steam for 12-15 minutes until fish flakes",
    "Transfer to serving plate",
    "Serve immediately"
  ],
  "nutritionInfo": {
    "calories": "220",
    "potassium": "380mg",
    "phosphorus": "210mg",
    "sodium": "75mg",
    "protein": "32g",
    "fiber": "0g"
  },
  "renalNote": "Excellent lean protein with very low sodium. Steaming preserves all nutrients without adding salt."
}
```

### Medium: Stir-Fry

```json
{
  "id": 200,
  "name": "Vegetable Chicken Stir-Fry",
  "cuisine": "Chinese",
  "emoji": "🍗",
  "description": "Quick chicken with colorful vegetables",
  "mealType": "dinner",
  "prepTime": 25,
  "servings": 3,
  "difficulty": "Medium",
  "ingredients": [
    "10 oz chicken breast, diced",
    "1 red bell pepper, sliced",
    "1 cup snap peas",
    "1 cup carrots, sliced",
    "2 tbsp vegetable oil",
    "3 cloves garlic, minced",
    "1 tbsp low-sodium soy sauce",
    "1/2 tsp sesame oil"
  ],
  "instructions": [
    "Heat oil in wok over high heat",
    "Add chicken, stir-fry until almost cooked (5 minutes)",
    "Add vegetables, stir-fry 3-4 minutes",
    "Add garlic and soy sauce",
    "Toss in sesame oil",
    "Serve over rice"
  ],
  "nutritionInfo": {
    "calories": "280",
    "potassium": "380mg",
    "phosphorus": "200mg",
    "sodium": "100mg",
    "protein": "30g",
    "fiber": "2.5g"
  },
  "renalNote": "Good balance of protein and vegetables. Watch portion size due to moderate mineral content."
}
```

## 🎯 Recipe Validation Checklist

Before adding a recipe, verify:

- [ ] **ID is unique** (higher than last recipe)
- [ ] **Name is descriptive** and under 50 characters
- [ ] **Cuisine is valid:** Chinese, Western, or Thai
- [ ] **Emoji is appropriate** and displays correctly
- [ ] **Description is clear** (50-100 characters)
- [ ] **MealType is valid:** breakfast, lunch, dinner, snack, dessert
- [ ] **PrepTime is realistic** (in minutes)
- [ ] **Servings is reasonable** (2-4 typical)
- [ ] **Difficulty matches** content (Easy/Medium/Hard)
- [ ] **Ingredients have quantities**  (at least 4-6)
- [ ] **Instructions are clear** (at least 4-6 steps)
- [ ] **Nutrition values are realistic:**
  - Calories: 100-400 range typical
  - Potassium: Based on ingredients
  - Phosphorus: Based on protein
  - Sodium: <200mg preferred, <300mg acceptable
  - Protein: 0-40g depending on dish
  - Fiber: 0-5g typical
- [ ] **Renal Note explains** why it's suitable for CKD patients
- [ ] **JSON is valid** (check syntax)

## 🔍 Testing New Recipes

1. **Update recipes.json**
2. **Refresh browser** (clear cache if needed)
3. **Search for recipe** to verify it appears
4. **Click recipe** to view complete details
5. **Check nutrition info** displays correctly
6. **Verify filters work**

## 📈 Nutrition Calculation Tips

### For Lean Proteins (per 3-4 oz / 100g):
- Chicken breast: 31g protein, 165 cal, ~200mg potassium
- Fish (white): 25g protein, 100 cal, ~300mg potassium
- Turkey breast: 29g protein, 135 cal, ~200mg potassium
- Egg whites: 3.6g protein, 17 cal, ~55mg potassium

### For Vegetables (per 1 cup raw):
- Cabbage: 1.1g protein, 22 cal, ~170mg potassium
- Green beans: 1.9g protein, 31 cal, ~244mg potassium
- Carrots: 0.9g protein, 52 cal, ~410mg potassium
- Bell peppers: 1.5g protein, 46 cal, ~290mg potassium

### For Grains (per 1 cup cooked):
- White rice: 4.3g protein, 205 cal, ~55mg potassium
- Pasta (cooked): 8g protein, 221 cal, ~180mg potassium

## 🚀 Batch Adding Recipes

To add multiple recipes efficiently:

1. Prepare recipe data in spreadsheet
2. Convert to JSON format
3. Validate structure
4. Merge into recipes.json
5. Test in application
6. Commit changes

## 🌟 Best Practices

1. **Keep recipes simple** - easier for patients to understand
2. **Use common ingredients** - accessible and affordable
3. **Provide alternatives** - accommodate preferences
4. **Be specific with quantities** - crucial for renal diet
5. **Explain health benefits** - educate patients
6. **Include prep tips** - make recipes practical
7. **Test recipes** - verify nutritional accuracy
8. **Update regularly** - keep content fresh

## 🔐 Data Backup

Before major changes:
```bash
cp data/recipes.json data/recipes_backup.json
```

## 📚 Additional Resources

- USDA FoodData Central: https://fdc.nal.usda.gov/
- MyFitnessPal Database: For nutrition verification
- National Kidney Foundation: https://www.kidney.org/
- KDIGO Guidelines: https://kdigo.org/

## 💡 Tips for Renal-Friendly Recipes

1. **Cooking Methods to Prefer:**
   - Steaming
   - Baking
   - Grilling
   - Boiling (drain liquid)
   - Stir-frying with minimal oil

2. **Flavor Boosters (No Salt):**
   - Fresh herbs: dill, parsley, cilantro, basil
   - Spices: garlic, ginger, turmeric, paprika
   - Acids: lemon juice, lime juice, vinegar
   - Sesame oil
   - Low-sodium sauces

3. **Portion Control:**
   - Protein: 3-4 oz per serving
   - Vegetables: 1+ cups per serving
   - Grains: 1/2-1 cup per serving
   - Nuts/Seeds: Minimal (high phosphorus)

---

**Last Updated:** April 2024
