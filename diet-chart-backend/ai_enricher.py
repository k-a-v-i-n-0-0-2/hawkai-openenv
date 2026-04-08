import sqlite3
import os
import json
import ast

try:
    from ollama import Client
except ImportError:
    pass

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "diet_tracker.db")

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gpt-oss:120b-cloud")

def enrich_food_with_ai(food_id: str, food_name: str, cal: float, pro: float, carb: float, fat: float) -> dict:
    """
    Enriches food with micronutrients and measures using Ollama.
    Returns the enriched data dict.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    
    # Check if already enriched
    existing = conn.execute("SELECT * FROM ai_food_enrichments WHERE food_id = ?", (food_id,)).fetchone()
    if existing:
        conn.close()
        return dict(existing)
        
    # Generate Enrichment
    prompt = f"""
You are a top-tier Indian Nutrition Expert. Provide the estimated micronutrients (per 100g) and common measurement unit weights for: {food_name}
It has approximately {cal} kcal, {pro}g Protein, {carb}g Carbs, and {fat}g Fat per 100g.

Return ONLY a valid JSON object matching exactly this schema:
{{
  "iron_per_100g": <float, mg>,
  "calcium_per_100g": <float, mg>,
  "vit_a_per_100g": <float, mcg>,
  "vit_c_per_100g": <float, mg>,
  "potassium_per_100g": <float, mg>,
  "measures": {{
    "Piece": <weight in grams, or 0 if not applicable>,
    "Katori": <weight in grams, or 0 if not applicable>,
    "Small Bowl": <weight in grams, or 0>,
    "Plate": <weight in grams, or 0>
  }}
}}

Be highly accurate based on Indian foods. Only include applicable measures (e.g. Dosa = Piece, Sambar = Katori). Ensure the JSON is parsable. No markdown formatting, just JSON.
"""

    try:
        client = Client(host=OLLAMA_HOST)
        response = client.generate(
            model=OLLAMA_MODEL,
            prompt=prompt,
            options={"temperature": 0.2}
        )
        
        # Clean response and parse JSON
        raw_text = response['response'].strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        data = json.loads(raw_text.strip())
        
        measures_json = json.dumps(data.get("measures", {}))
        iron = float(data.get("iron_per_100g", 0))
        calcium = float(data.get("calcium_per_100g", 0))
        vit_a = float(data.get("vit_a_per_100g", 0))
        vit_c = float(data.get("vit_c_per_100g", 0))
        potassium = float(data.get("potassium_per_100g", 0))
        
        # Save to DB
        conn.execute("""
            INSERT OR REPLACE INTO ai_food_enrichments 
            (food_id, iron_per_100g, calcium_per_100g, vit_a_per_100g, vit_c_per_100g, potassium_per_100g, measures_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (food_id, iron, calcium, vit_a, vit_c, potassium, measures_json))
        conn.commit()
    except Exception as e:
        print(f"Ollama Enrichment Error for {food_name}: {e}")
        # Return blank defaults on error
        iron, calcium, vit_a, vit_c, potassium, measures_json = 0, 0, 0, 0, 0, "{}"
        
    conn.close()
    return {
        "food_id": food_id,
        "iron_per_100g": iron,
        "calcium_per_100g": calcium,
        "vit_a_per_100g": vit_a,
        "vit_c_per_100g": vit_c,
        "potassium_per_100g": potassium,
        "measures_json": measures_json
    }

