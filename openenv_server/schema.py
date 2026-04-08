from pydantic import BaseModel, Field
from typing import Literal, List, Dict, Optional, Any

class Action(BaseModel):
    action_type: Literal["query_food_db", "add_food", "remove_food", "submit_diet"] = Field(
        description="The type of action the agent wants to perform."
    )
    query: Optional[str] = Field(None, description="Search term for 'query_food_db' action.")
    meal: Optional[Literal["breakfast", "lunch", "dinner"]] = Field(None, description="Target meal for add/remove.")
    food_id: Optional[str] = Field(None, description="ID of the food to add/remove.")

class Reward(BaseModel):
    score: float = Field(0.0, description="The reward score between 0.0 and 1.0.")
    message: str = Field("", description="Feedback message explaining the score.")

class StepResponse(BaseModel):
    observation: str = Field(description="The result of the action taken.")
    reward: Reward
    done: bool = Field(description="True if the task is complete, False otherwise.")
    info: Dict[str, Any] = Field(default_factory=dict, description="Additional debug/state info.")

class Observation(BaseModel):
    result: str = Field(description="System message or query results.")
    current_diet: Dict[str, List[Dict[str, Any]]] = Field(description="The current state of the generated diet.")

class TaskDef(BaseModel):
    id: str
    difficulty: str
    description: str

class InferenceRequest(BaseModel):
    task_id: str

class InferenceResult(BaseModel):
    status: str
    reward: float
    message: str
