import requests

api_key = "ae279ff2d4b5475094dbe1b478cbe692.vM7fXT8ilEiYs366Lo-Vg4O5"
endpoints = [
    "https://api.ollama.com/api/tags",
    "https://ollama.com/api/tags",
    "https://api.ollama.com/v1/models"
]

for url in endpoints:
    try:
        print(f"Testing {url}...")
        headers = {"Authorization": f"Bearer {api_key}"}
        res = requests.get(url, headers=headers, timeout=5)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text[:200]}")
    except Exception as e:
        print(f"Error on {url}: {e}")
