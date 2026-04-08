"""
Food Search Engine — SQLite FTS5 powered
=========================================
Searches the master foods.db (50,000+ Indian foods) using SQLite FTS5
for instant full-text search (<50ms).

Falls back gracefully to the old in-memory INDIAN_FOODS list if
foods.db hasn't been built yet (run build_food_database.py first).
"""

import sqlite3
from pathlib import Path
from difflib import SequenceMatcher
import requests
import uuid

BASE_DIR     = Path(__file__).parent
FOODS_DB     = BASE_DIR / "foods.db"


# ── Connection helper ────────────────────────────────────────────────────────
def _get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(FOODS_DB)
    conn.row_factory = sqlite3.Row
    return conn


# ── Row → dict (compatible with existing frontend schema) ───────────────────
def _row_to_dict(row) -> dict:
    d = dict(row)
    return {
        "id":                   d.get("id"),
        "name":                 d.get("name"),
        "brand":                d.get("brand", ""),
        "region":               d.get("region", "India"),
        "category":             d.get("category", "other"),
        "is_vegetarian":        bool(d.get("is_vegetarian", 1)),
        "is_vegan":             bool(d.get("is_vegan", 0)),
        "calories_per_100g":    d.get("calories_per_100g", 0),
        "protein_per_100g":     d.get("protein_per_100g", 0),
        "carbs_per_100g":       d.get("carbs_per_100g", 0),
        "fat_per_100g":         d.get("fat_per_100g", 0),
        "fiber_per_100g":       d.get("fiber_per_100g", 0),
        "sodium_per_100g":      d.get("sodium_per_100g", 0),
        "sugar_per_100g":       d.get("sugar_per_100g", 0),
        "serving_size_g":       d.get("serving_size_g", 100),
        "serving_description":  d.get("serving_description", "1 serving (100g)"),
        "calories_per_serving": d.get("calories_per_serving", 0),
        "protein_per_serving":  d.get("protein_per_serving", 0),
        "carbs_per_serving":    d.get("carbs_per_serving", 0),
        "fat_per_serving":      d.get("fat_per_serving", 0),
    }


# ── Fallback: old in-memory search (used before foods.db is built) ───────────
def _fallback_search(query, region, category, vegetarian_only, limit):
    from indian_foods_db import INDIAN_FOODS

    def _sim(a, b):
        return SequenceMatcher(None, a.lower(), b.lower()).ratio()

    foods = INDIAN_FOODS
    if region:
        foods = [f for f in foods if f.get("region", "").lower() == region.lower()]
    if category:
        foods = [f for f in foods if f.get("category") == category]
    if vegetarian_only:
        foods = [f for f in foods if f.get("is_vegetarian")]

    if not query or not query.strip():
        return foods[:limit]

    q = query.lower().strip()
    q_words = q.split()
    results = []
    for food in foods:
        nl = food.get("name", "").lower()
        score = 0.0
        if q == nl:
            score = 1.0
        elif q in nl:
            score = 0.7 + (len(q) / max(len(nl), 1)) * 0.3
        else:
            score = _sim(q, nl)
            for qw in q_words:
                for nw in nl.split():
                    if qw == nw:
                        score = max(score, 0.6)
                    elif qw in nw or nw in qw:
                        score = max(score, 0.4)
                    else:
                        s = _sim(qw, nw)
                        if s > 0.6:
                            score = max(score, s * 0.5)
        if score > 0.25:
            results.append((score, food))

    results.sort(key=lambda x: x[0], reverse=True)
    return [f for _, f in results[:limit]]


# ── Open Food Facts Fallback ──────────────────────────────────────────────────
def _fetch_open_food_facts(query: str, limit: int = 3) -> list:
    url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size={limit}"
    try:
        response = requests.get(url, timeout=3)
        data = response.json()
        new_foods = []
        if 'products' in data:
            for product in data['products']:
                nutriments = product.get('nutriments', {})
                if not nutriments.get('energy-kcal_100g'):
                    continue
                food = {
                    "id": f"off_{uuid.uuid4().hex[:8]}",
                    "name": product.get('product_name', 'Unknown product'),
                    "brand": product.get('brands', ''),
                    "region": "Global/Packaged",
                    "category": "snack",
                    "is_vegetarian": 1,
                    "is_vegan": 0,
                    "calories_per_100g": float(nutriments.get('energy-kcal_100g', 0)),
                    "protein_per_100g": float(nutriments.get('proteins_100g', 0)),
                    "carbs_per_100g": float(nutriments.get('carbohydrates_100g', 0)),
                    "fat_per_100g": float(nutriments.get('fat_100g', 0)),
                    "fiber_per_100g": float(nutriments.get('fiber_100g', 0)),
                    "sodium_per_100g": float(nutriments.get('sodium_100g', 0)),
                    "sugar_per_100g": float(nutriments.get('sugars_100g', 0)),
                    "serving_size_g": 100,
                    "serving_description": "1 serving (100g)",
                    "calories_per_serving": float(nutriments.get('energy-kcal_100g', 0)),
                    "protein_per_serving": float(nutriments.get('proteins_100g', 0)),
                    "carbs_per_serving": float(nutriments.get('carbohydrates_100g', 0)),
                    "fat_per_serving": float(nutriments.get('fat_100g', 0)),
                    "source": "openfoodfacts"
                }
                new_foods.append(food)
        return new_foods
    except Exception:
        return []

def _insert_new_foods(foods: list, conn: sqlite3.Connection):
    if not foods: return
    try:
        columns = ("id, name, brand, region, category, is_vegetarian, is_vegan, calories_per_100g, protein_per_100g, "
                   "carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g, serving_size_g, "
                   "serving_description, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, source")
        placeholders = ",".join(["?"] * 21)
        for f in foods:
            conn.execute(f"INSERT OR IGNORE INTO foods ({columns}) VALUES ({placeholders})", 
            (f["id"], f["name"], f["brand"], f["region"], f["category"], f["is_vegetarian"], f["is_vegan"],
             f["calories_per_100g"], f["protein_per_100g"], f["carbs_per_100g"], f["fat_per_100g"], f["fiber_per_100g"], f["sodium_per_100g"], f["sugar_per_100g"],
             f["serving_size_g"], f["serving_description"], f["calories_per_serving"], f["protein_per_serving"], f["carbs_per_serving"], f["fat_per_serving"], f["source"]))
        conn.commit()
    except Exception:
        pass


# ── Main search function ─────────────────────────────────────────────────────
def search_foods(query: str, region=None, category=None,
                 vegetarian_only=False, limit=20) -> list:
    """
    Search foods by query string with optional filters.
    Uses SQLite FTS5 when foods.db exists, falls back to in-memory search.
    """
    # ── Fallback mode ──────────────────────────────────────────────────────
    if not FOODS_DB.exists():
        return _fallback_search(query, region, category, vegetarian_only, limit)

    conn = _get_db()
    try:
        # Build optional WHERE filters
        filters, params = [], []
        if category:
            filters.append("f.category = ?")
            params.append(category)
        if vegetarian_only:
            filters.append("f.is_vegetarian = 1")
        if region:
            filters.append("(f.region = ? OR f.region = 'India')")
            params.append(region)

        extra_where = ("AND " + " AND ".join(filters)) if filters else ""

        # ── Empty query → return popular foods ────────────────────────────
        if not query or not query.strip():
            simple_filters, simple_params = [], []
            if category:
                simple_filters.append("category = ?")
                simple_params.append(category)
            if vegetarian_only:
                simple_filters.append("is_vegetarian = 1")

            where_str = ("WHERE " + " AND ".join(simple_filters)) if simple_filters else ""
            simple_params.append(limit)
            rows = conn.execute(
                f"SELECT * FROM foods {where_str} "
                f"ORDER BY (source = 'curated') DESC, calories_per_100g DESC LIMIT ?",
                simple_params
            ).fetchall()
            return [_row_to_dict(r) for r in rows]

        # ── FTS5 full-text search ─────────────────────────────────────────
        # Build FTS match string: each word becomes a prefix token  (word*)
        fts_tokens = " ".join(f'"{w}"*' for w in query.strip().split())

        try:
            fts_rows = conn.execute(f"""
                SELECT f.* FROM foods f
                JOIN foods_fts fts ON f.rowid = fts.rowid
                WHERE foods_fts MATCH ?
                {extra_where}
                ORDER BY rank
                LIMIT ?
            """, [fts_tokens] + params + [limit]).fetchall()
        except Exception:
            fts_rows = []

        # ── LIKE fallback if FTS returns nothing ──────────────────────────
        if not fts_rows:
            like = f"%{query.strip()}%"
            # strip "f." prefix for simple query
            simple_extra = extra_where.replace("f.", "")
            fts_rows = conn.execute(f"""
                SELECT * FROM foods
                WHERE name LIKE ?
                {simple_extra}
                ORDER BY length(name) ASC
                LIMIT ?
            """, [like] + params + [limit]).fetchall()

        results = [_row_to_dict(r) for r in fts_rows]

        # ── Open Food Facts fallback if results are sparse ───────────────
        if len(results) < 3 and not vegetarian_only and not category:
            off_foods = _fetch_open_food_facts(query, limit=3)
            if off_foods:
                _insert_new_foods(off_foods, conn)
                results.extend(off_foods)

        return results

    finally:
        conn.close()


# ── Metadata helpers ─────────────────────────────────────────────────────────
def get_all_regions() -> list:
    if not FOODS_DB.exists():
        from indian_foods_db import INDIAN_FOODS
        return sorted(set(f.get("region", "India") for f in INDIAN_FOODS))
    conn = _get_db()
    rows = conn.execute(
        "SELECT DISTINCT region FROM foods WHERE region != '' ORDER BY region"
    ).fetchall()
    conn.close()
    return [r[0] for r in rows]


def get_all_categories() -> list:
    if not FOODS_DB.exists():
        from indian_foods_db import INDIAN_FOODS
        return sorted(set(f.get("category", "other") for f in INDIAN_FOODS))
    conn = _get_db()
    rows = conn.execute(
        "SELECT DISTINCT category FROM foods WHERE category != '' ORDER BY category"
    ).fetchall()
    conn.close()
    return [r[0] for r in rows]


def get_food_count() -> int:
    """Return total number of foods in the database."""
    if not FOODS_DB.exists():
        from indian_foods_db import INDIAN_FOODS
        return len(INDIAN_FOODS)
    conn = _get_db()
    count = conn.execute("SELECT COUNT(*) FROM foods").fetchone()[0]
    conn.close()
    return count


def get_food_by_id(food_id: str) -> dict:
    """Get single food by ID."""
    if not FOODS_DB.exists():
        from indian_foods_db import INDIAN_FOODS
        for f in INDIAN_FOODS:
            if f.get("id") == food_id:
                return f
        return None
    
    conn = _get_db()
    row = conn.execute("SELECT * FROM foods WHERE id = ?", (food_id,)).fetchone()
    conn.close()
    return _row_to_dict(row) if row else None
