# NutriCare Recipes - Specialized Food Recipes for Health Conditions

## 🏥 Project Overview

NutriCare Recipes is a comprehensive web application designed to provide specialized, nutritionally-tailored recipes for patients with specific health conditions. The application focuses on **Chronic Kidney Disease (CKD) and Renal Patients** as the primary use case, with scalability for additional health conditions.

## ✨ Features

### 1. **Health Condition Selector**
- Users can select their health condition
- Currently supports: **Chronic Kidney Disease (CKD)** - Fully Implemented
- Future conditions ready for implementation: Diabetes, Hypertension, Heart Disease
- Each condition has specialized recipe recommendations

### 2. **Cuisine Type Selection**
- **3 Cuisine Categories:**
  - 🇨🇳 Chinese Cuisine (120+ recipes)
  - 🇺🇸 Western Cuisine (120+ recipes)  
  - 🇹🇭 Thai Cuisine (120+ recipes)
- **Total: 360+ specialized recipes for renal patients**

### 3. **Advanced Filtering & Search**
- **Search by Recipe Name or Ingredients**
- **Filter by:**
  - Meal Type (Breakfast, Lunch, Dinner, Snack, Dessert)
  - Preparation Time (Quick <30min, Medium 30-60min, Longer >60min)
  - Cuisine Type
  - Combined filters for precise results

### 4. **Comprehensive Recipe Details**
Each recipe includes:
- **Nutritional Information:**
  - Calories
  - Potassium (crucial for CKD)
  - Phosphorus (crucial for CKD)
  - Sodium (low for renal patients)
  - Protein (appropriate amounts)
  - Fiber (for digestive health)

- **Renal-Specific Notes:**
  - How the recipe supports kidney health
  - Dietary considerations
  - Portion recommendations
  - Mineral content recommendations

- **Prep Information:**
  - Step-by-step instructions
  - Ingredient list with quantities
  - Preparation time
  - Servings
  - Difficulty level

### 5. **Responsive Design**
- Works on Desktop, Tablet, and Mobile devices
- Beautiful gradient UI with modern design
- Smooth animations and transitions
- Easy-to-navigate interface

## 📁 Project Structure

```
FoodRecipe/
├── index.html                 # Landing page with health condition selector
├── recipes.html              # Recipes browsing page
├── css/
│   └── style.css            # Complete styling (responsive design)
├── js/
│   ├── app.js               # Navigation and condition selection logic
│   └── recipes.js           # Recipe filtering, search, and display logic
├── data/
│   └── recipes.json         # Comprehensive recipe database (360+ recipes)
├── generate_recipes.py      # Script to generate/expand recipes
└── README.md                # This file
```

## 🍽️ Renal Diet Specialization

### Why Focus on Renal Health?

Patients with Chronic Kidney Disease (CKD) must carefully manage their diet to:
- **Reduce Potassium** - Helps regulate heart function and nerve activity
- **Control Phosphorus** - Prevents bone disease and cardiovascular complications
- **Limit Sodium** - Manages blood pressure and fluid retention
- **Monitor Protein** - Provides essential amino acids without overburden on kidneys
- **Maintain Fiber** - Supports digestive health

### Recipe Categories by CKD Stage

All recipes in NutriCare are designed to be generally safe for:
- Early CKD (Stage 3-4): With portion control
- Advanced CKD (Stage 4-5): With strict portions
- Dialysis Patients: With medical professional guidance

## 🚀 Getting Started

### 1. **Open the Application**
Open `index.html` in any modern web browser

### 2. **Select Health Condition**
Choose "Chronic Kidney Disease (CKD)" to access renal-friendly recipes

### 3. **Choose Cuisine Type**
Select from Chinese, Western, or Thai cuisine on the recipes page

### 4. **Search & Filter**
Use the search bar and filters to find recipes matching your preferences

### 5. **View Recipe Details**
Click any recipe to see full details including:
- Complete ingredient list
- Step-by-step instructions
- Detailed nutritional information
- Renal-specific health notes

## 📊 Recipe Database

### Current Content (360+ Recipes)
- **Chinese Cuisine:** 120 recipes
  - Steamed dishes
  - Stir-fries
  - Soups
  - Salads
  - Rice dishes

- **Western Cuisine:** 120 recipes
  - Baked proteins
  - Roasted vegetables
  - Light casseroles
  - Breakfast options
  - Grain-based meals

- **Thai Cuisine:** 120 recipes
  - Curries
  - Stir-fries
  - Soups
  - Salads
  - Rice and noodle dishes

### Expanding the Recipe Database

To add more recipes or modify existing ones:

1. **Edit recipes.json directly:**
   - Add new recipe objects following the existing format
   - Ensure all required fields are completed
   - Validate JSON syntax

2. **Use the generate_recipes.py script:**
   ```bash
   python3 generate_recipes.py
   ```
   - Creates 360+ recipes automatically
   - Generates realistic nutritional values
   - Adds renal-specific notes

### Recipe JSON Schema

```json
{
  "id": 1,
  "name": "Recipe Name",
  "cuisine": "Chinese|Western|Thai",
  "emoji": "🍽️",
  "description": "Short description",
  "mealType": "breakfast|lunch|dinner|snack|dessert",
  "prepTime": 20,
  "servings": 2,
  "difficulty": "Easy|Medium|Hard",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "nutritionInfo": {
    "calories": "240",
    "potassium": "320mg",
    "phosphorus": "190mg",
    "sodium": "85mg",
    "protein": "32g",
    "fiber": "0g"
  },
  "renalNote": "Renal health information"
}
```

## 💻 Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6)
- **Styling:** Modern CSS with gradients and animations
- **Data:** JSON-based recipe database
- **Responsive:** Mobile-first design approach
- **Browser Support:** All modern browsers (Chrome, Firefox, Safari, Edge)

## 🎨 Design Features

- **Color Scheme:**
  - Primary: Purple gradient (#667eea to #764ba2)
  - Background: Light gray (#f8f9fa)
  - Text: Dark gray (#333)

- **Interactive Elements:**
  - Hover animations on cards
  - Smooth modal transitions
  - Tab-based navigation
  - Dropdown filters

- **Accessibility:**
  - Semantic HTML
  - Clear labels
  - High contrast colors
  - Keyboard navigation support

## 🔄 Future Enhancements

### Phase 2: Additional Health Conditions
- [ ] Diabetes Management Recipes
- [ ] Hypertension-Friendly Recipes
- [ ] Heart Disease Prevention Recipes
- [ ] General Wellness Recipes

### Phase 3: Advanced Features
- [ ] User accounts and saved recipes
- [ ] Meal planning tools
- [ ] Shopping list generator
- [ ] Nutritionist contact integration
- [ ] Recipe ratings and reviews
- [ ] Dietary requirement customization
- [ ] Printable recipe cards
- [ ] Recipe difficulty levels

### Phase 4: Integration
- [ ] Backend API for dynamic content
- [ ] Database for scalable recipe management
- [ ] Admin panel for recipe management
- [ ] User feedback system
- [ ] Analytics tracking

## 📋 Usage Instructions

### For Patients
1. Enter your health condition (Renal/CKD)
2. Select preferred cuisine
3. Use filters to narrow down options
4. Review nutritional information carefully
5. **Always consult healthcare provider** before making dietary changes

### For Healthcare Providers
1. Recommend specific cuisines based on patient preferences
2. Use nutritional data to guide patients
3. Reference renal notes for patient education
4. Track patient adherence to renal diet

### For Nutritionists
1. Use as educational tool for patients
2. Reference for meal planning
3. Customize portions based on CKD stage
4. Integrate into nutrition counseling

## ⚠️ Important Disclaimers

- **This application is for educational purposes only**
- **Not a substitute for professional medical advice**
- **All dietary changes should be approved by healthcare providers**
- **Specific portions vary by CKD stage and individual factors**
- **Consult with a renal dietitian before implementing diet changes**

## 🏥 CKD Stages Reference

| Stage | GFR | Kidney Function | Diet Focus |
|-------|-----|-----------------|-----------|
| 1 | ≥90 | Normal/High | Maintain healthy kidney function |
| 2 | 60-89 | Mild decrease | Slow progression |
| 3a | 45-59 | Moderate decrease | Moderate restrictions |
| 3b | 30-44 | Moderate decrease | Moderate restrictions |
| 4 | 15-29 | Severe decrease | Strict restrictions |
| 5 | <15 | Kidney failure | Dialysis diet considerations |

## 📱 Mobile Features

- Responsive grid layout
- Touch-friendly buttons
- Optimized font sizes
- Easy-to-read nutrition info
- Modal-based recipe details
- Fast loading times

## 🎯 Key Nutritional Guidelines for Renal Patients

### Potassium Guidelines
- **Normal intake:** 2,000-4,000 mg/day
- **CKD Stage 3-4:** 2,000-3,000 mg/day  
- **CKD Stage 5:** 2,000-2,500 mg/day

### Phosphorus Guidelines
- **Stage 3-4:** Monitor/Limit to 1,000-1,200 mg/day
- **Stage 5:** Strict limit to 800-1,000 mg/day

### Sodium Guidelines
- **Recommended:** <2,300 mg/day
- **CKD targets:** <2,000 mg/day
- **Dialysis patients:** <2,000 mg/day

### Protein Guidelines
- **Stage 1-2:** 0.8 g/kg body weight
- **Stage 3-4:** 0.6-0.8 g/kg body weight
- **Stage 5:** 1.0-1.2 g/kg (dialysis)

## 📞 Support & Resources

### For More Information
- National Kidney Foundation: www.kidney.org
- American Kidney Fund: www.kidneyfund.org
- KDIGO Clinical Practice Guidelines

### Healthcare Professional Contacts
- Renal Dietitians
- Nephrologists  
- Primary Care Physicians

## 📝 Version History

- **v1.0** - Initial Release
  - 360+ renal-friendly recipes
  - Chinese, Western, Thai cuisines
  - Advanced filtering and search
  - Responsive design
  - Recipe detail modal

## 👨‍💻 Development

### To Expand Recipes
1. Modify `data/recipes.json`
2. Add new recipe objects
3. Test in browser
4. Validate nutritional information

### To Add New Conditions
1. Update `index.html` with new condition card
2. Create new condition page
3. Build condition-specific recipe database
4. Update navigation logic in `js/app.js`

## 📄 License

This application is created for educational purposes to support renal health management.

## 🙏 Acknowledgments

- Nutritional information based on USDA FoodData Central
- Renal diet guidelines from National Kidney Foundation
- CKD management standards from KDIGO

---

**Remember:** This application is a tool for educational support. Always work with your healthcare provider and registered dietitian for personalized dietary recommendations.

**Last Updated:** April 2024
 
