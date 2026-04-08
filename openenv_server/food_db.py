import json
import os
import sys

# Fallback basic DB
FOOD_DB = {
    "R1": {"name": "Basic Idli", "type": "veg", "calories": 39, "protein": 1.2, "sugar": 0, "meal": ["breakfast"]},
    "R5": {"name": "Basic Rice", "type": "veg", "calories": 205, "protein": 4.3, "sugar": 0, "meal": ["lunch", "dinner"]},
    "R8": {"name": "Basic Dal", "type": "veg", "calories": 110, "protein": 4.5, "sugar": 0, "meal": ["lunch"]},
    "R10": {"name": "Basic Roti", "type": "veg", "calories": 100, "protein": 3, "sugar": 0, "meal": ["dinner"]},
    "R12": {"name": "Basic Salad", "type": "veg", "calories": 50, "protein": 1, "sugar": 0, "meal": ["dinner"]}
}

def load_real_data():
    global FOOD_DB
    print(f"DEBUG: Current working directory: {os.getcwd()}")
    print(f"DEBUG: Files in root: {os.listdir('.')}")
    
    # Look for the extracted data in the root or local folder
    paths = [
        "docx_extracted.json", 
        "/app/docx_extracted.json",
        "openenv_server/docx_extracted.json",
        "../docx_extracted.json"
    ]
    
    found = False
    for p in paths:
        if os.path.exists(p):
            print(f"DEBUG: Found dataset at: {p}")
            try:
                with open(p, "r") as f:
                    data = json.load(f)
                    new_db = {}
                    count = 0
                    for state, items in data.items():
                        if not items: continue
                        for row in items[1:]:
                            if len(row) < 5: continue
                            fid = f"R{count}"
                            try:
                                name = row[0]
                                f_type = "veg"
                                if any(x in name.lower() for x in ["chicken", "mutton", "fish", "egg", "meat", "biryani", "kabab"]):
                                    f_type = "non-veg"
                                
                                new_db[fid] = {
                                    "name": f"{name} ({state})",
                                    "type": f_type,
                                    "calories": float(row[1]) if str(row[1]).replace('.','',1).isdigit() else 0,
                                    "protein": float(row[2]) if str(row[2]).replace('.','',1).isdigit() else 0,
                                    "sugar": 0,
                                    "meal": ["breakfast", "lunch", "dinner"]
                                }
                                count += 1
                            except:
                                continue
                    if new_db:
                        FOOD_DB = new_db
                        print(f"SUCCESS: Loaded {len(FOOD_DB)} real food items.")
                        found = True
                break
            except Exception as e:
                print(f"ERROR: Loading JSON data from {p} failed: {e}")
    
    if not found:
        print("WARNING: Using minimal fallback food database.")

# Load immediately
load_real_data()
