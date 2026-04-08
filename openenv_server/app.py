from fastapi import FastAPI, Body, HTTPException
from typing import Dict, List, Any
import copy
from .schema import Action, Observation, Reward, StepResponse
from .food_db import FOOD_DB

app = FastAPI(title="HawkAI OpenEnv API", description="RL Environment for Diet Generation")

# Initial Task States
TASKS = {
    "easy": {
        "profile": {"task": "Build Tamil Nadu diet under 2000 kcal"},
        "diet": {"breakfast": [], "lunch": [], "dinner": []}
    },
    "medium": {
        "profile": {"task": "Diabetic user (no sugar > 0). Needs >50g protein total."},
        "diet": {"breakfast": [], "lunch": [], "dinner": []}
    },
    "hard": {
        "profile": {"task": "Strict vegetarian. Protein > 75g. Under 1500 kcal."},
        "diet": {
            "breakfast": ["F2", "F6"], # Dosa, Gulab Jamun
            "lunch": ["F8", "F5"], # Mutton Biryani, Rice
            "dinner": ["F3"] # Chicken Curry
        }
    }
}

current_task_id = "easy"
current_state = copy.deepcopy(TASKS["easy"])

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.get("/state")
def get_state():
    return current_state

@app.post("/reset", response_model=Observation)
def reset(task_id: str = "easy"):
    global current_task_id, current_state
    if task_id not in TASKS:
        task_id = "easy"
    current_task_id = task_id
    current_state = copy.deepcopy(TASKS[task_id])
    return Observation(
        result=f"Environment reset to task: {task_id}",
        current_diet=current_state["diet"]
    )

def calculate_diet_macros(diet: Dict[str, List[str]]):
    total_cals, total_protein, max_sugar, has_non_veg = 0, 0, 0, False
    for meal, items in diet.items():
        for fid in items:
            food = FOOD_DB.get(fid)
            if food:
                total_cals += food["calories"]
                total_protein += food["protein"]
                if food["sugar"] > max_sugar: max_sugar = food["sugar"]
                if food["type"] == "non-veg": has_non_veg = True
    return total_cals, total_protein, max_sugar, has_non_veg

def grade_diet(task_id: str, diet: Dict[str, List[str]]) -> Reward:
    cals, protein, max_sugar, has_non_veg = calculate_diet_macros(diet)
    
    # Check if meals are populated
    for meal in ["breakfast", "lunch", "dinner"]:
        if not diet[meal]:
            return Reward(score=0.0, message=f"{meal} is empty. A proper diet needs all 3 meals.")

    if task_id == "easy":
        if cals <= 2000 and cals > 800:
            return Reward(score=1.0, message=f"Success! Calories: {cals}")
        return Reward(score=0.0, message=f"Failed. Calories {cals} not between 800 and 2000.")
        
    elif task_id == "medium":
        if max_sugar > 0:
            return Reward(score=0.0, message=f"Failed. Contains sugar (max_sugar: {max_sugar}g).")
        if protein <= 50:
            return Reward(score=0.5, message=f"Partial Success. No sugar, but protein is {protein}g (needs >50g).")
        return Reward(score=1.0, message=f"Success! Protein: {protein}g, Sugar: 0g")
        
    elif task_id == "hard":
        if has_non_veg:
            return Reward(score=0.0, message="Failed. Still contains non-veg items.")
        if cals > 1500:
            return Reward(score=0.2, message=f"Failed. Vegetarian, but cals too high ({cals} > 1500).")
        if protein <= 75:
            return Reward(score=0.8, message=f"Close. Cals {cals}, Veg, but protein {protein}g (need >75g).")
        return Reward(score=1.0, message="Perfect! Strict Veg, Protein > 75g, Cals under 1500.")
        
    return Reward(score=0.0, message="Unknown task")

@app.post("/step", response_model=StepResponse)
def step(action: Action = Body(...)):
    global current_state, current_task_id
    obs_result = ""
    reward = Reward(score=0.0, message="")
    done = False
    
    if action.action_type == "query_food_db":
        results = {}
        for fid, food in FOOD_DB.items():
            if not action.query or action.query.lower() in food["name"].lower() or action.query.lower() == food["type"]:
                results[fid] = food
        obs_result = f"Found {len(results)} items: {results}"
        
    elif action.action_type == "add_food":
        if action.food_id in FOOD_DB and action.meal in current_state["diet"]:
            current_state["diet"][action.meal].append(action.food_id)
            food_name = FOOD_DB[action.food_id]["name"]
            obs_result = f"Added {food_name} to {action.meal}."
        else:
            obs_result = "Invalid food_id or meal."
            
    elif action.action_type == "remove_food":
        if action.meal in current_state["diet"] and action.food_id in current_state["diet"][action.meal]:
            current_state["diet"][action.meal].remove(action.food_id)
            obs_result = f"Removed {action.food_id} from {action.meal}."
        else:
            obs_result = "Food not found in that meal."
            
    elif action.action_type == "submit_diet":
        reward = grade_diet(current_task_id, current_state["diet"])
        obs_result = f"Diet evaluated. {reward.message}"
        done = True
        
    return StepResponse(
        observation=obs_result,
        reward=reward,
        done=done,
        info={"current_macros": calculate_diet_macros(current_state["diet"])}
    )
