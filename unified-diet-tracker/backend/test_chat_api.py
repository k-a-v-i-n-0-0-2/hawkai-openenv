import os
from dotenv import load_dotenv
import ollama
from ollama import Client

load_dotenv()

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")
OLLAMA_HOST = "https://api.ollama.com"
MODEL_NAME = "qwen3.5:397b"

headers = {}
if OLLAMA_API_KEY:
    headers["Authorization"] = f"Bearer {OLLAMA_API_KEY}"

client = Client(host=OLLAMA_HOST, headers=headers)

prompt = "Create a simple 1-day vegetarian diet plan for a 20yo Male, 163cm, 60kg. Keep it brief."

print(f"Testing client.chat() with model={MODEL_NAME}...")
print(f"API Key present: {bool(OLLAMA_API_KEY)}")
print("---")

try:
    messages = [{"role": "user", "content": prompt}]
    for i, part in enumerate(client.chat(model=MODEL_NAME, messages=messages, stream=True)):
        # Print the RAW part to see its structure
        if i == 0:
            print(f"[DEBUG] First part type: {type(part)}")
            print(f"[DEBUG] First part keys: {part.keys() if hasattr(part, 'keys') else 'N/A'}")
            print(f"[DEBUG] First part repr: {repr(part)[:300]}")
            print("---")
        
        # Try both access patterns
        try:
            chunk = part.get("message", {}).get("content", "")
        except AttributeError:
            chunk = part.message.content if hasattr(part, 'message') else ""
        
        if chunk:
            print(chunk, end="", flush=True)
    print("\n[Done]")
except Exception as e:
    print(f"\nException: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
