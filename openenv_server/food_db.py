import json
import os

# Fallback basic DB
FOOD_DB = {
    "F1": {"name": "Idli", "type": "veg", "calories": 39, "protein": 1.2, "sugar": 0, "meal": ["breakfast"]},
    "F2": {"name": "Dosa", "type": "veg", "calories": 133, "protein": 3.4, "sugar": 0, "meal": ["breakfast", "dinner"]},
    "F3": {"name": "Chicken Curry", "type": "non-veg", "calories": 243, "protein": 28, "sugar": 1, "meal": ["lunch", "dinner"]},
    "F4": {"name": "Sambar", "type": "veg", "calories": 110, "protein": 4.5, "sugar": 1, "meal": ["breakfast", "lunch", "dinner"]},
    "F5": {"name": "Rice", "type": "veg", "calories": 205, "protein": 4.3, "sugar": 0.1, "meal": ["lunch", "dinner"]},
    "F11": {"name": "Boiled Egg", "type": "non-veg", "calories": 78, "protein": 6.3, "sugar": 0.6, "meal": ["breakfast", "snack"]}
}

def load_real_data():
    global FOOD_DB
    # Look for the extracted data in the root or local folder
    paths = ["docx_extracted.json", "../docx_extracted.json", "openenv_server/docx_extracted.json"]
    for p in paths:
        if os.path.exists(p):
            try:
                with open(p, "r") as f:
                    data = json.load(f)
                    # Convert the nested list format to the dictionary format expected by the app
                    # The JSON format is {"State": [ ["Food", "Calories", ...], ["Item", "100", ...], ... ]}
                    new_db = {}
                    count = 0
                    for state, items in data.items():
                        if not items: continue
                        header = items[0]
                        for row in items[1:]:
                            if len(row) < 5: continue
                            fid = f"R{count}"
                            try:
                                # Simple heuristic: if name has fruit/veg/paneer it's veg, else non-veg if has chicken/meat/fish/egg
                                name = row[0]
                                f_type = "veg"
                                if any(x in name.lower() for x in ["chicken", "mutton", "fish", "egg", "meat", "biryani", "kabab"]):
                                    f_type = "non-veg"
                                
                                new_db[fid] = {
                                    "name": f"{name} ({state})",
                                    "type": f_type,
                                    "calories": float(row[1]) if row[1].replace('.','',1).isdigit() else 0,
                                    "protein": float(row[2]) if row[2].replace('.','',1).isdigit() else 0,
                                    "sugar": 0, # Not in original dataset
                                    "meal": ["breakfast", "lunch", "dinner"] # Generic
                                }
                                count += 1
                            except:
                                continue
                    if new_db:
                        FOOD_DB.update(new_db)
                        print(f"Loaded {len(new_db)} real food items from dataset.")
                break
            except Exception as e:
                print(f"Error loading JSON data: {e}")

# Try to load on import
load_real_data()
