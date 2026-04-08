from pydantic import BaseModel, Field
from typing import Literal, List, Dict, Optional, Any

class Action(BaseModel):
    action_type: Literal["query_food_db", "add_food", "remove_food", "submit_diet"]
    query: Optional[str] = None
    meal: Optional[Literal["breakfast", "lunch", "dinner"]] = None
    food_id: Optional[str] = None

class Observation(BaseModel):
    result: str
    current_diet: Optional[Dict[str, List[str]]] = None
    error: Optional[str] = None

class Reward(BaseModel):
    value: float
    reason: str

class StepResponse(BaseModel):
    observation: Observation
    reward: Reward
    done: bool
    info: Dict[str, Any]

class TaskDef(BaseModel):
    task_id: str
    difficulty: Literal["easy", "medium", "hard"]
    description: str

class InferenceRequest(BaseModel):
    task_id: Literal["easy", "medium", "hard"] = "easy"
