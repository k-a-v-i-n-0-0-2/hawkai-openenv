import os
from dotenv import load_dotenv
import ollama

load_dotenv()

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")
OLLAMA_HOST = "https://api.ollama.com"
MODEL_NAME = "qwen3.5:397b"

client = ollama.Client(
    host=OLLAMA_HOST,
    headers={"Authorization": f"Bearer {OLLAMA_API_KEY}"} if OLLAMA_API_KEY else {}
)

# Mock data to build prompt
data = {
    "age": "20",
    "gender": "Male",
    "height": "163",
    "weight": "60",
    "goal": "Muscle Gain",
    "activity_level": "Lightly Active",
    "diet_type": "Vegetarian",
    "cuisine": "Mixed",
    "allergies": "none",
    "health_conditions": "none"
}

# Simple replication of prompt building
prompt = f"Create a detailed Indian vegetarian diet plan for a 20yo Male, 163cm, 60kg, lightly active, for Muscle Gain. Cuisine: Mixed."

print(f"Calling Ollama Cloud model={MODEL_NAME} with prompt...")
try:
    for part in client.generate(model=MODEL_NAME, prompt=prompt, stream=True):
        print(part.get("response", ""), end="", flush=True)
    print("\n[Done]")
except Exception as e:
    print(f"\nException: {str(e)}")
