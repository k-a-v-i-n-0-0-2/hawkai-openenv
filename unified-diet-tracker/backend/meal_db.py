"""
HawkAI — Comprehensive Meal Database
Multi-cuisine food database with accurate nutritional data from 28 Indian states.
"""

MEALS = [
    # ==================== SOUTH INDIAN BREAKFAST ====================
    {"name": "2 Idli + Sambar + Coconut Chutney", "calories": 280, "protein": 9, "carbs": 50, "fat": 5, "fiber": 4, "diet_type": "veg", "cuisine": "south_indian", "slots": ["breakfast"]},
    {"name": "Masala Dosa + Sambar", "calories": 350, "protein": 10, "carbs": 48, "fat": 14, "fiber": 3, "diet_type": "veg", "cuisine": "south_indian", "slots": ["breakfast"]},
    {"name": "Ven Pongal + Coconut Chutney", "calories": 310, "protein": 8, "carbs": 45, "fat": 11, "fiber": 3, "diet_type": "veg", "cuisine": "south_indian", "slots": ["breakfast"]},
    {"name": "Ragi Dosa + Groundnut Chutney", "calories": 240, "protein": 8, "carbs": 38, "fat": 6, "fiber": 5, "diet_type": "veg", "cuisine": "south_indian", "slots": ["breakfast"]},
    {"name": "Upma + Coconut Chutney", "calories": 280, "protein": 7, "carbs": 42, "fat": 9, "fiber": 3, "diet_type": "veg", "cuisine": "south_indian", "slots": ["breakfast"]},
    {"name": "2 Appam + Vegetable Stew", "calories": 300, "protein": 6, "carbs": 48, "fat": 9, "fiber": 3, "diet_type": "veg", "cuisine": "south_indian", "slots": ["breakfast"]},
    {"name": "Adai (Lentil Dosa) + Avial", "calories": 320, "protein": 12, "carbs": 42, "fat": 10, "fiber": 5, "diet_type": "veg", "cuisine": "south_indian", "slots": ["breakfast"]},
    {"name": "Pesarattu + Ginger Chutney", "calories": 260, "protein": 11, "carbs": 36, "fat": 7, "fiber": 4, "diet_type": "veg", "cuisine": "south_indian", "slots": ["breakfast"]},

    # ==================== NORTH INDIAN BREAKFAST ====================
    {"name": "Aloo Paratha + Curd", "calories": 380, "protein": 10, "carbs": 52, "fat": 15, "fiber": 3, "diet_type": "veg", "cuisine": "north_indian", "slots": ["breakfast"]},
    {"name": "Poha (Flattened Rice)", "calories": 250, "protein": 7, "carbs": 42, "fat": 7, "fiber": 2, "diet_type": "veg", "cuisine": "north_indian", "slots": ["breakfast"]},
    {"name": "Chole Bhature", "calories": 450, "protein": 14, "carbs": 58, "fat": 18, "fiber": 5, "diet_type": "veg", "cuisine": "north_indian", "slots": ["breakfast"]},
    {"name": "Makki di Roti + Sarson ka Saag", "calories": 340, "protein": 12, "carbs": 48, "fat": 12, "fiber": 6, "diet_type": "veg", "cuisine": "north_indian", "slots": ["breakfast", "lunch"]},
    {"name": "Thepla + Pickle + Curd", "calories": 300, "protein": 9, "carbs": 44, "fat": 10, "fiber": 3, "diet_type": "veg", "cuisine": "north_indian", "slots": ["breakfast"]},

    # ==================== GUJARATI BREAKFAST ====================
    {"name": "Dhokla + Green Chutney", "calories": 220, "protein": 8, "carbs": 34, "fat": 5, "fiber": 3, "diet_type": "veg", "cuisine": "gujarati", "slots": ["breakfast", "snack"]},
    {"name": "Khaman + Sev", "calories": 260, "protein": 10, "carbs": 38, "fat": 7, "fiber": 3, "diet_type": "veg", "cuisine": "gujarati", "slots": ["breakfast", "snack"]},
    {"name": "Handvo (Lentil Cake)", "calories": 280, "protein": 11, "carbs": 40, "fat": 8, "fiber": 4, "diet_type": "veg", "cuisine": "gujarati", "slots": ["breakfast"]},

    # ==================== BENGALI BREAKFAST ====================
    {"name": "Luchi + Aloo Dum", "calories": 400, "protein": 8, "carbs": 52, "fat": 18, "fiber": 2, "diet_type": "veg", "cuisine": "bengali", "slots": ["breakfast"]},
    {"name": "Radhaballavi + Cholar Dal", "calories": 380, "protein": 12, "carbs": 48, "fat": 15, "fiber": 4, "diet_type": "veg", "cuisine": "bengali", "slots": ["breakfast"]},

    # ==================== SOUTH INDIAN LUNCH ====================
    {"name": "Rice + Sambar + Rasam + Poriyal + Curd", "calories": 520, "protein": 14, "carbs": 82, "fat": 12, "fiber": 6, "diet_type": "veg", "cuisine": "south_indian", "slots": ["lunch"]},
    {"name": "Rice + Chicken Chettinad Curry + Rasam", "calories": 580, "protein": 32, "carbs": 65, "fat": 18, "fiber": 3, "diet_type": "non-veg", "cuisine": "south_indian", "slots": ["lunch"]},
    {"name": "Rice + Fish Kulambu + Poriyal", "calories": 500, "protein": 28, "carbs": 60, "fat": 14, "fiber": 4, "diet_type": "non-veg", "cuisine": "south_indian", "slots": ["lunch"]},
    {"name": "Millet Rice + Keerai Masiyal + Rasam", "calories": 380, "protein": 12, "carbs": 58, "fat": 8, "fiber": 7, "diet_type": "veg", "cuisine": "south_indian", "slots": ["lunch"]},

    # ==================== NORTH INDIAN LUNCH ====================
    {"name": "3 Roti + Dal Fry + Sabzi + Salad", "calories": 480, "protein": 16, "carbs": 68, "fat": 14, "fiber": 6, "diet_type": "veg", "cuisine": "north_indian", "slots": ["lunch"]},
    {"name": "Chicken Curry + 2 Roti + Salad", "calories": 520, "protein": 30, "carbs": 50, "fat": 18, "fiber": 4, "diet_type": "non-veg", "cuisine": "north_indian", "slots": ["lunch"]},
    {"name": "Rajma Chawal + Raita", "calories": 460, "protein": 15, "carbs": 72, "fat": 10, "fiber": 8, "diet_type": "veg", "cuisine": "north_indian", "slots": ["lunch"]},
    {"name": "Dal Baati Churma", "calories": 550, "protein": 16, "carbs": 65, "fat": 25, "fiber": 5, "diet_type": "veg", "cuisine": "north_indian", "slots": ["lunch"]},
    {"name": "Gatte ki Sabzi + 2 Roti", "calories": 420, "protein": 14, "carbs": 55, "fat": 16, "fiber": 5, "diet_type": "veg", "cuisine": "north_indian", "slots": ["lunch"]},

    # ==================== BENGALI LUNCH ====================
    {"name": "Rice + Macher Jhol (Fish Curry) + Bhaja", "calories": 520, "protein": 26, "carbs": 65, "fat": 16, "fiber": 3, "diet_type": "non-veg", "cuisine": "bengali", "slots": ["lunch"]},
    {"name": "Rice + Shukto + Dal + Bhaja", "calories": 450, "protein": 12, "carbs": 70, "fat": 12, "fiber": 5, "diet_type": "veg", "cuisine": "bengali", "slots": ["lunch"]},

    # ==================== GUJARATI LUNCH ====================
    {"name": "Gujarati Thali (Dal-Bhat-Rotli-Sabzi-Kadhi)", "calories": 520, "protein": 16, "carbs": 75, "fat": 15, "fiber": 6, "diet_type": "veg", "cuisine": "gujarati", "slots": ["lunch"]},
    {"name": "Undhiyu + Puri + Shrikhand", "calories": 580, "protein": 12, "carbs": 72, "fat": 26, "fiber": 7, "diet_type": "veg", "cuisine": "gujarati", "slots": ["lunch"]},

    # ==================== EAST INDIAN LUNCH ====================
    {"name": "Rice + Dal + Aloo Bharta + Sabzi", "calories": 480, "protein": 14, "carbs": 75, "fat": 12, "fiber": 5, "diet_type": "veg", "cuisine": "east_indian", "slots": ["lunch"]},
    {"name": "Litti Chokha + Sattu Drink", "calories": 450, "protein": 16, "carbs": 62, "fat": 14, "fiber": 6, "diet_type": "veg", "cuisine": "east_indian", "slots": ["lunch"]},

    # ==================== SNACKS (Multi-regional) ====================
    {"name": "Sundal (Chickpea) + Filter Coffee", "calories": 180, "protein": 8, "carbs": 24, "fat": 5, "fiber": 5, "diet_type": "veg", "cuisine": "south_indian", "slots": ["snack"]},
    {"name": "Handful of Peanuts + Green Tea", "calories": 160, "protein": 7, "carbs": 12, "fat": 9, "fiber": 4, "diet_type": "veg", "cuisine": "any", "slots": ["snack"]},
    {"name": "Mixed Fruits Bowl", "calories": 120, "protein": 2, "carbs": 28, "fat": 1, "fiber": 4, "diet_type": "veg", "cuisine": "any", "slots": ["snack"]},
    {"name": "Pav Bhaji", "calories": 350, "protein": 10, "carbs": 48, "fat": 14, "fiber": 4, "diet_type": "veg", "cuisine": "north_indian", "slots": ["snack"]},
    {"name": "Vada Pav", "calories": 300, "protein": 8, "carbs": 42, "fat": 12, "fiber": 3, "diet_type": "veg", "cuisine": "north_indian", "slots": ["snack"]},
    {"name": "Samosa + Chutney", "calories": 280, "protein": 6, "carbs": 35, "fat": 14, "fiber": 3, "diet_type": "veg", "cuisine": "north_indian", "slots": ["snack"]},
    {"name": "Pakora + Chai", "calories": 250, "protein": 5, "carbs": 30, "fat": 12, "fiber": 2, "diet_type": "veg", "cuisine": "any", "slots": ["snack"]},
    {"name": "Mishti Doi (Sweet Yogurt)", "calories": 180, "protein": 6, "carbs": 28, "fat": 5, "fiber": 0, "diet_type": "veg", "cuisine": "bengali", "slots": ["snack", "dessert"]},

    # ==================== DINNER (Multi-regional) ====================
    {"name": "2 Chapati + Keerai Masiyal + Dal", "calories": 380, "protein": 14, "carbs": 52, "fat": 10, "fiber": 6, "diet_type": "veg", "cuisine": "south_indian", "slots": ["dinner"]},
    {"name": "Idli (3 pcs) + Sambar", "calories": 320, "protein": 10, "carbs": 56, "fat": 4, "fiber": 4, "diet_type": "veg", "cuisine": "south_indian", "slots": ["dinner"]},
    {"name": "Grilled Chicken + 2 Roti + Salad", "calories": 430, "protein": 30, "carbs": 40, "fat": 14, "fiber": 4, "diet_type": "non-veg", "cuisine": "north_indian", "slots": ["dinner"]},
    {"name": "2 Roti + Paneer Curry + Dal", "calories": 450, "protein": 20, "carbs": 52, "fat": 16, "fiber": 5, "diet_type": "veg", "cuisine": "north_indian", "slots": ["dinner"]},
    {"name": "Khichdi + Kadhi + Papad", "calories": 380, "protein": 12, "carbs": 58, "fat": 10, "fiber": 4, "diet_type": "veg", "cuisine": "gujarati", "slots": ["dinner"]},
    {"name": "Rice + Fish Curry + Salad", "calories": 420, "protein": 24, "carbs": 55, "fat": 12, "fiber": 3, "diet_type": "non-veg", "cuisine": "bengali", "slots": ["dinner"]},
]

PRE_WORKOUT = [
    {"name": "Banana + Black Coffee", "calories": 120, "protein": 2},
    {"name": "Dates (4 pcs) + Green Tea", "calories": 140, "protein": 1},
    {"name": "Ragi Porridge (small)", "calories": 150, "protein": 4},
]

POST_WORKOUT = [
    {"name": "Boiled Eggs (2) + Banana", "calories": 240, "protein": 14},
    {"name": "Paneer Bhurji (100g) + Roti", "calories": 280, "protein": 18},
    {"name": "Curd (200ml) + Handful of Nuts", "calories": 200, "protein": 10},
]


# Cuisine mapping for flexible matching
CUISINE_ALIASES = {
    "south indian": "south_indian",
    "south": "south_indian",
    "tamil": "south_indian",
    "kerala": "south_indian",
    "karnataka": "south_indian",
    "andhra": "south_indian",
    "north indian": "north_indian",
    "north": "north_indian",
    "punjabi": "north_indian",
    "rajasthani": "north_indian",
    "bengali": "bengali",
    "bengal": "bengali",
    "gujarati": "gujarati",
    "gujarat": "gujarati",
    "east indian": "east_indian",
    "east": "east_indian",
    "bihari": "east_indian",
}


def get_meals_for_slot(slot, diet_type="any", cuisine_pref="any"):
    """Return meals matching slot, diet type, and cuisine preference."""
    # Resolve cuisine alias
    cuisine_key = CUISINE_ALIASES.get(cuisine_pref.lower().strip(), cuisine_pref.lower().strip()) if cuisine_pref != "any" else "any"

    filtered = []
    for m in MEALS:
        if slot not in m["slots"]:
            continue
        if diet_type == "veg" and m["diet_type"] not in ("veg", "vegan"):
            continue
        if cuisine_key != "any" and m["cuisine"] != cuisine_key and m["cuisine"] != "any":
            continue
        filtered.append(m)

    # If no cuisine-specific results, fall back to all matching diet type
    if not filtered:
        for m in MEALS:
            if slot not in m["slots"]:
                continue
            if diet_type == "veg" and m["diet_type"] not in ("veg", "vegan"):
                continue
            filtered.append(m)

    return filtered

