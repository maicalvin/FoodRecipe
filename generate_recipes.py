import json
from pathlib import Path

DATA_PATH = Path("data/recipes.json")


def normalize_name(name: str) -> str:
    return (name or "").strip().lower()


def pick_method(name: str) -> str:
    n = normalize_name(name)
    if "salad" in n:
        return "salad"
    if "baked" in n or "roasted" in n or "casserole" in n or "meatloaf" in n or "frittata" in n:
        return "oven"
    if "grilled" in n:
        return "grill"
    if "stir-fried" in n or "stir-fry" in n or "pad " in n or "krapow" in n or "grapow" in n:
        return "stir_fry"
    if "steamed" in n:
        return "steam"
    if "soup" in n or "congee" in n or "curry" in n or "chili" in n:
        return "simmer"
    if "braised" in n:
        return "braise"
    if "poached" in n:
        return "poach"
    if "fried rice" in n:
        return "fried_rice"
    return "saute"


def pick_main_protein(name: str) -> tuple[str, int]:
    n = normalize_name(name)
    if "cod" in n:
        return ("cod fillet", 180)
    if "tilapia" in n:
        return ("tilapia fillet", 180)
    if "salmon" in n:
        return ("salmon fillet", 170)
    if "fish" in n:
        return ("white fish fillet", 180)
    if "shrimp" in n:
        return ("shrimp, peeled and deveined", 180)
    if "crab" in n:
        return ("crab meat", 160)
    if "turkey" in n:
        return ("lean turkey", 220)
    if "pork" in n or "moo" in n:
        return ("lean pork", 200)
    if "chicken" in n or "gai" in n:
        return ("skinless chicken breast", 220)
    if "egg" in n:
        return ("egg whites", 180)
    if "tofu" in n:
        return ("firm tofu", 220)
    return ("protein of choice", 180)


def cuisine_ingredients(cuisine: str) -> list[str]:
    if cuisine == "Chinese":
        return [
            "garlic, minced (8 g)",
            "ginger, julienned matchsticks (10 g)",
            "green onion, 3 mm slices (20 g)",
            "low-sodium soy sauce (12 ml)",
            "sesame oil (5 ml)",
            "canola oil (10 ml)",
        ]
    if cuisine == "Thai":
        return [
            "garlic, minced (8 g)",
            "fresh ginger or galangal, thin slices (10 g)",
            "lemongrass, finely sliced (12 g)",
            "low-sodium fish sauce (8 ml)",
            "lime juice (10 ml)",
            "rice bran oil (10 ml)",
        ]
    return [
        "garlic, minced (8 g)",
        "yellow onion, 8 mm dice (60 g)",
        "fresh parsley, chopped (8 g)",
        "olive oil (10 ml)",
        "lemon juice (10 ml)",
        "ground black pepper (1 g)",
    ]


def build_ingredients(recipe: dict) -> list[str]:
    cuisine = recipe.get("cuisine", "Western")
    method = pick_method(recipe.get("name", ""))
    protein_name, protein_g = pick_main_protein(recipe.get("name", ""))

    ingredients = [f"{protein_name} ({protein_g} g)"]

    if method in {"soup", "simmer", "poach", "braise", "congee"}:
        ingredients.append("low-sodium broth (700 ml)")
    if method == "fried_rice" or "rice" in normalize_name(recipe.get("name", "")):
        ingredients.append("cooked rice, chilled (260 g)")
    if "noodle" in normalize_name(recipe.get("name", "")) or "pad" in normalize_name(recipe.get("name", "")):
        ingredients.append("rice noodles, soaked and drained (180 g)")

    ingredients.extend([
        "carrot, 5 mm half-moons (70 g)",
        "zucchini or cabbage, 2 cm strips (100 g)",
    ])
    ingredients.extend(cuisine_ingredients(cuisine))

    # Keep ingredient list compact and consistent for UI readability.
    return ingredients[:10]


def build_instructions(recipe: dict) -> list[str]:
    name = recipe.get("name", "Recipe")
    cuisine = recipe.get("cuisine", "Western")
    method = pick_method(name)
    prep = int(recipe.get("prepTime", 25) or 25)

    common_prep = [
        "Pat protein dry; trim visible fat; cut to 3-4 cm pieces if not fillet.",
        "Prepare vegetables: onion 8 mm dice, carrot 5 mm slices, leafy vegetables 3 cm strips.",
        "Measure seasonings in separate bowls to control sodium and avoid over-seasoning.",
    ]

    if method == "steam":
        return common_prep + [
            "Set steamer water to a gentle boil over high heat, then reduce to medium so steam stays steady.",
            "Arrange protein in a single layer; add ginger/garlic/scallion and 1 tbsp low-sodium sauce.",
            "Steam covered for 8-12 minutes (fish) or 14-16 minutes (chicken/pork) until core reaches 74 C.",
            "Rest 2 minutes; drizzle 1 tsp aromatic oil; garnish and serve immediately.",
        ]

    if method == "stir_fry":
        return common_prep + [
            "Preheat wok until lightly smoking over high heat; add 2 tsp oil and swirl to coat.",
            "Stir-fry protein on high heat for 2-3 minutes until 80% cooked; remove to a warm plate.",
            "Add vegetables; stir-fry 2 minutes on high heat, then 1 minute on medium heat to soften.",
            "Return protein, add sauce, and toss 60-90 seconds until glossy and fully cooked.",
            "Finish with lime/lemon and herbs; total wok time 6-8 minutes.",
        ]

    if method == "fried_rice":
        return common_prep + [
            "Heat wok on medium-high; add oil and scramble egg/egg white for 45-60 seconds; remove.",
            "Add chilled rice and press with spatula to break clumps; stir-fry 2 minutes on high heat.",
            "Add diced vegetables and aromatics; cook 2 minutes, keeping grains separate.",
            "Return egg and season lightly; toss 1 minute over medium-high heat.",
            "Serve hot; target total cook time 7-8 minutes.",
        ]

    if method == "oven":
        return common_prep + [
            "Preheat oven to 200 C (fan 190 C); line tray with parchment.",
            "Season protein and vegetables with measured oil and herbs; spread in one layer.",
            "Bake at center rack for 18-22 minutes (fish) or 28-35 minutes (chicken/turkey), turning once.",
            "Broil 1-2 minutes for browning if needed; rest 3 minutes before slicing.",
            "Check doneness: poultry 74 C internal temperature; fish flakes easily.",
        ]

    if method == "grill":
        return common_prep + [
            "Preheat grill pan or grill to medium-high (about 220 C surface).",
            "Brush grates lightly with oil; grill protein 3-4 minutes per side.",
            "Lower to medium heat and finish 2-4 minutes until internal temperature reaches 74 C for poultry or fish flakes.",
            "Grill vegetables 2-3 minutes, turning once.",
            "Rest 2 minutes; squeeze lemon/lime and serve.",
        ]

    if method in {"simmer", "poach", "braise"}:
        style = "Thai" if cuisine == "Thai" else ("Chinese" if cuisine == "Chinese" else "Western")
        return common_prep + [
            f"Bring broth to a light simmer over medium heat; add {style} aromatics and cook 3 minutes.",
            "Add protein and keep at low simmer (small bubbles, not boiling) for 10-18 minutes.",
            "Add vegetables in stages: hard vegetables first 5 minutes, leafy vegetables last 2 minutes.",
            "Season to taste, then simmer 2 more minutes; total pot time 18-28 minutes.",
            "Rest off heat for 2 minutes before serving to stabilize flavor.",
        ]

    if method == "salad":
        return [
            "Slice vegetables thinly: cucumber 2 mm rounds, onion 1 mm half-moons, herbs roughly chopped.",
            "If using protein, poach or grill first, cool 5 minutes, then cut into 1 cm strips.",
            "Whisk dressing: citrus juice, low-sodium seasoning, and 1 tsp oil until emulsified.",
            "Toss vegetables and protein with dressing for 30 seconds; do not over-mix.",
            "Chill 8-10 minutes before serving for best texture.",
        ]

    return common_prep + [
        "Heat pan to medium-high and add oil.",
        "Cook protein 4-8 minutes depending on thickness, then add vegetables.",
        "Cook until vegetables are tender-crisp and protein is fully cooked.",
        f"Finish seasoning and serve; total cook time about {max(10, prep - 5)} minutes.",
    ]


def enrich_recipe(recipe: dict) -> dict:
    enriched = dict(recipe)
    enriched["ingredients"] = build_ingredients(recipe)
    enriched["instructions"] = build_instructions(recipe)

    # Upgrade renal note wording to include practical cooking guidance.
    renal = recipe.get("renalNote", "")
    if "sodium" not in renal.lower():
        renal = "Use low-sodium seasoning and measured portions to support renal dietary targets."
    enriched["renalNote"] = renal
    return enriched


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Cannot find {DATA_PATH}")

    with DATA_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    recipes = data.get("recipes", [])
    enriched_recipes = [enrich_recipe(recipe) for recipe in recipes]

    output = {"recipes": enriched_recipes}
    with DATA_PATH.open("w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Enriched {len(enriched_recipes)} recipes with detailed ingredients and instructions.")


if __name__ == "__main__":
    main()
