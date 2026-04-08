import requests
import json

url = "https://hawkai-backend.onrender.com/generate"
payload = {
    "age": "25",
    "weight": "70",
    "height": "170",
    "goal": "Muscle Gain",
    "diet_type": "Non-Vegetarian",
    "session_id": "test_script_session"
}

try:
    print(f"Sending POST to {url}...")
    response = requests.post(url, json=payload, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
