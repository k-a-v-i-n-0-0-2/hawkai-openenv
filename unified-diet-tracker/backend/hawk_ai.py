import requests
import json
import math
import sys
import sqlite3
import os
import tn_foods
from colorama import Fore, Style, init

# Initialize colorama
init(autoreset=True)

# Constants
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:3b"
DB_PATH = r"C:\Users\profe\OneDrive\Desktop\HawkAI\hawk_diet.db"

def calculate_bmi(weight, height_cm):
    height_m = height_cm / 100
    return round(weight / (height_m ** 2), 1)

def calculate_bmr(weight, height_cm, age, gender):
    if gender.lower() == "male":
        bmr = 10 * weight + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height_cm - 5 * age - 161
    return round(bmr)

def calculate_tdee(bmr, activity_level):
    multipliers = {
        "1": 1.2,    # Sedentary
        "2": 1.375,  # Lightly Active
        "3": 1.55,   # Moderately Active
        "4": 1.725,  # Very Active
    }
    multiplier = multipliers.get(activity_level, 1.2)
    return round(bmr * multiplier)

def get_input(prompt, type_func=str, default=None):
    while True:
        try:
            val = input(Fore.CYAN + prompt + Style.RESET_ALL)
            if not val and default is not None:
                return default
            return type_func(val)
        except ValueError:
            print(Fore.RED + "Invalid input. Please try again.")

def search_food(query, limit=5):
    if not os.path.exists(DB_PATH):
        return []
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Simple search for foods containing the query
    search_query = f"%{query}%"
    cursor.execute("""
        SELECT f.fdc_id, f.description, n.name, fn.amount, n.unit_name
        FROM food f
        JOIN food_nutrient fn ON f.fdc_id = fn.fdc_id
        JOIN nutrient n ON fn.nutrient_id = n.nutrient_id
        WHERE f.description LIKE ?
        LIMIT ?
    """, (search_query, limit * 4)) # *4 because we have 4 nutrients per food
    
    results = cursor.fetchall()
    conn.close()
    
    # Group results by food
    foods = {}
    for fdc_id, description, nut_name, amount, unit in results:
        if fdc_id not in foods:
            foods[fdc_id] = {"description": description, "nutrients": []}
        foods[fdc_id]["nutrients"].append(f"{nut_name}: {amount}{unit}")
    
    return list(foods.values())[:limit]

def main():
    print("="*40)
    print("      HawkAI - Diet Plan Generator")
    print("="*40)
    
    # 1. Body metrics
    age = get_input("Enter your age: ", int)
    gender = get_input("Enter your gender (Male/Female): ")
    height = get_input("Enter your height (cm): ", float)
    weight = get_input("Enter your weight (kg): ", float)
    body_fat = get_input("Enter body fat % (optional, press Enter to skip): ", str, "Not provided")
    waist = get_input("Enter waist size (inches) (optional, press Enter to skip): ", str, "Not provided")

    # 2. Goals
    print("\nSelect Primary Goal:")
    print("1. Fat Loss")
    print("2. Muscle Gain")
    print("3. Maintenance")
    print("4. Body Recomposition")
    goal_map = {"1": "Fat Loss", "2": "Muscle Gain", "3": "Maintenance", "4": "Body Recomposition"}
    goal_choice = get_input("Choice (1-4): ", str, "3")
    goal = goal_map.get(goal_choice, "Maintenance")
    target_weight = get_input("Target weight (kg) (optional, press Enter to skip): ", str, "Not provided")

    # 3. Workout
    workout_days = get_input("Workout days per week (0-7): ", int)
    workout_type = get_input("Workout type (e.g., Strength, Cardio, HIIT): ")
    workout_duration = get_input("Workout duration per session (e.g., 60 mins): ")
    print("\nExperience Level:")
    print("1. Beginner\n2. Intermediate\n3. Advanced")
    exp_map = {"1": "Beginner", "2": "Intermediate", "3": "Advanced"}
    exp_choice = get_input("Choice (1-3): ", str, "1")
    experience = exp_map.get(exp_choice, "Beginner")

    # 4. Lifestyle
    print("\nDaily Activity Level:")
    print("1. Sedentary (minimal movement)")
    print("2. Lightly Active (light exercise/standing)")
    print("3. Moderately Active (regular exercise)")
    print("4. Very Active (intense daily training)")
    activity_level = get_input("Choice (1-4): ", str, "1")
    sleep_hours = get_input("Sleep hours per night: ", int)
    print("\nStress Level:\n1. Low\n2. Medium\n3. High")
    stress_map = {"1": "Low", "2": "Medium", "3": "High"}
    stress_choice = get_input("Choice (1-3): ", str, "2")
    stress_level = stress_map.get(stress_choice, "Medium")

    # 5. Diet Preferences
    print("\nDiet Type:\n1. Vegetarian\n2. Non-Vegetarian\n3. Vegan")
    diet_map = {"1": "Vegetarian", "2": "Non-Vegetarian", "3": "Vegan"}
    diet_choice = get_input("Choice (1-3): ", str, "1")
    diet_type = diet_map.get(diet_choice, "Vegetarian")
    allergies = get_input("Food allergies (optional, press Enter to skip): ", str, "None")
    disliked_foods = get_input("Foods you dislike (optional, press Enter to skip): ", str, "None")
    cuisine = get_input("Cuisine preference (e.g., Indian, North Indian): ", str, "Indian")

    # 6. Health & Meals
    health_conditions = get_input("Existing health conditions (e.g., Diabetes, None): ", str, "None")
    meals_per_day = get_input("Meals per day (e.g., 5): ", int, 5)
    fasting = get_input("Intermittent fasting (e.g., No, 16:8): ", str, "No")

    # 7. Accuracy Boost (Search for preferred foods)
    print(Fore.YELLOW + "\n[Accuracy Boost] Verifying nutrition data for preferred ingredients...")
    food_knowledge = []
    preferred_keywords = cuisine.split(',') + ["lentils", "rice", "chicken", "paneer", "wheat"]
    for keyword in preferred_keywords[:3]: # Limit to 3 searches for speed
        matches = search_food(keyword.strip(), limit=2)
        for match in matches:
            food_knowledge.append(f"Food: {match['description']} | Nutrients: {', '.join(match['nutrients'])}")
    
    knowledge_context = "\n".join(food_knowledge) if food_knowledge else "No specific dataset matches found for preferred foods."

    # 8. South Indian / Tamil Boost
    tn_boost = ""
    if "south indian" in cuisine.lower() or "tamil" in cuisine.lower():
        print(Fore.GREEN + "\n[South Indian Boost] Integrating regional Tamil Nadu diet data...")
        tn_boost = tn_foods.build_tn_knowledge(goal)

    # Calculations
    bmi = calculate_bmi(weight, height)
    bmr = calculate_bmr(weight, height, age, gender)
    tdee = calculate_tdee(bmr, activity_level)
    
    # Goal-based calorie adjustment (Rule 7)
    if "fat loss" in goal.lower():
        rec_cal = tdee - 500
        strategy = "Calorie Deficit (TDEE - 500)"
        protein_mult = 1.6
    elif "muscle gain" in goal.lower():
        rec_cal = tdee + 300
        strategy = "Calorie Surplus (TDEE + 300)"
        protein_mult = 2.0
    elif "recomposition" in goal.lower():
        rec_cal = tdee
        strategy = "Maintenance (Body Recomposition)"
        protein_mult = 1.8
    else:
        rec_cal = tdee
        strategy = "Maintenance"
        protein_mult = 1.2

    # Goal-based protein target (Rule 6)
    protein_target = round(weight * protein_mult)

    # Build Prompt with ALL 10 claude1.md rules
    prompt = f"""You are an expert certified nutritionist, dietician, and fitness coach.

Generate a personalized diet plan following these STRICT RULES:

--- USER DATA ---
Age: {age}, Gender: {gender}, Height: {height}cm, Weight: {weight}kg
Body Fat: {body_fat}, Waist: {waist}
Goal: {goal}, Target Weight: {target_weight}
Workout: {workout_days} days/week ({workout_type}), {workout_duration}, {experience} level
Lifestyle: Activity level {activity_level}, Sleep: {sleep_hours}h, Stress: {stress_level}
Diet: {diet_type}, Allergies: {allergies}, Disliked: {disliked_foods}, Cuisine: {cuisine}
Health: {health_conditions}, Meals/Day: {meals_per_day}, Fasting: {fasting}

--- CALCULATED METRICS ---
BMI: {bmi}
BMR: {bmr} kcal/day
TDEE: {tdee} kcal/day
Calorie Strategy: {strategy}
Recommended Daily Calories: {rec_cal} kcal
Protein Target: {protein_target}g/day ({protein_mult}g per kg body weight)

--- SCIENTIFIC REFERENCE DATA (from USDA FoodData Central) ---
{knowledge_context}

--- CALORIE REFERENCE VALUES (use these for accuracy) ---
1 Idli = 58 kcal
1 Dosa = 133 kcal
100g Cooked Rice = 130 kcal
1 Egg = 155 kcal
100g Chicken Breast = 165 kcal
1 Banana = 89 kcal
1 cup Sambar = 130 kcal
1 cup Rasam = 55 kcal
1 cup Curd Rice = 207 kcal
100g Paneer = 265 kcal

--- STRICT RULES (YOU MUST FOLLOW ALL) ---

RULE 1 - REAL FOOD NAMES ONLY:
Never use vague terms like "healthy breakfast", "protein meal", or "balanced lunch".
Always use actual food names with portions. Example: "2 Idli + 1 cup Sambar + 1 tsp Coconut Chutney"

RULE 2 - PREFER SOUTH INDIAN FOODS:
If cuisine is South Indian, Tamil, or Indian, prioritize:
Breakfast: Idli, Dosa, Ragi Dosa, Upma, Pongal, Appam, Puttu, Ragi Porridge
Lunch: Rice + Sambar, Rasam + Rice, Curd Rice, Lemon Rice, Tamarind Rice, Kootu, Poriyal
Dinner: Chapati, Ragi Mudde, Vegetable Curry, Paneer/Chicken/Egg Curry
Snacks: Sundal, Boiled peanuts, Fruit, Buttermilk
Avoid Western-only foods unless specifically requested.

RULE 3 - CALORIE ACCURACY:
Use the reference values provided above. If not available, estimate conservatively. Never output unrealistic values.

RULE 4 - MEAL STRUCTURE:
Generate exactly {meals_per_day} meals. Default 5-meal structure:
Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner.
Each meal MUST include: food name, portion size, calories, and protein.

RULE 5 - NUTRITION BALANCE:
Include balanced macronutrients in every plan:
Protein: Eggs, Chicken, Fish, Paneer, Lentils, Chickpeas, Tofu
Carbs: Rice, Ragi, Wheat, Millets
Fats: Nuts, Seeds, Coconut, Ghee (moderate)

RULE 6 - PROTEIN TARGET:
Daily protein target is {protein_target}g. Distribute across all meals.

RULE 7 - CALORIE PIPELINE:
Daily calorie target is {rec_cal} kcal. Each meal's calories must add up close to this total.

RULE 8 - HYDRATION:
Include hydration recommendations (2.5-3 liters water, buttermilk, coconut water).

RULE 9 - WORKOUT NUTRITION:
Include Pre-Workout meal suggestion (e.g., Banana + black coffee).
Include Post-Workout recovery meal (e.g., Boiled eggs + fruit).

RULE 10 - NO HALLUCINATED FOODS:
Only use foods from the dataset, the reference values above, or common Indian cuisine. Do NOT invent foods.

--- REQUIRED OUTPUT FORMAT (follow exactly) ---

BMI: [value]
BMR: [value] kcal
TDEE: [value] kcal

Daily Calories Target: [value] kcal
Protein Target: [value]g

Diet Plan
---------
Breakfast
[Food items with portions + calories + protein]
Total: [X] kcal

Mid-Morning Snack
[Food items with portions + calories + protein]
Total: [X] kcal

Lunch
[Food items with portions + calories + protein]
Total: [X] kcal

Evening Snack
[Food items with portions + calories + protein]
Total: [X] kcal

Dinner
[Food items with portions + calories + protein]
Total: [X] kcal

Daily Total: [X] kcal | Protein: [X]g

Hydration Tips
[recommendations]

Workout Nutrition Advice
Pre-Workout: [suggestion]
Post-Workout: [suggestion]

Lifestyle Advice
[tips based on user's goal, sleep, stress]

Health Disclaimer
[standard medical disclaimer]"""

    if tn_boost:
        prompt += f"\n\n--- TAMIL NADU SPECIFIC FOOD DATA (IFCT/NIN Verified) ---\n{tn_boost}\nUse these Tamil Nadu foods in the diet plan when cuisine is South Indian or Tamil."

    print("\n" + "="*45)
    print("   HawkAI — Generating Your Diet Plan")
    print("="*45)
    print(f"  BMI:           {bmi}")
    print(f"  BMR:           {bmr} kcal/day")
    print(f"  TDEE:          {tdee} kcal/day")
    print(f"  Strategy:      {strategy}")
    print(f"  Daily Target:  {rec_cal} kcal")
    print(f"  Protein:       {protein_target}g/day ({protein_mult}g/kg)")
    if tn_boost:
        print(f"  Region Boost:  Tamil Nadu foods included")
    print("="*45)
    print("\nPlease wait, this may take a minute...\n")

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=300
        )
        response.raise_for_status()
        diet_plan = response.json().get("response", "Error: No response from model.")
        print(Fore.GREEN + diet_plan)
    except requests.exceptions.Timeout:
        print(Fore.RED + "Error: Request timed out. The model is taking too long.")
        print("Try running with a smaller model or check system resources.")
    except requests.exceptions.ConnectionError:
        print(Fore.RED + "Error: Cannot connect to Ollama.")
        print("Make sure Ollama is running: ollama serve")
        print(f"And model '{OLLAMA_MODEL}' is pulled: ollama pull {OLLAMA_MODEL}")
    except Exception as e:
        print(Fore.RED + f"Error: {e}")

if __name__ == "__main__":
    main()
