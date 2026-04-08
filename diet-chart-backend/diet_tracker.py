"""
Diet Tracker Backend — Flask Blueprint
Handles meal logging, calorie tracking, goal status, and points.
"""
import sqlite3
import os
import json
from datetime import datetime, date
from flask import Blueprint, request, jsonify, send_from_directory, Response, stream_with_context
from food_search import search_foods, get_all_regions, get_all_categories, get_food_by_id, get_food_count
from indian_foods_db import get_all_foods
from ai_enricher import enrich_food_with_ai

try:
    from ollama import Client
except ImportError:
    pass

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gpt-oss:120b-cloud")

diet_tracker_bp = Blueprint("diet_tracker", __name__)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "diet_tracker.db")
DEMO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demo_diet_tracker")


def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    """Initialize database tables."""
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS daily_goals (
            date TEXT PRIMARY KEY,
            calorie_goal REAL DEFAULT 2000,
            protein_goal REAL DEFAULT 80,
            carbs_goal REAL DEFAULT 250,
            fat_goal REAL DEFAULT 65
        );

        CREATE TABLE IF NOT EXISTS meal_slots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slot_name TEXT NOT NULL,
            slot_order INTEGER DEFAULT 99,
            is_default INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS meal_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            slot_name TEXT NOT NULL,
            food_id TEXT NOT NULL,
            food_name TEXT NOT NULL,
            quantity_g REAL NOT NULL,
            calories REAL NOT NULL,
            protein REAL NOT NULL,
            carbs REAL NOT NULL,
            fat REAL NOT NULL,
            fiber REAL DEFAULT 0,
            logged_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS daily_points (
            date TEXT PRIMARY KEY,
            points INTEGER DEFAULT 0,
            breakdown TEXT DEFAULT '{}'
        );

        -- ── PERSONAL TRAINER CHAT TABLES ──────────────────────────────
        -- coach_sessions: One record per day. Snapshots the user's streak
        -- and calorie state at the time they opened the coach.
        CREATE TABLE IF NOT EXISTS coach_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            calorie_goal REAL DEFAULT 2000,
            calories_consumed REAL DEFAULT 0,
            calories_remaining REAL DEFAULT 0,
            protein_consumed REAL DEFAULT 0,
            streak_days INTEGER DEFAULT 0,
            goal_status TEXT DEFAULT 'green',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        -- coach_messages: Every message exchanged with the trainer.
        -- role: 'user' or 'assistant'. Tied to a date.
        CREATE TABLE IF NOT EXISTS coach_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_date TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_meal_logs_date ON meal_logs(date);
        CREATE INDEX IF NOT EXISTS idx_meal_logs_slot ON meal_logs(date, slot_name);
        CREATE INDEX IF NOT EXISTS idx_coach_messages_date ON coach_messages(session_date);
    """)

    # Insert default meal slots if empty
    existing = conn.execute("SELECT COUNT(*) FROM meal_slots").fetchone()[0]
    if existing == 0:
        conn.executemany(
            "INSERT INTO meal_slots (slot_name, slot_order, is_default) VALUES (?, ?, 1)",
            [("Breakfast", 1), ("Lunch", 2), ("Dinner", 3)]
        )

    conn.commit()
    conn.close()


# Initialize DB on import
init_db()


# ─── FOOD SEARCH ENDPOINTS ─────────────────────────────────

@diet_tracker_bp.route("/api/foods/search")
def api_search_foods():
    """Search foods by query and filters."""
    query = request.args.get("q", "")
    region = request.args.get("region")
    category = request.args.get("category")
    veg_only = request.args.get("vegetarian", "").lower() == "true"
    limit = min(int(request.args.get("limit", 20)), 50)

    results = search_foods(query, region=region, category=category,
                           vegetarian_only=veg_only, limit=limit)
    return jsonify({"success": True, "results": results, "count": len(results)})


@diet_tracker_bp.route("/api/foods/count")
def api_get_food_count():
    """Get total number of foods available."""
    return jsonify({"success": True, "count": get_food_count()})


@diet_tracker_bp.route("/api/foods/<food_id>")
def api_get_food(food_id):
    """Get single food details."""
    food = get_food_by_id(food_id)
    if not food:
        return jsonify({"success": False, "error": "Food not found"}), 404
        
    conn = get_db()
    enriched = conn.execute("SELECT * FROM ai_food_enrichments WHERE food_id = ?", (food_id,)).fetchone()
    conn.close()
    
    food_data = dict(food)
    if enriched:
        enriched_data = dict(enriched)
        food_data['iron_per_100g'] = enriched_data.get('iron_per_100g', 0)
        food_data['calcium_per_100g'] = enriched_data.get('calcium_per_100g', 0)
        food_data['vit_a_per_100g'] = enriched_data.get('vit_a_per_100g', 0)
        food_data['vit_c_per_100g'] = enriched_data.get('vit_c_per_100g', 0)
        food_data['potassium_per_100g'] = enriched_data.get('potassium_per_100g', 0)
        
        try:
            food_data['measures'] = json.loads(enriched_data.get('measures_json', '{}'))
        except:
            food_data['measures'] = {}
            
        food_data['is_ai_enriched'] = True
    else:
        food_data['is_ai_enriched'] = False
        food_data['measures'] = {}

    return jsonify({"success": True, "food": food_data})

@diet_tracker_bp.route("/api/foods/enrich", methods=["POST"])
def api_enrich_food():
    """Trigger AI generation for micronutrients and measures."""
    data = request.get_json()
    food_id = data.get("food_id")
    
    if not food_id:
        return jsonify({"success": False, "error": "Missing food_id"}), 400
        
    food = get_food_by_id(food_id)
    if not food:
         return jsonify({"success": False, "error": "Food not found"}), 404
         
    enriched_data = enrich_food_with_ai(
        food_id=food_id,
        food_name=food.get('name', ''),
        cal=food.get('calories_per_100g', 0),
        pro=food.get('protein_per_100g', 0),
        carb=food.get('carbs_per_100g', 0),
        fat=food.get('fat_per_100g', 0)
    )
    
    return jsonify({"success": True, "enriched": enriched_data})



@diet_tracker_bp.route("/api/foods/regions")
def api_get_regions():
    """Get all available regions."""
    return jsonify({"success": True, "regions": get_all_regions()})


@diet_tracker_bp.route("/api/foods/categories")
def api_get_categories():
    """Get all available categories."""
    return jsonify({"success": True, "categories": get_all_categories()})


# ─── MEAL SLOT ENDPOINTS ───────────────────────────────────

@diet_tracker_bp.route("/api/tracker/meal-slots", methods=["GET"])
def api_get_meal_slots():
    """Get all meal slots."""
    conn = get_db()
    slots = conn.execute(
        "SELECT * FROM meal_slots ORDER BY slot_order, id"
    ).fetchall()
    conn.close()
    return jsonify({
        "success": True,
        "slots": [{"id": s["id"], "name": s["slot_name"],
                    "order": s["slot_order"], "is_default": bool(s["is_default"])}
                   for s in slots]
    })


@diet_tracker_bp.route("/api/tracker/meal-slots", methods=["POST"])
def api_add_meal_slot():
    """Add a new custom meal slot."""
    data = request.get_json()
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"success": False, "error": "Slot name required"}), 400

    conn = get_db()
    max_order = conn.execute("SELECT MAX(slot_order) FROM meal_slots").fetchone()[0] or 3
    conn.execute(
        "INSERT INTO meal_slots (slot_name, slot_order, is_default) VALUES (?, ?, 0)",
        (name, max_order + 1)
    )
    conn.commit()
    slot_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    conn.close()
    return jsonify({"success": True, "slot": {"id": slot_id, "name": name}})


@diet_tracker_bp.route("/api/tracker/meal-slots/<int:slot_id>", methods=["DELETE"])
def api_delete_meal_slot(slot_id):
    """Delete a custom meal slot (not defaults)."""
    conn = get_db()
    slot = conn.execute("SELECT * FROM meal_slots WHERE id = ?", (slot_id,)).fetchone()
    if not slot:
        conn.close()
        return jsonify({"success": False, "error": "Slot not found"}), 404
    if slot["is_default"]:
        conn.close()
        return jsonify({"success": False, "error": "Cannot delete default slots"}), 400

    conn.execute("DELETE FROM meal_slots WHERE id = ?", (slot_id,))
    conn.execute("DELETE FROM meal_logs WHERE slot_name = ?", (slot["slot_name"],))
    conn.commit()
    conn.close()
    return jsonify({"success": True})


# ─── MEAL LOGGING ENDPOINTS ────────────────────────────────

@diet_tracker_bp.route("/api/tracker/log", methods=["POST"])
def api_log_food():
    """Add a food item to a meal slot."""
    data = request.get_json()
    food_id = data.get("food_id")
    slot_name = data.get("slot_name", "Breakfast")
    servings = float(data.get("servings", 1))
    log_date = data.get("date", date.today().isoformat())

    food = get_food_by_id(food_id)
    if not food:
        return jsonify({"success": False, "error": "Food not found"}), 404

    quantity_g = data.get("quantity_g", food["serving_size_g"] * servings)
    calories = round(food["calories_per_100g"] * (quantity_g / 100), 1)
    protein = round(food["protein_per_100g"] * (quantity_g / 100), 1)
    carbs = round(food["carbs_per_100g"] * (quantity_g / 100), 1)
    fat = round(food["fat_per_100g"] * (quantity_g / 100), 1)
    fiber = round(food["fiber_per_100g"] * (quantity_g / 100), 1)

    # Check enriched data for micros
    conn = get_db()
    enriched = conn.execute("SELECT * FROM ai_food_enrichments WHERE food_id = ?", (food_id,)).fetchone()
    
    iron = round((enriched['iron_per_100g'] if enriched else 0) * (quantity_g / 100), 2)
    calcium = round((enriched['calcium_per_100g'] if enriched else 0) * (quantity_g / 100), 2)
    vit_a = round((enriched['vit_a_per_100g'] if enriched else 0) * (quantity_g / 100), 2)
    vit_c = round((enriched['vit_c_per_100g'] if enriched else 0) * (quantity_g / 100), 2)
    potassium = round((enriched['potassium_per_100g'] if enriched else 0) * (quantity_g / 100), 2)

    conn.execute(
        """INSERT INTO meal_logs (date, slot_name, food_id, food_name, quantity_g,
           calories, protein, carbs, fat, fiber, iron, calcium, vit_a, vit_c, potassium)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (log_date, slot_name, food_id, food["name"], quantity_g,
         calories, protein, carbs, fat, fiber, iron, calcium, vit_a, vit_c, potassium)
    )
    conn.commit()
    log_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    conn.close()

    # Recalculate points
    _calculate_points(log_date)

    return jsonify({
        "success": True,
        "log_id": log_id,
        "logged": {
            "food": food["name"],
            "slot": slot_name,
            "calories": calories,
            "protein": protein,
            "carbs": carbs,
            "fat": fat,
            "quantity_g": quantity_g
        }
    })


@diet_tracker_bp.route("/api/tracker/remove/<int:log_id>", methods=["DELETE"])
def api_remove_food(log_id):
    """Remove a food item from a meal log."""
    conn = get_db()
    log = conn.execute("SELECT date FROM meal_logs WHERE id = ?", (log_id,)).fetchone()
    if not log:
        conn.close()
        return jsonify({"success": False, "error": "Log entry not found"}), 404

    log_date = log["date"]
    conn.execute("DELETE FROM meal_logs WHERE id = ?", (log_id,))
    conn.commit()
    conn.close()

    _calculate_points(log_date)
    return jsonify({"success": True})


# ─── DAY VIEW ENDPOINTS ────────────────────────────────────

@diet_tracker_bp.route("/api/tracker/day/<log_date>")
def api_get_day(log_date):
    """Get full day's tracking data grouped by meal slots."""
    conn = get_db()
    slots = conn.execute("SELECT * FROM meal_slots ORDER BY slot_order, id").fetchall()
    logs = conn.execute(
        "SELECT * FROM meal_logs WHERE date = ? ORDER BY logged_at", (log_date,)
    ).fetchall()
    goal = conn.execute(
        "SELECT * FROM daily_goals WHERE date = ?", (log_date,)
    ).fetchone()
    conn.close()

    # Default goals
    calorie_goal = goal["calorie_goal"] if goal else 2000
    protein_goal = goal["protein_goal"] if goal else 80
    carbs_goal = goal["carbs_goal"] if goal else 250
    fat_goal = goal["fat_goal"] if goal else 65

    # Group logs by slot
    meal_data = {}
    for slot in slots:
        slot_name = slot["slot_name"]
        slot_logs = [dict(l) for l in logs if l["slot_name"] == slot_name]
        slot_totals = {
            "calories": round(sum(l["calories"] for l in slot_logs), 1),
            "protein": round(sum(l["protein"] for l in slot_logs), 1),
            "carbs": round(sum(l["carbs"] for l in slot_logs), 1),
            "fat": round(sum(l["fat"] for l in slot_logs), 1),
        }
        meal_data[slot_name] = {
            "slot_id": slot["id"],
            "is_default": bool(slot["is_default"]),
            "items": slot_logs,
            "totals": slot_totals
        }

    # Day totals
    total_cal = round(sum(l["calories"] for l in logs), 1)
    total_prot = round(sum(l["protein"] for l in logs), 1)
    total_carbs = round(sum(l["carbs"] for l in logs), 1)
    total_fat = round(sum(l["fat"] for l in logs), 1)
    total_fiber = round(sum(l["fiber"] for l in logs), 1)
    total_iron = round(sum(l["iron"] for l in logs if "iron" in l.keys() and l["iron"]), 2)
    total_calcium = round(sum(l["calcium"] for l in logs if "calcium" in l.keys() and l["calcium"]), 2)
    total_vit_a = round(sum(l["vit_a"] for l in logs if "vit_a" in l.keys() and l["vit_a"]), 2)
    total_vit_c = round(sum(l["vit_c"] for l in logs if "vit_c" in l.keys() and l["vit_c"]), 2)
    total_potassium = round(sum(l["potassium"] for l in logs if "potassium" in l.keys() and l["potassium"]), 2)

    # Goal status
    cal_pct = (total_cal / calorie_goal * 100) if calorie_goal > 0 else 0
    if cal_pct > 100:
        goal_status = "red"
    elif cal_pct >= 90:
        goal_status = "yellow"
    else:
        goal_status = "green"

    # Meal logging stats
    required_slots_list = [s["slot_name"] for s in slots if s["is_default"]]
    logged_slots = set(l["slot_name"] for l in logs)
    meals_required = len(required_slots_list)
    meals_logged = len(logged_slots.intersection(set(required_slots_list)))

    return jsonify({
        "success": True,
        "date": log_date,
        "meals": meal_data,
        "totals": {
            "calories": total_cal,
            "protein": total_prot,
            "carbs": total_carbs,
            "fat": total_fat,
            "fiber": total_fiber,
            "iron": total_iron,
            "calcium": total_calcium,
            "vit_a": total_vit_a,
            "vit_c": total_vit_c,
            "potassium": total_potassium
        },
        "goals": {
            "calorie_goal": calorie_goal,
            "protein_goal": protein_goal,
            "carbs_goal": carbs_goal,
            "fat_goal": fat_goal
        },
        "goal_status": goal_status,
        "calorie_percentage": round(cal_pct, 1),
        "meals_required": meals_required,
        "meals_logged": meals_logged
    })


@diet_tracker_bp.route("/api/tracker/summary/<log_date>")
def api_get_summary(log_date):
    """Quick summary — totals + goal status only."""
    conn = get_db()
    logs = conn.execute(
        "SELECT calories, protein, carbs, fat, fiber FROM meal_logs WHERE date = ?",
        (log_date,)
    ).fetchall()
    goal = conn.execute(
        "SELECT * FROM daily_goals WHERE date = ?", (log_date,)
    ).fetchone()
    conn.close()

    calorie_goal = goal["calorie_goal"] if goal else 2000

    total_cal = round(sum(l["calories"] for l in logs), 1)
    cal_pct = (total_cal / calorie_goal * 100) if calorie_goal > 0 else 0

    if cal_pct > 100:
        goal_status = "red"
    elif cal_pct >= 90:
        goal_status = "yellow"
    else:
        goal_status = "green"

    # Get slot info for remainder
    slots = conn.execute("SELECT slot_name FROM meal_slots WHERE is_default = 1").fetchall()
    conn.close()

    required_slots = set(s["slot_name"] for s in slots)
    logged_slots = set(l["slot_name"] for l in logs)
    meals_required = len(required_slots)
    meals_logged = len(logged_slots.intersection(required_slots))

    return jsonify({
        "success": True,
        "date": log_date,
        "total_calories": total_cal,
        "calorie_goal": calorie_goal,
        "goal_status": goal_status,
        "calorie_percentage": round(cal_pct, 1),
        "meals_required": meals_required,
        "meals_logged": meals_logged
    })


# ─── GOAL ENDPOINTS ────────────────────────────────────────

@diet_tracker_bp.route("/api/tracker/set-goal", methods=["POST"])
def api_set_goal():
    """Set daily calorie/nutrition goals."""
    data = request.get_json()
    log_date = data.get("date", date.today().isoformat())
    calorie_goal = float(data.get("calorie_goal", 2000))
    protein_goal = float(data.get("protein_goal", 80))
    carbs_goal = float(data.get("carbs_goal", 250))
    fat_goal = float(data.get("fat_goal", 65))

    conn = get_db()
    conn.execute(
        """INSERT OR REPLACE INTO daily_goals (date, calorie_goal, protein_goal, carbs_goal, fat_goal)
           VALUES (?, ?, ?, ?, ?)""",
        (log_date, calorie_goal, protein_goal, carbs_goal, fat_goal)
    )
    conn.commit()
    conn.close()

    _calculate_points(log_date)
    return jsonify({"success": True, "goals_set": True})


# ─── POINTS ENDPOINT ───────────────────────────────────────

@diet_tracker_bp.route("/api/tracker/points/<log_date>")
def api_get_points(log_date):
    """Get points earned for a day."""
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM daily_points WHERE date = ?", (log_date,)
    ).fetchone()
    conn.close()

    if not row:
        return jsonify({"success": True, "date": log_date, "points": 0, "breakdown": {}})

    return jsonify({
        "success": True,
        "date": log_date,
        "points": row["points"],
        "breakdown": json.loads(row["breakdown"])
    })


def _calculate_points(log_date):
    """Calculate and store points for a given day (Max 10 points based on completed meals)."""
    conn = get_db()
    logs = conn.execute(
        "SELECT slot_name FROM meal_logs WHERE date = ?",
        (log_date,)
    ).fetchall()
    
    default_slots = conn.execute(
        "SELECT slot_name FROM meal_slots WHERE is_default = 1"
    ).fetchall()
    
    slots_logged = set(l["slot_name"] for l in logs)
    required_slots = set(s["slot_name"] for s in default_slots)
    
    required_count = len(required_slots) if required_slots else 3
    
    # Calculate how many of the required slots were logged
    logged_required_count = len(slots_logged.intersection(required_slots))
    
    # Calculate points based on 10 point scale
    if required_count > 0:
        points = round((logged_required_count / required_count) * 10, 1)
    else:
        points = 0
        
    points = min(points, 10.0)  # max 10
    
    breakdown = {
        "logged_slots": logged_required_count,
        "required_slots": required_count,
        "points_per_slot": round(10 / required_count, 2) if required_count else 0,
        "extras_logged": len(slots_logged - required_slots)
    }

    conn.execute(
        "INSERT OR REPLACE INTO daily_points (date, points, breakdown) VALUES (?, ?, ?)",
        (log_date, points, json.dumps(breakdown))
    )
    conn.commit()
    conn.close()


# ─── PERSONAL TRAINER CHAT ENDPOINTS ──────────────────────

def _calculate_streak(conn, up_to_date):
    """Calculate current consecutive logging streak up to a given date."""
    streak = 0
    from datetime import timedelta
    check_date = date.fromisoformat(up_to_date)
    while True:
        count = conn.execute(
            "SELECT COUNT(*) FROM meal_logs WHERE date = ?",
            (check_date.isoformat(),)
        ).fetchone()[0]
        if count == 0:
            break
        streak += 1
        check_date -= timedelta(days=1)
    return streak


def _get_or_create_session(conn, log_date):
    """Get or create a coach session for the given date, with fresh calorie snapshot."""
    logs = conn.execute(
        "SELECT calories, protein FROM meal_logs WHERE date = ?", (log_date,)
    ).fetchall()
    goal = conn.execute(
        "SELECT calorie_goal FROM daily_goals WHERE date = ?", (log_date,)
    ).fetchone()

    calorie_goal = goal["calorie_goal"] if goal else 2000
    calories_consumed = round(sum(l["calories"] for l in logs), 1)
    protein_consumed = round(sum(l["protein"] for l in logs), 1)
    calories_remaining = max(0, calorie_goal - calories_consumed)
    cal_pct = (calories_consumed / calorie_goal * 100) if calorie_goal > 0 else 0
    goal_status = "red" if cal_pct > 100 else "yellow" if cal_pct >= 90 else "green"
    streak_days = _calculate_streak(conn, log_date)

    # Upsert session — always refresh calorie snapshot
    conn.execute("""
        INSERT INTO coach_sessions (date, calorie_goal, calories_consumed,
            calories_remaining, protein_consumed, streak_days, goal_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
            calorie_goal=excluded.calorie_goal,
            calories_consumed=excluded.calories_consumed,
            calories_remaining=excluded.calories_remaining,
            protein_consumed=excluded.protein_consumed,
            streak_days=excluded.streak_days,
            goal_status=excluded.goal_status
    """, (log_date, calorie_goal, calories_consumed,
          calories_remaining, protein_consumed, streak_days, goal_status))
    conn.commit()

    return {
        "date": log_date,
        "calorie_goal": calorie_goal,
        "calories_consumed": calories_consumed,
        "calories_remaining": calories_remaining,
        "protein_consumed": protein_consumed,
        "streak_days": streak_days,
        "goal_status": goal_status
    }


@diet_tracker_bp.route("/api/tracker/ai-chat/<log_date>", methods=["GET"])
def api_get_coach_history(log_date):
    """Load the full coach session + message history for a given date."""
    conn = get_db()
    session = _get_or_create_session(conn, log_date)
    messages = conn.execute(
        "SELECT role, content, created_at FROM coach_messages WHERE session_date = ? ORDER BY id",
        (log_date,)
    ).fetchall()
    conn.close()

    return jsonify({
        "success": True,
        "session": session,
        "messages": [dict(m) for m in messages]
    })


@diet_tracker_bp.route("/api/tracker/ai-chat", methods=["POST"])
def api_ai_chat():
    """Persistent Personal Trainer: saves every message, streams AI response."""
    data = request.get_json()
    query = data.get("query", "").strip()
    log_date = data.get("date", date.today().isoformat())

    if not query:
        return jsonify({"error": "Query cannot be empty."}), 400

    if 'Client' not in dir():
        try:
            from ollama import Client as _Client
        except ImportError:
            return jsonify({"error": "ollama Python library not installed. Run: pip install ollama"}), 500
    else:
        _Client = Client

    # ── 1. Build full context from DB ──────────────────────
    conn = get_db()
    session = _get_or_create_session(conn, log_date)

    logs = conn.execute(
        "SELECT slot_name, food_name, quantity_g, calories, protein, carbs, fat "
        "FROM meal_logs WHERE date = ? ORDER BY logged_at", (log_date,)
    ).fetchall()

    goal_row = conn.execute(
        "SELECT protein_goal, carbs_goal, fat_goal FROM daily_goals WHERE date = ?",
        (log_date,)
    ).fetchone()
    protein_goal = goal_row["protein_goal"] if goal_row else 80
    carbs_goal = goal_row["carbs_goal"] if goal_row else 250
    fat_goal = goal_row["fat_goal"] if goal_row else 65

    # Previous messages this session (for AI context continuity)
    prev_messages = conn.execute(
        "SELECT role, content FROM coach_messages WHERE session_date = ? ORDER BY id",
        (log_date,)
    ).fetchall()

    # ── 2. Save user message to DB ─────────────────────────
    conn.execute(
        "INSERT INTO coach_messages (session_date, role, content) VALUES (?, 'user', ?)",
        (log_date, query)
    )
    conn.commit()
    conn.close()

    # ── 3. Build AI message list ───────────────────────────
    meals_lines = [f"- {l['slot_name']}: {l['food_name']} ({l['quantity_g']}g) "
                   f"→ {l['calories']} kcal | P:{l['protein']}g C:{l['carbs']}g F:{l['fat']}g"
                   for l in logs] or ["No food logged yet today."]

    streak_text = f"{session['streak_days']} day streak 🔥" if session['streak_days'] > 0 else "No active streak yet."

    system_prompt = f"""You are HawkAI, a professional, motivational, and data-driven Indian Personal Diet Trainer.
You are helping the user with their diet progress today ({log_date}). Keep answers concise, actionable, and friendly. Do NOT format as code or markdown unless needed.

═══ TODAY'S STATS ═══
🎯 Goals : {session['calorie_goal']} kcal | P:{protein_goal}g | C:{carbs_goal}g | F:{fat_goal}g
✅ Eaten  : {session['calories_consumed']} kcal | P:{session['protein_consumed']}g
⬜ Left   : {session['calories_remaining']} kcal
🔥 Streak : {streak_text}
📊 Status : {'On track' if session['goal_status'] == 'green' else 'Approaching limit' if session['goal_status'] == 'yellow' else 'Over calorie goal'}

╌ Foods logged today ╌
{chr(10).join(meals_lines)}
═══════════════════════════

Respond directly to the user's inquiry based strictly on this context. Answer clearly and concisely."""

    # Build conversation history for multi-turn within the day
    ai_messages = [{'role': 'system', 'content': system_prompt}]
    for m in prev_messages:
        ai_messages.append({'role': m['role'], 'content': m['content']})
    ai_messages.append({'role': 'user', 'content': query})

    # ── 4. Stream response and save completed reply to DB ──
    api_key = os.environ.get('OLLAMA_API_KEY')
    try:
        client = _Client(
            host=OLLAMA_HOST,
            headers={'Authorization': 'Bearer ' + api_key} if api_key else None
        )
    except Exception as e:
        return jsonify({"error": f"Could not connect to Ollama: {str(e)}"}), 500

    def generate():
        full_response = []
        try:
            for part in client.chat(OLLAMA_MODEL, messages=ai_messages, stream=True):
                content = part.get('message', {}).get('content', '')
                if content:
                    full_response.append(content)
                    yield f"data: {json.dumps({'text': content})}\n\n"
        except Exception as stream_e:
            yield f"data: {json.dumps({'error': str(stream_e)})}\n\n"
        finally:
            # Save the complete AI response to DB after stream ends
            if full_response:
                complete_reply = ''.join(full_response)
                try:
                    save_conn = get_db()
                    save_conn.execute(
                        "INSERT INTO coach_messages (session_date, role, content) VALUES (?, 'assistant', ?)",
                        (log_date, complete_reply)
                    )
                    save_conn.commit()
                    save_conn.close()
                except Exception:
                    pass  # Don't crash the stream if save fails

        yield "data: [DONE]\n\n"

    return Response(stream_with_context(generate()), mimetype='text/event-stream')



# ─── DEMO FRONTEND ─────────────────────────────────────────

@diet_tracker_bp.route("/diet-tracker")
def serve_demo():
    """Serve the demo diet tracker frontend."""
    return send_from_directory(DEMO_DIR, "index.html")


@diet_tracker_bp.route("/diet-tracker/<path:filename>")
def serve_demo_static(filename):
    """Serve demo static files."""
    return send_from_directory(DEMO_DIR, filename)
