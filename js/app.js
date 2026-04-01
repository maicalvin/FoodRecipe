// Navigation and Health Condition Selection
function selectCondition(condition) {
    if (condition === 'renal') {
        // Redirect to recipes page
        window.location.href = 'recipes.html?condition=renal';
    } else {
        alert('This health condition is coming soon!');
    }
}

// Smooth scroll
document.addEventListener('DOMContentLoaded', function() {
    // Add any global initialization if needed
    console.log('NutriCare App Loaded');
});
