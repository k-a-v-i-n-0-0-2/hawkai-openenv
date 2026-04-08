from fastapi import FastAPI, Body, HTTPException, Query
from fastapi.responses import FileResponse, Response
from typing import Dict, List, Any, Optional
import copy
import os

from openenv_server.schema import Action, Observation, Reward, StepResponse, TaskDef

# Load database
from openenv_server.food_db import FOOD_DB

app = FastAPI(title="HawkAI OpenEnv API", description="RL Environment for Diet Generation")

# Serve the openenv.yaml for the validator
@app.get("/openenv.yaml")
def get_openenv_yaml():
    yaml_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "openenv.yaml")
    if not os.path.exists(yaml_path):
        # Try alternate paths
        for p in ["/app/openenv.yaml", "openenv.yaml"]:
            if os.path.exists(p):
                yaml_path = p
                break
    if os.path.exists(yaml_path):
        return FileResponse(yaml_path, media_type="text/yaml")
    return Response(content="not found", status_code=404)

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
        "diet": {"breakfast": ["R1"], "lunch": ["R5"], "dinner": ["R8"]}
    }
}

current_task_id = "easy"
current_state = copy.deepcopy(TASKS["easy"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "HawkAI OpenEnv is Running"}

@app.get("/state")
def get_state():
    return current_state

@app.post("/reset", response_model=Observation)
def reset(task_id: Optional[str] = Query("easy"), body: Any = Body(None)):
    global current_task_id, current_state
    
    t_id = "easy"
    if body:
        if isinstance(body, str) and body in TASKS: t_id = body
        elif isinstance(body, dict) and "task_id" in body: t_id = body["task_id"]
    elif task_id:
        t_id = task_id
        
    if t_id not in TASKS: t_id = "easy"
        
    current_task_id = t_id
    current_state = copy.deepcopy(TASKS[t_id])
    
    return Observation(
        result=f"Environment reset to task: {t_id}",
        current_diet=current_state["diet"]
    )

def calculate_diet_macros(diet: Dict[str, List[str]]):
    cals, protein, sugar, non_veg = 0, 0, 0, False
    for items in diet.values():
        for fid in items:
            food = FOOD_DB.get(fid)
            if food:
                cals += food.get("calories", 0)
                protein += food.get("protein", 0)
                if food.get("sugar", 0) > sugar: sugar = food["sugar"]
                if food.get("type") == "non-veg": non_veg = True
    return cals, protein, sugar, non_veg

def grade_diet(task_id: str, diet: Dict[str, List[str]]) -> Reward:
    cals, protein, sugar, non_veg = calculate_diet_macros(diet)
    if task_id == "easy":
        if 500 < cals <= 2000: return Reward(value=1.0, reason="Perfect calories.")
        return Reward(value=0.0, reason=f"Cals {cals} out of range.")
    elif task_id == "medium":
        if sugar > 0: return Reward(value=0.0, reason="Sugar detected.")
        if protein > 50: return Reward(value=1.0, reason="No sugar, good protein.")
        return Reward(value=0.5, reason="Low protein.")
    elif task_id == "hard":
        if non_veg: return Reward(value=0.0, reason="Non-veg found.")
        if cals <= 1500 and protein > 75: return Reward(value=1.0, reason="Excellent veg diet.")
        return Reward(value=0.5, reason="Target missed.")
    return Reward(value=0.0, reason="Unknown")

@app.post("/step", response_model=StepResponse)
def step(action: Action = Body(...)):
    global current_state, current_task_id
    obs_res = ""
    reward = Reward(value=0.0, reason="Doing task...")
    done = False
    
    if action.action_type == "query_food_db":
        obs_res = f"Searched for {action.query}."
    elif action.action_type == "add_food":
        if action.food_id in FOOD_DB and action.meal in current_state["diet"]:
            current_state["diet"][action.meal].append(action.food_id)
            obs_res = f"Added {action.food_id}."
    elif action.action_type == "submit_diet":
        reward = grade_diet(current_task_id, current_state["diet"])
        obs_res = f"Graded: {reward.reason}"
        done = True
        
    return StepResponse(
        observation=Observation(result=obs_res, current_diet=current_state["diet"]),
        reward=reward,
        done=done,
        info={"macros": str(calculate_diet_macros(current_state["diet"]))}
    )
