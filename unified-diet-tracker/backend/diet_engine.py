"""
HawkAI — Instant Diet Engine
Generates personalized diet plans in < 1 second.
"""

import random
from meal_db import get_meals_for_slot, PRE_WORKOUT, POST_WORKOUT

def calculate_bmi(weight, height_cm):
    return round(weight / ((height_cm / 100) ** 2), 1)

def calculate_bmr(weight, height_cm, age, gender):
    if gender.lower() == "male":
        return round(10 * weight + 6.25 * height_cm - 5 * age + 5)
    return round(10 * weight + 6.25 * height_cm - 5 * age - 161)

def generate_plan(data):
    weight = float(data.get("weight", 70))
    height = float(data.get("height", 170))
    age = int(data.get("age", 25))
    gender = data.get("gender", "Male")
    goal = data.get("goal", "Maintenance")
    
    bmi = calculate_bmi(weight, height)
    bmr = calculate_bmr(weight, height, age, gender)
    tdee = round(bmr * 1.55) # Moderately active default
    
    rec_cal = tdee - 500 if "loss" in goal.lower() else (tdee + 300 if "gain" in goal.lower() else tdee)
    protein_target = round(weight * (1.8 if "loss" in goal.lower() or "gain" in goal.lower() else 1.2))

    diet_type = "veg" if "veg" in data.get("diet_type", "").lower() else "any"

    meals = []
    slots = [("Breakfast", "breakfast"), ("Lunch", "lunch"), ("Evening Snack", "snack"), ("Dinner", "dinner")]
    
    total_cal = 0
    total_protein = 0

    for name, slot in slots:
        candidates = get_meals_for_slot(slot, diet_type)
        meal = random.choice(candidates) if candidates else {"name": "Healthy Option", "calories": 300, "protein": 10}
        meals.append({
            "time": name,
            "food": meal["name"],
            "calories": meal["calories"],
            "protein": meal["protein"]
        })
        total_cal += meal["calories"]
        total_protein += meal["protein"]

    return {
        "metrics": {
            "bmi": bmi, "bmr": bmr, "tdee": tdee,
            "recommended_calories": rec_cal, "protein_target": protein_target
        },
        "macros": {
            "protein": protein_target, "carbs": round(rec_cal * 0.5 / 4), "fat": round(rec_cal * 0.25 / 9), "fiber": 30
        },
        "meals": meals,
        "advice": {
            "hydration": "Drink 3 liters of water daily.",
            "lifestyle": "Maintain consistent sleep schedule (7-8 hours).",
            "pre_workout": f"{random.choice(PRE_WORKOUT)['name']} before workout",
            "post_workout": f"{random.choice(POST_WORKOUT)['name']} after workout"
        }
    }
