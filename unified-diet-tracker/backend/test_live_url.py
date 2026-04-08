import requests

url = "https://hawkai-backend-python.onrender.com/generate"
payload = {
    "weight": 65,
    "height": 162,
    "age": 20,
    "gender": "Male",
    "activity_level": "Lightly Active",
    "goal": "Muscle Gain"
}

print(f"Connecting to {url}...")
try:
    with requests.post(url, json=payload, stream=True, timeout=120) as r:
        print(f"Status: {r.status_code}")
        for chunk in r.iter_content(chunk_size=1024):
            if chunk:
                print(chunk.decode('utf-8'), end='', flush=True)
except Exception as e:
    print(f"\nError: {e}")
