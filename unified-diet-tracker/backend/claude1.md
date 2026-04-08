Project: HawkAI Diet Recommendation System
Purpose

This project generates personalized diet charts using a combination of:

nutrition datasets

calorie calculations

AI reasoning through Ollama models

The system must generate accurate, understandable, and culturally relevant diet plans, especially South Indian foods.

The output must always be clear for normal users.

Critical Requirements

The AI must follow these strict rules when generating diet plans.

1. Use Real Food Names Only

Never output vague terms such as:

“healthy breakfast”

“protein meal”

“balanced lunch”

Always output actual food names.

Example:

Correct:

Breakfast:
2 Idli
1 bowl Sambar
1 cup Coconut Chutney

Incorrect:

Breakfast:
Healthy South Indian breakfast
2. Prefer South Indian Foods

If the user is from South India or region preference is India, prioritize foods such as:

Breakfast options:

Idli

Dosa

Ragi Dosa

Upma

Pongal

Appam

Puttu

Ragi Porridge

Lunch options:

Rice + Sambar

Rasam + Rice

Curd Rice

Lemon Rice

Tamarind Rice

Vegetable Kootu

Poriyal

Dinner options:

Chapati

Ragi Mudde

Vegetable Curry

Paneer Curry

Chicken Curry

Egg Curry

Snacks:

Sundal

Boiled peanuts

Fruit

Buttermilk

Avoid Western-only foods unless specifically requested.

3. Calorie Accuracy Rules

Calorie values must be derived from the nutrition dataset stored in the database, not guessed.

If dataset values exist:

Use dataset values.

Example reference values:

1 Idli ≈ 58 kcal
1 Dosa ≈ 133 kcal
100g Cooked Rice ≈ 130 kcal
1 Egg ≈ 155 kcal
100g Chicken Breast ≈ 165 kcal
1 Banana ≈ 89 kcal

If dataset data is unavailable:

Estimate calories conservatively.

Never output unrealistic values.

4. Meal Structure

Always generate a 5-meal plan unless specified otherwise.

Required structure:

Breakfast
Mid-Morning Snack
Lunch
Evening Snack
Dinner

Each meal must include:

food name

portion size

calories

protein source

Example:

Breakfast
2 Idli (116 kcal)
1 cup Sambar (70 kcal)
1 tsp Coconut Chutney (45 kcal)

Total: 231 kcal
5. Nutrition Balance

Each diet must contain balanced macronutrients:

Protein sources:

Eggs

Chicken

Fish

Paneer

Lentils

Chickpeas

Tofu

Carbohydrates:

Rice

Ragi

Wheat

Millets

Healthy fats:

Nuts

Seeds

Coconut

Ghee (moderate)

6. Protein Target Calculation

Protein must be based on user goal.

Fat loss:

1.6 g protein per kg body weight

Muscle gain:

1.8 – 2.2 g protein per kg body weight

Maintenance:

1.2 – 1.5 g protein per kg body weight
7. Calorie Calculation

Calories must follow this pipeline:

Calculate BMI

Calculate BMR

Calculate TDEE

Adjust calories based on goal.

Fat Loss:

TDEE – 500 kcal

Muscle Gain:

TDEE + 300 kcal

Maintenance:

TDEE
8. Hydration Advice

Always include hydration recommendations.

Example:

Drink 2.5–3 liters of water daily
Include buttermilk or coconut water
9. Workout Nutrition

Include:

Pre-workout meal suggestion
Post-workout recovery meal

Example:

Pre-Workout:
Banana + black coffee

Post-Workout:
Boiled eggs + fruit
10. Avoid Hallucinated Foods

Do NOT invent foods.

Only use foods present in:

dataset

common Indian cuisine

Output Format

Always output the diet plan like this:

BMI:
BMR:
TDEE:

Daily Calories Target:
Protein Target:

Diet Plan

Breakfast
Food items + calories

Mid-Morning Snack
Food items + calories

Lunch
Food items + calories

Evening Snack
Food items + calories

Dinner
Food items + calories

Hydration Tips
Workout Nutrition Advice
Lifestyle Advice
Health Disclaimer
Integration with Backend

The AI must assume that:

food calories come from hawk_diet.db

Tamil Nadu foods come from tn_foods.py

food indexing comes from index_food_data.py

If dataset values exist, they override AI estimates.

Final Rule

The diet must always be:

understandable

realistic

region-appropriate

nutritionally balanced

Avoid vague recommendations.