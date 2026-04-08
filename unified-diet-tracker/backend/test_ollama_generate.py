import requests

api_key = "ae279ff2d4b5475094dbe1b478cbe692.vM7fXT8ilEiYs366Lo-Vg4O5"
models = ["deepseek-v3", "qwen3.5:397b", "minimax-m2.1"]

for model in models:
    try:
        print(f"Testing model: {model}...")
        res = requests.post(
            "https://api.ollama.com/api/generate",
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": model, "prompt": "Hi, reply with one word: 'Success'"},
            timeout=10
        )
        print(f"[{model}] Status: {res.status_code}")
        print(f"[{model}] Response: {res.text[:100]}")
    except Exception as e:
        print(f"[{model}] Error: {e}")
