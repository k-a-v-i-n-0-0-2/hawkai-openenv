import requests

url = "http://localhost:5000/generate"
payload = {
    "weight": 60,
    "height": 162,
    "age": 20,
    "gender": "Male",
    "activity_level": "Lightly Active",
    "goal": "Muscle Gain",
    "diet_type": "Vegetarian",
    "cuisine": "South Indian",
    "session_id": "test_local"
}

print(f"Connecting to {url}...")
try:
    with requests.post(url, json=payload, stream=True, timeout=120) as r:
        print(f"Status Code: {r.status_code}")
        if r.status_code == 200:
            print("--- Stream Start ---")
            for chunk in r.iter_content(chunk_size=None, decode_unicode=True):
                if chunk:
                    print(chunk, end="", flush=True)
            print("\n--- Stream End ---")
        else:
            print(f"Error: {r.text}")
except Exception as e:
    print(f"Exception: {str(e)}")
