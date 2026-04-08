"""
Tamil Nadu Traditional Food Database
Based on: "Nutritional Landscape of Tamil Nadu" research document
Sources: IFCT 2017 (NIN), INDB, regional nutritional studies

Categories:
  - High Protein (muscle repair, enzymatic functions)
  - Balanced Diet (typical Tamil Sappadu)
  - Weight Loss / Diabetic Management (high fiber, low GI)
  - Weight Gain (calorie-dense, complex carbs)
  - Cheat Meals (traditional sweets/snacks)
"""

# Each food item: (name, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, category, notes)

TN_FOODS = [
    # ========== I. HIGH PROTEIN DATASET ==========
    # Legumes & Pulses
    ("Urad Dal (Black Gram)", 341, 25.2, 59.6, 1.4, 0.9, "high_protein", "Key ingredient in Idli/Dosa batter; complete protein with rice"),
    ("Moong Dal (Green Gram)", 347, 24.0, 59.9, 1.2, 4.1, "high_protein", "Light, easy to digest; used in pongal and kootu"),
    ("Toor Dal (Pigeon Pea)", 343, 22.3, 57.6, 1.7, 5.1, "high_protein", "Base for sambar; staple protein source"),
    ("Chana Dal (Bengal Gram)", 360, 20.1, 59.8, 5.3, 3.9, "high_protein", "Used in sundal, adai, and chutneys"),
    ("Kollu (Horse Gram)", 321, 22.5, 57.2, 0.5, 5.3, "high_protein", "Traditional pulse for rasam; aids weight loss"),
    ("Rajma (Kidney Beans)", 337, 22.9, 60.6, 1.3, 4.8, "high_protein", "Rich in iron; used in curries"),
    ("Pattani Sundal (Green Peas Sundal)", 125, 7.2, 19.8, 1.8, 5.5, "high_protein", "Temple prasadam; excellent snack protein"),
    ("Kadalai Sundal (Chickpea Sundal)", 164, 8.9, 27.4, 2.6, 7.6, "high_protein", "Navratri special; mineral-rich"),
    
    # Meats & Seafood (Chettinad & Coastal)
    ("Chicken Chettinad (100g cooked)", 195, 27.0, 3.5, 8.5, 0.5, "high_protein", "Fiery Chettinad preparation; black pepper, star anise"),
    ("Vanjaram / Seer Fish (raw)", 109, 21.0, 0.0, 2.6, 0.0, "high_protein", "Omega-3 rich coastal staple; grilled or curry"),
    ("Nethili / Anchovy (dried)", 310, 60.0, 0.0, 6.5, 0.0, "high_protein", "Sun-dried; extremely protein-dense"),
    ("Meen Kulambu (Fish Curry, per serving)", 180, 18.0, 6.0, 9.0, 1.0, "high_protein", "Tamarind-based; coastal Tamil Nadu"),
    ("Iraal Karuvadu (Dry Shrimp)", 295, 62.4, 1.5, 3.8, 0.0, "high_protein", "Highest protein density; watch sodium"),
    ("Mutton Kola Urundai (Meatballs)", 220, 18.0, 8.0, 13.0, 0.5, "high_protein", "Chettinad appetizer; spiced with fennel"),
    ("Egg Masala (2 eggs)", 210, 14.0, 4.0, 15.0, 0.5, "high_protein", "Common across all Tamil regions"),
    
    # Dairy
    ("Paneer (Indian Cottage Cheese)", 265, 18.3, 1.2, 20.8, 0.0, "high_protein", "Used in North-South fusion dishes"),
    ("Curd / Thayir (plain, full fat)", 60, 3.1, 4.9, 3.3, 0.0, "high_protein", "Essential end-of-meal; probiotics"),
    ("Buttermilk / Neer Mor", 40, 1.5, 3.0, 2.0, 0.0, "high_protein", "Summer coolant; aids digestion"),
    
    # ========== II. BALANCED DIET (Tamil Sappadu) ==========
    ("Idli (2 pieces, ~120g)", 156, 4.3, 33.0, 0.4, 1.2, "balanced", "Fermented; low GI; B-vitamins from fermentation"),
    ("Dosa (1 plain, ~50g)", 133, 3.9, 18.3, 5.2, 0.8, "balanced", "Fermented batter; crispy; pair with chutney"),
    ("Sambar (1 cup, 200ml)", 130, 5.6, 16.0, 4.5, 3.2, "balanced", "Lentil + vegetable stew; vitamin-rich"),
    ("Rasam (1 cup, 200ml)", 55, 1.8, 7.5, 2.0, 1.0, "balanced", "Tamarind-pepper soup; digestive; low calorie"),
    ("Curd Rice / Thayir Sadam (1 cup)", 207, 5.0, 35.0, 5.0, 0.5, "balanced", "Probiotic; cooling; end-of-meal staple"),
    ("Ven Pongal (1 cup)", 210, 5.0, 30.0, 8.0, 1.5, "balanced", "Rice + moong dal; ghee-tempered; breakfast"),
    ("Kootu (Mixed Veg, 1 cup)", 120, 4.5, 14.0, 5.0, 3.5, "balanced", "Coconut-based; moderate calories"),
    ("Poriyal / Thoran (Dry Veg, 1 cup)", 90, 2.5, 10.0, 4.5, 3.0, "balanced", "Stir-fried veg with coconut; fiber-rich"),
    ("Parboiled Rice (1 cup cooked)", 182, 3.5, 40.0, 0.4, 1.0, "balanced", "Lower GI than polished rice; Tamil staple"),
    ("Appam (1 piece)", 120, 2.0, 22.0, 2.5, 0.5, "balanced", "Fermented rice batter; lacy edges"),
    ("Idiyappam (2 pieces)", 170, 3.0, 36.0, 1.0, 1.0, "balanced", "String hoppers; steamed; light dinner"),
    ("Upma (1 cup)", 210, 5.0, 30.0, 8.0, 2.0, "balanced", "Rava-based; vegetables; quick breakfast"),
    ("Keerai Masiyal (1 cup)", 85, 4.5, 8.0, 3.5, 4.0, "balanced", "Mashed greens with dal; iron-rich"),
    
    # ========== III. WEIGHT LOSS / DIABETIC MANAGEMENT ==========
    ("Ragi Mudde / Ragi Ball (1 ball ~150g)", 130, 3.8, 28.5, 0.7, 4.5, "weight_loss", "Finger millet; 350mg calcium/100g; low GI"),
    ("Ragi Dosa (1 piece)", 110, 3.5, 20.0, 2.0, 3.0, "weight_loss", "Millet-based; diabetic-friendly"),
    ("Kambu Koozh (Pearl Millet Porridge, 1 glass)", 95, 3.0, 18.0, 1.5, 2.5, "weight_loss", "Fermented; cooling; 8x more iron than rice"),
    ("Thinai Pongal (Foxtail Millet, 1 cup)", 180, 4.5, 28.0, 5.5, 3.0, "weight_loss", "Low glycemic; rich in minerals"),
    ("Varagu Upma (Kodo Millet, 1 cup)", 175, 4.0, 28.0, 5.0, 3.5, "weight_loss", "High fiber; controls blood sugar"),
    ("Murungai Keerai Soup (Moringa, 1 cup)", 45, 3.8, 5.0, 1.0, 2.5, "weight_loss", "16.3% protein; anti-inflammatory"),
    ("Vallarai Keerai Thuvaiyal (1 tbsp)", 30, 1.5, 3.0, 1.5, 1.0, "weight_loss", "Cognitive enhancer; antioxidant"),
    ("Thuthuvalai Adai (1 piece)", 145, 5.0, 22.0, 4.0, 3.5, "weight_loss", "Medicinal crepe; respiratory health"),
    ("Vazhaipoo Poriyal (Banana Flower Stir-fry)", 65, 2.0, 10.0, 2.0, 3.0, "weight_loss", "Very low calorie; high fiber"),
    ("Paruppu Keerai (Spinach Dal, 1 cup)", 95, 5.5, 12.0, 2.5, 3.5, "weight_loss", "Iron + potassium; electrolyte balance"),
    ("Drumstick Sambar (1 cup)", 110, 4.5, 14.0, 3.5, 3.0, "weight_loss", "Moringa pods; vitamin A & C rich"),
    ("Kollu Rasam (Horse Gram Soup)", 65, 3.5, 9.0, 1.5, 2.0, "weight_loss", "Traditional weight-loss remedy"),
    ("Vegetable Soup (Tamil style)", 45, 1.5, 7.0, 1.0, 2.0, "weight_loss", "Low calorie; high volume"),
    
    # ========== IV. WEIGHT GAIN ==========
    ("Chicken Biryani (1 plate ~300g)", 400, 18.0, 50.0, 14.0, 1.5, "weight_gain", "Calorie-dense; complete meal"),
    ("Mutton Biryani (1 plate ~300g)", 430, 20.0, 48.0, 17.0, 1.5, "weight_gain", "Higher fat; celebration food"),
    ("Parotta (1 piece)", 220, 4.5, 30.0, 9.5, 1.0, "weight_gain", "Layered flatbread; maida-based"),
    ("Parotta + Salna (Kurma)", 350, 8.0, 38.0, 18.0, 2.0, "weight_gain", "Classic combo; calorie-dense"),
    ("Coconut Rice (1 cup)", 280, 4.0, 42.0, 10.0, 2.5, "weight_gain", "MCTs from coconut; quick energy"),
    ("Ghee Rice (Nei Sadam, 1 cup)", 310, 4.5, 42.0, 13.0, 0.5, "weight_gain", "Ghee provides healthy saturated fats"),
    ("Halwa (Wheat/Carrot, 100g)", 330, 3.0, 45.0, 15.0, 1.5, "weight_gain", "Dense carbs + ghee; festival sweet"),
    ("Banana (Nendran, 1 large)", 120, 1.3, 30.0, 0.4, 2.6, "weight_gain", "Kerala banana; higher calories; pre-workout"),
    ("Groundnut Chikki (50g)", 260, 7.0, 28.0, 14.0, 2.0, "weight_gain", "Peanut brittle; healthy fats + protein"),
    ("Ellu Urundai (Sesame Ball, 2 pieces)", 220, 5.0, 22.0, 13.0, 3.0, "weight_gain", "Sesamin antioxidant; calcium-rich"),
    
    # ========== V. CHEAT MEALS / INDULGENCE ==========
    ("Jigarthanda (1 glass)", 350, 5.0, 52.0, 13.0, 0.5, "cheat", "Madurai special; almond gum + ice cream"),
    ("Murukku (100g)", 458, 6.5, 56.0, 23.0, 2.5, "cheat", "Deep-fried rice flour snack; crunchy"),
    ("Sakkarai Pongal (Sweet Pongal, 1 cup)", 350, 5.0, 55.0, 12.0, 1.0, "cheat", "Jaggery + ghee + cashews; festival"),
    ("Bonda (2 pieces)", 280, 5.0, 32.0, 15.0, 2.0, "cheat", "Deep-fried potato balls"),
    ("Bajji (4 pieces)", 240, 3.5, 28.0, 13.0, 2.0, "cheat", "Battered & fried vegetables"),
    ("Payasam / Kheer (1 cup)", 280, 6.0, 40.0, 10.0, 0.5, "cheat", "Milk-based dessert; festival essential"),
    ("Adhirasam (2 pieces)", 320, 3.0, 50.0, 12.0, 1.0, "cheat", "Traditional jaggery donut; Diwali"),
    ("Mysore Pak (2 pieces, ~60g)", 350, 4.0, 35.0, 22.0, 0.5, "cheat", "Ghee + besan sweet; very calorie-dense"),
    ("Kari Dosai (Mutton Dosa)", 320, 14.0, 30.0, 16.0, 1.0, "cheat", "Madurai street food; crispy + spicy"),
    ("Filter Coffee with Sugar (1 cup)", 90, 2.0, 12.0, 3.5, 0.0, "cheat", "Tamil Nadu's beloved beverage"),
]

# Millet comparison data (per 100g raw)
MILLET_DATA = {
    "Ragi (Finger Millet)":   {"calories": 328, "protein": 7.3, "carbs": 72.0, "fat": 1.3, "fiber": 11.5, "calcium_mg": 344, "iron_mg": 3.9},
    "Kambu (Pearl Millet)":   {"calories": 361, "protein": 11.6, "carbs": 67.5, "fat": 5.0, "fiber": 11.3, "calcium_mg": 42, "iron_mg": 8.0},
    "Thinai (Foxtail Millet)":{"calories": 331, "protein": 12.3, "carbs": 60.9, "fat": 4.3, "fiber": 8.0, "calcium_mg": 31, "iron_mg": 2.8},
    "Varagu (Kodo Millet)":   {"calories": 309, "protein": 8.3, "carbs": 65.9, "fat": 1.4, "fiber": 9.0, "calcium_mg": 27, "iron_mg": 0.5},
    "Samai (Little Millet)":  {"calories": 329, "protein": 7.7, "carbs": 67.0, "fat": 4.7, "fiber": 7.6, "calcium_mg": 17, "iron_mg": 9.3},
    "Kudhiraivali (Barnyard Millet)": {"calories": 307, "protein": 6.2, "carbs": 65.5, "fat": 2.2, "fiber": 9.8, "calcium_mg": 20, "iron_mg": 5.0},
    "Polished Rice (comparison)": {"calories": 356, "protein": 6.8, "carbs": 78.2, "fat": 0.5, "fiber": 0.2, "calcium_mg": 10, "iron_mg": 0.7},
}

# Keerai (Leafy Greens) therapeutic data
KEERAI_DATA = {
    "Murungai Keerai (Moringa)": {"benefit": "Anti-inflammatory, antioxidant", "protein_pct": 16.3, "fiber_pct": 9.8, "key_vitamins": "A, C, E, Iron, Potassium"},
    "Vallarai Keerai (Gotu Kola)": {"benefit": "Cognitive enhancer, memory booster", "protein_pct": 2.0, "fiber_pct": 3.5, "key_vitamins": "B-complex, Iron"},
    "Thuthuvalai (Solanum)": {"benefit": "Respiratory health, anti-asthmatic", "protein_pct": 5.0, "fiber_pct": 4.0, "key_vitamins": "C, Iron, Calcium"},
    "Paruppu Keerai (Amaranth)": {"benefit": "Electrolyte balance, iron-rich", "protein_pct": 4.0, "fiber_pct": 2.5, "key_vitamins": "Potassium, Magnesium, Iron"},
    "Arai Keerai (Amaranthus)": {"benefit": "Blood builder, digestive", "protein_pct": 3.5, "fiber_pct": 2.0, "key_vitamins": "Iron, Calcium, Folic Acid"},
    "Pulicha Keerai (Sour Greens)": {"benefit": "Liver health, cooling", "protein_pct": 2.5, "fiber_pct": 3.0, "key_vitamins": "Vitamin C, Iron"},
}


def get_foods_by_goal(goal: str) -> list:
    """Return foods matching a health goal."""
    goal_lower = goal.lower()
    if "fat loss" in goal_lower or "weight loss" in goal_lower:
        category = "weight_loss"
    elif "muscle" in goal_lower or "protein" in goal_lower:
        category = "high_protein"
    elif "weight gain" in goal_lower or "bulk" in goal_lower:
        category = "weight_gain"
    else:
        category = "balanced"
    
    return [f for f in TN_FOODS if f[6] == category]


def get_foods_by_category(category: str) -> list:
    """Return all foods in a given category."""
    return [f for f in TN_FOODS if f[6] == category]


def format_food_for_prompt(foods: list, limit: int = 10) -> str:
    """Format food items into a structured string for the LLM prompt."""
    lines = []
    for food in foods[:limit]:
        name, cal, prot, carbs, fat, fiber, cat, notes = food
        lines.append(f"- {name}: {cal} kcal | P:{prot}g | C:{carbs}g | F:{fat}g | Fiber:{fiber}g ({notes})")
    return "\n".join(lines)


def get_millet_comparison() -> str:
    """Format millet vs rice comparison for the prompt."""
    lines = ["Millet Nutritional Comparison (per 100g raw):"]
    for name, data in MILLET_DATA.items():
        lines.append(f"  {name}: {data['calories']} kcal | P:{data['protein']}g | Ca:{data['calcium_mg']}mg | Fe:{data['iron_mg']}mg")
    return "\n".join(lines)


def get_keerai_info() -> str:
    """Format leafy greens therapeutic info."""
    lines = ["Tamil Nadu Medicinal Greens (Keerai):"]
    for name, data in KEERAI_DATA.items():
        lines.append(f"  {name}: {data['benefit']} | Key: {data['key_vitamins']}")
    return "\n".join(lines)


def build_tn_knowledge(goal: str) -> str:
    """Build full Tamil Nadu nutritional knowledge block for the LLM prompt."""
    goal_foods = get_foods_by_goal(goal)
    balanced_foods = get_foods_by_category("balanced")
    
    sections = []
    sections.append("=== TAMIL NADU TRADITIONAL FOOD DATABASE (IFCT/NIN Verified) ===\n")
    
    sections.append(f"Goal-Specific Foods ({goal}):")
    sections.append(format_food_for_prompt(goal_foods, 8))
    
    sections.append("\nBalanced Tamil Sappadu Items:")
    sections.append(format_food_for_prompt(balanced_foods, 6))
    
    sections.append("\n" + get_millet_comparison())
    sections.append("\n" + get_keerai_info())
    
    sections.append("\nKey Tamil Diet Principles:")
    sections.append("- Fermented foods (Idli, Dosa): B-vitamin enriched, reduced anti-nutrients, low GI")
    sections.append("- 3:1 Cereal:Pulse ratio for complete protein (e.g., rice + dal)")
    sections.append("- Millets over polished rice for diabetic management and weight loss")
    sections.append("- Coconut oil/milk provides MCTs for quick energy")
    sections.append("- End meals with curd rice for probiotics and cooling")
    
    return "\n".join(sections)
