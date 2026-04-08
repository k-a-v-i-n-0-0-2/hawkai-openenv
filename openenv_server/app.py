from fastapi import FastAPI, Body, HTTPException, Query
from typing import Dict, List, Any, Optional
import copy
import os

# Using absolute imports relative to the project root
try:
    from openenv_server.schema import Action, Observation, Reward, StepResponse
    from openenv_server.food_db import FOOD_DB
except ImportError:
    # Fallback for different execution styles
    from schema import Action, Observation, Reward, StepResponse
    from food_db import FOOD_DB

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
            "breakfast": ["R1", "R5"], 
            "lunch": ["R8", "R10"], 
            "dinner": ["R12"]
        }
    }
}

current_task_id = "easy"
current_state = copy.deepcopy(TASKS["easy"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "HawkAI OpenEnv is Running", "environment": "Hugging Face Spaces"}

@app.get("/state")
def get_state():
    return current_state

@app.post("/reset", response_model=Observation)
def reset(task_id: Optional[str] = Query(None), body: Any = Body(None)):
    global current_task_id, current_state
    
    # Very flexible task_id extraction
    t_id = "easy"
    
    # 1. Check if it's in the query param
    if task_id:
        t_id = task_id
    # 2. Check if it's in a JSON body as a string or a dict
    elif body:
        if isinstance(body, str) and body in TASKS:
            t_id = body
        elif isinstance(body, dict) and "task_id" in body:
            t_id = body["task_id"]
            
    if t_id not in TASKS:
        t_id = "easy"
        
    current_task_id = t_id
    current_state = copy.deepcopy(TASKS[t_id])
    return Observation(
        result=f"Environment reset to task: {t_id}",
        current_diet=current_state["diet"]
    )

def calculate_diet_macros(diet: Dict[str, List[str]]):
    total_cals, total_protein, max_sugar, has_non_veg = 0, 0, 0, False
    for meal, items in diet.items():
        for fid in items:
            food = FOOD_DB.get(fid)
            if food:
                total_cals += food.get("calories", 0)
                total_protein += food.get("protein", 0)
                if food.get("sugar", 0) > max_sugar: max_sugar = food["sugar"]
                if food.get("type") == "non-veg": has_non_veg = True
    return total_cals, total_protein, max_sugar, has_non_veg

def grade_diet(task_id: str, diet: Dict[str, List[str]]) -> Reward:
    cals, protein, max_sugar, has_non_veg = calculate_diet_macros(diet)
    
    # Safety Check
    if not diet: return Reward(score=0.0, message="Diet is empty.")

    if task_id == "easy":
        if cals <= 2000 and cals > 500:
            return Reward(score=1.0, message=f"Success! Calories: {cals}")
        return Reward(score=0.0, message=f"Failed. Calories {cals} target (500-2000).")
        
    elif task_id == "medium":
        if max_sugar > 0:
            return Reward(score=0.0, message=f"Failed. Contains sugar.")
        if protein <= 50:
            return Reward(score=0.5, message=f"Partial. No sugar, but protein is {protein}g (needs >50g).")
        return Reward(score=1.0, message=f"Success! Protein: {protein}g")
        
    elif task_id == "hard":
        if has_non_veg:
            return Reward(score=0.0, message="Failed. Still contains non-veg items.")
        if cals > 1500:
            return Reward(score=0.2, message=f"Failed. Cals too high ({cals}).")
        if protein <= 75:
            return Reward(score=0.8, message=f"Close. Protein {protein}g (need >75g).")
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
            if not action.query or action.query.lower() in food["name"].lower():
                results[fid] = food
        obs_result = f"Found {len(results)} items."
        
    elif action.action_type == "add_food":
        if action.food_id in FOOD_DB and action.meal in current_state["diet"]:
            current_state["diet"][action.meal].append(action.food_id)
            food_name = FOOD_DB[action.food_id]["name"]
            obs_result = f"Added {food_name} to {action.meal}."
        else:
            obs_result = "Invalid food or meal."
            
    elif action.action_type == "remove_food":
        if action.meal in current_state["diet"] and action.food_id in current_state["diet"][action.meal]:
            current_state["diet"][action.meal].remove(action.food_id)
            obs_result = f"Removed {action.food_id}."
        else:
            obs_result = "Food not found."
            
    elif action.action_type == "submit_diet":
        reward = grade_diet(current_task_id, current_state["diet"])
        obs_result = f"Evaluated: {reward.message}"
        done = True
        
    return StepResponse(
        observation=obs_result,
        reward=reward,
        done=done,
        info={"current_macros": calculate_diet_macros(current_state["diet"])}
    )
