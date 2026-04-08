"""
HawkAI — Pan-India Food Database (28 States)
Auto-generated from FINAL_28_STATE_DOCX.docx
"""

# State-to-region mapping
STATE_REGIONS = {
    "Tamil Nadu": "South", "Kerala": "South", "Karnataka": "South", "Andhra Pradesh": "South", "Telangana": "South", "Goa": "South",
    "Maharashtra": "West", "Gujarat": "West", "Rajasthan": "West", "Punjab": "North", "Haryana": "North", "Uttar Pradesh": "North",
    "Uttarakhand": "North", "Himachal Pradesh": "North", "Madhya Pradesh": "Central", "Chhattisgarh": "Central", "West Bengal": "East",
    "Odisha": "East", "Bihar": "East", "Jharkhand": "East", "Assam": "Northeast", "Arunachal Pradesh": "Northeast", "Manipur": "Northeast",
    "Meghalaya": "Northeast", "Mizoram": "Northeast", "Nagaland": "Northeast", "Tripura": "Northeast", "Sikkim": "Northeast",
}

CUISINE_STATE_MAP = {
    "South Indian": ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'],
    "North Indian": ['Punjab', 'Haryana', 'Uttar Pradesh', 'Uttarakhand', 'Rajasthan'],
    "Bengali": ['West Bengal'], "Gujarati": ['Gujarat'], "Maharashtrian": ['Maharashtra', 'Goa'],
    "East Indian": ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand'],
    "Northeast Indian": ['Assam', 'Arunachal Pradesh', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim'],
}

FOOD_REGIONAL_MAPPING = {
    "South": ["Idli", "Dosa", "Sambar", "Rasam", "Pongal", "Upma", "Biryani", "Chicken Curry", "Fish Curry", "Paratha", "Roti", "Dal", "Kheer", "Halwa", "Pakora", "Poha", "Lassi"],
    "North": ["Roti", "Paratha", "Pulao", "Dal", "Rajma", "Chole", "Paneer Curry", "Chicken Curry", "Sarson ka Saag", "Makki di Roti", "Lassi", "Kheer", "Halwa", "Pakora", "Biryani"],
    "West": ["Poha", "Pav Bhaji", "Vada Pav", "Dhokla", "Thepla", "Dal Baati", "Gatte ki Sabzi", "Roti", "Paratha", "Dal", "Paneer Curry"],
    "East": ["Mishti Doi", "Fish Curry", "Rice", "Dal", "Biryani", "Roti", "Pulao", "Kheer"],
    "Pan-India": ["Dal", "Roti", "Rice", "Biryani", "Chicken Curry", "Fish Curry", "Paneer Curry", "Chole", "Rajma", "Kheer", "Halwa", "Pakora", "Lassi", "Pulao"]
}

CUISINE_TO_REGION = {
    "South Indian": "South", "North Indian": "North", "Bengali": "East", "Gujarati": "West", "Maharashtrian": "West", "East Indian": "East", "Northeast Indian": "East" 
}

# Condensed Data for all 28 states
INDIA_FOODS = {
    "Tamil Nadu": [("Idli", 323.0, 23.7, 57.8, 10.6, "veg", ['breakfast']), ("Dosa", 232.0, 7.2, 33.7, 18.9, "veg", ['breakfast']), ("Sambar", 306.0, 8.6, 17.3, 14.9, "veg", ['lunch']), ("Biryani", 226.0, 17.0, 18.6, 17.1, "non-veg", ['lunch'])],
    "Kerala": [("Idli", 81.0, 23.4, 21.9, 2.3, "veg", ['breakfast']), ("Dosa", 335.0, 17.6, 48.3, 14.3, "veg", ['breakfast']), ("Biryani", 205.0, 21.7, 56.4, 16.7, "non-veg", ['lunch'])],
    "Karnataka": [("Idli", 233.0, 4.7, 26.7, 14.8, "veg", ['breakfast']), ("Dosa", 321.0, 22.0, 47.5, 4.0, "veg", ['breakfast']), ("Biryani", 237.0, 11.5, 35.4, 4.8, "non-veg", ['lunch'])],
    "Andhra Pradesh": [("Idli", 283.0, 10.7, 43.9, 18.6, "veg", ['breakfast']), ("Biryani", 145.0, 17.0, 12.7, 12.9, "non-veg", ['lunch'])],
    "Telangana": [("Idli", 168.0, 10.7, 20.3, 6.9, "veg", ['breakfast']), ("Biryani", 149.0, 17.6, 12.0, 12.4, "non-veg", ['lunch'])],
    "Maharashtra": [("Pav Bhaji", 349.0, 18.5, 59.1, 13.9, "veg", ['snack']), ("Vada Pav", 306.0, 8.5, 50.0, 10.3, "veg", ['snack'])],
    "Gujarat": [("Dhokla", 285.0, 16.4, 17.7, 2.3, "veg", ['snack']), ("Thepla", 259.0, 19.1, 53.5, 18.9, "veg", ['breakfast'])],
    "Rajasthan": [("Dal Baati", 170.0, 15.0, 34.2, 3.6, "veg", ['lunch']), ("Gatte ki Sabzi", 270.0, 22.4, 11.9, 16.8, "veg", ['lunch'])],
    "Punjab": [("Sarson ka Saag", 317.0, 20.6, 23.7, 11.6, "veg", ['lunch']), ("Makki di Roti", 139.0, 5.5, 57.9, 14.0, "veg", ['breakfast', 'side_dish'])],
    "Haryana": [("Rajma", 272.0, 14.8, 44.6, 16.0, "veg", ['lunch']), ("Chole", 198.0, 18.6, 54.4, 2.8, "veg", ['lunch'])],
    "Uttar Pradesh": [("Paneer Curry", 249.0, 10.7, 22.7, 12.8, "veg", ['lunch']), ("Chicken Curry", 154.0, 14.8, 57.2, 5.6, "non-veg", ['lunch'])],
    "Bihar": [("Litti Chokha", 339.0, 19.1, 35.7, 8.1, "veg", ['lunch'])],
    "Jharkhand": [("Idli", 81.0, 24.3, 53.9, 8.9, "veg", ['breakfast'])],
    "West Bengal": [("Mishti Doi", 189.0, 13.7, 27.1, 13.6, "veg", ['dessert']), ("Fish Curry", 312.0, 6.4, 46.6, 6.1, "non-veg", ['lunch'])],
    "Odisha": [("Pakhala", 256.0, 20.3, 35.8, 6.5, "veg", ['lunch'])],
    "Chhattisgarh": [("Poha", 229.0, 19.9, 14.0, 6.0, "veg", ['breakfast'])],
    "Madhya Pradesh": [("Poha", 136.0, 14.5, 11.5, 16.3, "veg", ['breakfast'])],
    "Goa": [("Fish Curry", 191.0, 10.5, 51.7, 17.1, "non-veg", ['lunch'])],
    "Assam": [("Pitha", 203.0, 15.3, 33.3, 15.2, "veg", ['breakfast'])],
    "Arunachal Pradesh": [("Thukpa", 251.0, 14.9, 10.4, 4.3, "veg", ['lunch'])],
    "Manipur": [("Eromba", 85.0, 7.7, 38.3, 9.1, "non-veg", ['lunch'])],
    "Meghalaya": [("Jadoh", 349.0, 15.0, 42.5, 7.8, "non-veg", ['lunch'])],
    "Mizoram": [("Bai", 241.0, 13.3, 50.3, 10.1, "veg", ['lunch'])],
    "Nagaland": [("Smoked Pork", 146.0, 23.5, 49.1, 19.3, "non-veg", ['lunch'])],
    "Tripura": [("Mui Borok", 97.0, 4.3, 10.1, 4.8, "non-veg", ['lunch'])],
    "Sikkim": [("Momo", 158.0, 12.0, 11.0, 19.7, "non-veg", ['lunch'])],
    "Uttarakhand": [("Kafuli", 218.0, 12.3, 59.3, 2.2, "veg", ['lunch'])],
    "Himachal Pradesh": [("Dham", 238.0, 12.4, 15.3, 5.3, "veg", ['lunch'])],
}

def get_all_states(): return list(INDIA_FOODS.keys())
def get_foods_by_state(state): return INDIA_FOODS.get(state, [])
def get_states_for_cuisine(cuisine):
    c = cuisine.lower()
    for k, v in CUISINE_STATE_MAP.items():
        if k.lower() == c: return v
    return CUISINE_STATE_MAP["South Indian"]

def normalize_state_name(state_input):
    if not state_input: return None
    clean = "".join(state_input.split()).lower()
    for official in INDIA_FOODS.keys():
        if clean == "".join(official.split()).lower(): return official
    return None

def get_foods_for_cuisine(cuisine, diet_type=None, meal_slot=None):
    states = get_states_for_cuisine(cuisine)
    foods, seen = [], set()
    for state in states:
        for food in INDIA_FOODS.get(state, []):
            if food[0] in seen: continue
            seen.add(food[0])
            if diet_type and "veg" in diet_type.lower() and "non" not in diet_type.lower() and food[5] == "non-veg": continue
            foods.append(food)
    return foods

def build_multi_state_menu(cuisine_pref="South Indian", diet_type="Vegetarian", limit=30, specific_state=None):
    state = normalize_state_name(specific_state)
    states = [state] if state else get_states_for_cuisine(cuisine_pref)
    region = CUISINE_TO_REGION.get(cuisine_pref, "South")
    allowed = FOOD_REGIONAL_MAPPING.get(region, FOOD_REGIONAL_MAPPING["Pan-India"])
    
    all_foods = []
    for s in states:
        for f in INDIA_FOODS.get(s, []):
            if diet_type == "Vegetarian" and f[5] == "non-veg": continue
            all_foods.append(f)

    if not all_foods: return "No foods found."
    
    lines = [f"### {state or cuisine_pref} Food Menu", ""]
    for f in all_foods[:limit]:
        lines.append(f"- {f[0]}: {f[1]} kcal | P:{f[2]}g C:{f[3]}g F:{f[4]}g")
    return "\n".join(lines)
