import os
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import math
import random
import json
import traceback
from dotenv import load_dotenv
from ollama import Client  # Added official ollama library
from models import db, User, DietPlan, ChatMessage
from tn_foods import TN_FOODS, MILLET_DATA, KEERAI_DATA
from india_foods import (
    INDIA_FOODS, get_foods_by_state, get_foods_for_cuisine,
    build_multi_state_menu, get_states_for_cuisine, get_all_states
)
import diet_engine
import json
import re
from diet_tracker import diet_tracker_bp

def parse_float(val, default):
    try:
        if isinstance(val, str):
            num_str = re.sub(r'[^\d.]', '', val)
            if num_str:
                return float(num_str)
        return float(val) if val is not None else default
    except (ValueError, TypeError):
        return default

def parse_int(val, default):
    try:
        if isinstance(val, str):
            num_str = re.sub(r'[^\d]', '', val)
            if num_str:
                return int(num_str)
        return int(val) if val is not None else default
    except (ValueError, TypeError):
        return default


load_dotenv(override=True)

app = Flask(__name__)
app.register_blueprint(diet_tracker_bp)
CORS(app, resources={r"/*": {"origins": "*"}})

# Handle SQLite absolute paths on Render/Docker
db_url = os.getenv('DATABASE_URL', 'sqlite:///hawkai.db')

if db_url.startswith('sqlite:///'):
    db_name = db_url.replace('sqlite:///', '')
    db_url = f"sqlite:///{os.path.join(app.root_path, db_name)}"
    print(f" * Absolute pathified SQLite to: {db_url}")

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')

db.init_app(app)

# Ensure instance folder exists for SQLite fallback on Render
os.makedirs(os.path.join(app.root_path, 'instance'), exist_ok=True)

with app.app_context():
    db.create_all()

OLLAMA_API_KEY = os.getenv('OLLAMA_API_KEY')
OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'https://api.ollama.com' if OLLAMA_API_KEY else 'http://localhost:11434')
MODEL_NAME = os.getenv('OLLAMA_MODEL', 'gpt-oss:120b-cloud' if OLLAMA_API_KEY else 'gpt-oss:120b-cloud')


# ──────────────────────────────────────────────
#  Metric Calculators
# ──────────────────────────────────────────────

def calculate_bmi(weight, height_cm):
    height_m = height_cm / 100
    return round(weight / (height_m ** 2), 1)

def calculate_bmr(weight, height_cm, age, gender):
    if gender.lower() == "male":
        bmr = 10 * weight + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height_cm - 5 * age - 161
    return round(bmr)

def calculate_tdee(bmr, activity_level):
    multipliers = {
        "sedentary": 1.2,
        "lightly active": 1.375,
        "moderately active": 1.55,
        "very active": 1.725,
    }
    return round(bmr * multipliers.get(activity_level.lower(), 1.2))


# ──────────────────────────────────────────────
#  Tamil Nadu Food Knowledge Builder
# ──────────────────────────────────────────────

def build_food_menu(goal, diet_type, cuisine, state=None):
    """Build a concise food menu string from the 28-state India food database.
    Uses specific state if provided, otherwise falls back to regional defaults."""
    cuisine_pref = (cuisine or "South Indian").strip()
    diet_lower = (diet_type or "Vegetarian").strip()

    # ── Use new multi-state database (pass state if known) ──
    menu = build_multi_state_menu(cuisine_pref, diet_lower, limit=25, specific_state=state)

    # ── Append TN-specific extras if state is Tamil Nadu ──
    if state and "tamil nadu" in state.lower():
        lines = [menu]
        # Millet/Greens data (TN-specific enrichment)
        lines.append("\n### TN Special - Millet/Greens Options:")
        for name, data in list(MILLET_DATA.items())[:3]:
            lines.append(f"- **{name}**: {data['calories']} kcal | P:{data['protein']}g")
        
        # Cheat meals
        is_veg = "veg" in diet_lower.lower() and "non" not in diet_lower.lower()
        meat_keywords = ["chicken", "mutton", "fish", "egg", "meen", "kari"]
        cheat_foods = [f for f in TN_FOODS if f[6] == "cheat"]
        if is_veg:
            cheat_foods = [f for f in cheat_foods if not any(kw in f[0].lower() for kw in meat_keywords)]
        lines.append("\n### TN Special - Cheat Meal Options:")
        for food in cheat_foods[:3]:
            lines.append(f"- **{food[0]}**: {food[1]} kcal | {food[7]}")
        return "\n".join(lines)

    return menu


# ──────────────────────────────────────────────
#  Ollama Call Helpers (using official library)
# ──────────────────────────────────────────────

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "5f002b5166b5498d95d357bb67023619.67oQ56o2FkUFGSuZJ1cW2_Qr")

def get_ollama_client():
    headers = {}
    if OLLAMA_API_KEY:
        headers["Authorization"] = f"Bearer {OLLAMA_API_KEY}"
    return Client(host=OLLAMA_HOST, headers=headers)

def call_ollama(prompt):
    """Make call to Ollama using official library with streaming."""
    try:
        client = get_ollama_client()
        print(f"[HawkAI] Calling Ollama generate (stream=True) model={MODEL_NAME}")

        full_response = []
        for part in client.generate(
            model=MODEL_NAME,
            prompt=prompt,
            stream=True
            # Removed options to avoid potential cloud bridge compatibility issues
        ):
            chunk = part.get("response", "")
            if chunk:
                full_response.append(chunk)
                # print(".", end="", flush=True) # Optional: chunk logging

        response_text = "".join(full_response)
        print(f"\n[HawkAI] Response success. Total Length: {len(response_text)}")
        
        if not response_text or not response_text.strip():
            return "⚠️ The AI model returned an empty response. Please try again or click Modify Diet."
        return response_text

    except Exception as e:
        print(f"[HawkAI] Ollama Client Error: {str(e)}")
        return f"Ollama Connection Failed: {str(e)}"

def call_ollama_chat(messages):
    """Make call to Ollama chat using official library with streaming."""
    try:
        client = get_ollama_client()
        print(f"[HawkAI] Calling Ollama chat (stream=True) model={MODEL_NAME}")

        full_response = []
        for part in client.chat(
            model=MODEL_NAME,
            messages=messages,
            stream=True,
            options={
                "temperature": 0.7,
                "num_predict": 2048,
            }
        ):
            chunk = part.get("message", {}).get("content", "")
            if chunk:
                full_response.append(chunk)

        response_text = "".join(full_response)
        print(f"[HawkAI] Chat response success. Length: {len(response_text)}")
        
        if not response_text or not response_text.strip():
            return "⚠️ The AI model returned an empty response. Please try again."
        return response_text

    except Exception as e:
        print(f"[HawkAI] Ollama Chat Client Error: {str(e)}")
        return f"Ollama Connection Failed: {str(e)}"




# ──────────────────────────────────────────────
#  Prompt Builders
# ──────────────────────────────────────────────

def build_diet_prompt(data, bmi, bmr, tdee, rec_cal, protein_target, blood_report=None):
    """Build a focused diet plan prompt with embedded food data."""

    cuisine = data.get("cuisine", "South Indian")
    goal = data.get("goal", "Maintenance")
    diet_type = data.get("diet_type", "Non-Vegetarian")

    # Build real food menu from our database
    state = data.get("state")
    food_menu = build_food_menu(goal, diet_type, cuisine, state=state)
    
    # Identify region label for the prompt
    region_label = cuisine if cuisine else "Indian"
    states_used = [state] if state else get_states_for_cuisine(cuisine or "South Indian")
    states_str = ", ".join(states_used[:3])

    prompt = f"""You are HawkAI, an expert {region_label} nutritionist. Create a 7-day diet plan.

## User Stats
- Age: {data.get("age")} | Gender: {data.get("gender")} | Height: {data.get("height")}cm | Weight: {data.get("weight")}kg
- BMI: {bmi} | BMR: {bmr} kcal | TDEE: {tdee} kcal
- Daily Target: **{rec_cal} kcal** | Protein Target: **{protein_target}g**
- Goal: **{goal}** | Diet: **{diet_type}** | Cuisine: **{cuisine}** (States: {states_str})
- Meals/Day: {data.get("meals_per_day", 4)} | Allergies: {data.get("allergies", "None")} | Health: {data.get("health_conditions", "None")}

{food_menu}

## Your Task
Create a **7-day meal plan** (Monday to Sunday) using the foods listed above. For each day write:

### Day 1 — Monday
| Meal | Food Items | Calories | Protein |
|------|-----------|----------|---------|
| Breakfast | ... | ... | ... |
| Lunch | ... | ... | ... |
| Snack | ... | ... | ... |
| Dinner | ... | ... | ... |
| **Total** | | **~{rec_cal} kcal** | **~{protein_target}g** |

After the 7-day plan, add:
- **Hydration**: Daily water intake recommendation
- **Pre/Post Workout**: What to eat before and after workouts
- **Cheat Meal Guide**: 1 cheat meal per week from the options listed
- **Key Tips**: 3-4 tips specific to {goal} with {region_label} diet

IMPORTANT: Use ONLY the {region_label} foods listed above. Each day total should be close to {rec_cal} kcal. Use markdown tables and headers."""

    if blood_report:
        prompt += f"\n\nBlood Report: {json.dumps(blood_report)} — check for deficiencies and adjust recommendations."

    return prompt


def build_chat_prompt(question, user_data):
    """Build a concise chat prompt for follow-up questions."""
    profile_str = ""
    if user_data:
        profile_str = f"User: {user_data.get('age')}yo {user_data.get('gender')}, {user_data.get('weight')}kg, Goal: {user_data.get('goal')}, Diet: {user_data.get('diet_type')}, Cuisine: {user_data.get('cuisine')}"

    cuisine = user_data.get("cuisine", "South Indian") if user_data else "Indian"

    return f"""You are HawkAI, a friendly {cuisine} diet expert. Answer concisely using markdown.

{profile_str}

## Your Mission
1. Provide helpful, specific answers based on the user's stats and current diet plan context (provided if available).
2. Use bullet points and bold for key items.
3. Prefer {cuisine} regional options/traditional dishes.
4. **Crucial**: If the user asks to change or swap something in their diet (e.g., a cheat meal, a breakfast item), acknowledge the change specifically and provide the updated recommendation. Emphasize that you've updated their plan in the conversation history.

Current Question: {question}

Keep response under 300 words."""


# ──────────────────────────────────────────────
#  Flask Routes
# ──────────────────────────────────────────────

@app.route("/")
@app.route("/health")
def index():
    return jsonify({"status": f"HawkAI Backend is running", "healthy": True})


@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        weight = parse_float(data.get("weight"), 70.0)
        height = parse_float(data.get("height"), 170.0)
        age = parse_int(data.get("age"), 25)
        gender = data.get("gender", "Male")
        activity_level = data.get("activity_level", "Sedentary")

        bmi = calculate_bmi(weight, height)
        bmr = calculate_bmr(weight, height, age, gender)
        tdee = calculate_tdee(bmr, activity_level)

        goal = data.get("goal", "Maintenance")
        if "loss" in goal.lower(): rec_cal = tdee - 500; mult = 1.6
        elif "gain" in goal.lower(): rec_cal = tdee + 300; mult = 2.0
        else: rec_cal = tdee; mult = 1.2

        protein_target = round(weight * mult)
        blood_report = data.get("blood_report")
        # Create AI prompt outside stream thread
        prompt = build_diet_prompt(data, bmi, bmr, tdee, rec_cal, protein_target, blood_report)

        session_id = data.get("session_id", "default")

        # Save/Update User in DB (Execute on thread main)
        user = User.query.filter_by(session_id=session_id).first()
        if not user:
            user = User(session_id=session_id)
            db.session.add(user)
        
        user.age = age
        user.gender = gender
        user.height = height
        user.weight = weight
        user.goal = goal
        user.activity_level = activity_level
        user.diet_type = data.get("diet_type")
        user.cuisine = data.get("cuisine")
        user.state = data.get("state")
        user.allergies = data.get("allergies")
        user.health_conditions = data.get("health_conditions")
        if data.get("meals_per_day"):
            user.meals_per_day = parse_int(data.get("meals_per_day"), 4)

        db.session.commit()
        user_id_val = user.id  # Extract ID safely for background context

        def generate_stream():
            try:
                if not OLLAMA_API_KEY:
                    yield "❌ Error: `OLLAMA_API_KEY` is missing on Render. Please configure it in your Render environment variables dashboard.\n"
                    return

                client = get_ollama_client()
                print(f"[HawkAI] Stream Starting (chat API) for model={MODEL_NAME}...")
                full_text = ""
                
                # Ollama Cloud returns ChatResponse objects (attribute access, not dict)
                messages = [{"role": "user", "content": prompt}]
                for part in client.chat(model=MODEL_NAME, messages=messages, stream=True):
                    chunk = part.message.content if part.message else ""
                    if chunk:
                        full_text += chunk
                        yield chunk
                
                print(f"[HawkAI] Stream Finished. Length: {len(full_text)}")
                
                # Save to Database inside app context
                if full_text.strip():
                    with app.app_context():
                        diet_plan_record = DietPlan(user_id=user_id_val, diet_plan_text=full_text)
                        db.session.add(diet_plan_record)
                        db.session.commit()
                        print("[HawkAI] Streamed diet plan saved to DB.")
            except Exception as e:
                yield f"\n❌ Error during AI generation: {str(e)}\n"

        resp = Response(stream_with_context(generate_stream()), mimetype='text/event-stream')
        resp.headers['X-Accel-Buffering'] = 'no'
        resp.headers['Cache-Control'] = 'no-cache'
        return resp
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        session_id = data.get("session_id", "default")
        user_record = User.query.filter_by(session_id=session_id).first()
        user = None
        history = []
        
        if user_record:
            user = {
                "age": user_record.age,
                "gender": user_record.gender,
                "height": user_record.height,
                "weight": user_record.weight,
                "goal": user_record.goal,
                "activity_level": user_record.activity_level,
                "diet_type": user_record.diet_type,
                "cuisine": user_record.cuisine,
                "state": user_record.state,
                "allergies": user_record.allergies,
                "health_conditions": user_record.health_conditions,
                "meals_per_day": user_record.meals_per_day
            }
            # Fetch last 20 messages for context (improved memory)
            history_records = ChatMessage.query.filter_by(user_id=user_record.id).order_by(ChatMessage.id.desc()).limit(20).all()
            history = list(reversed(history_records))
            
            # Save User Message to DB
            user_msg = ChatMessage(user_id=user_record.id, role='user', content=data.get("message", ""))
            db.session.add(user_msg)
            db.session.commit()

        # Build messages for Ollama /api/chat
        user_question = data.get("message", "")
        system_prompt = build_chat_prompt(user_question, user)

        # Inject last diet plan into system prompt instead of as a separate message
        # This fixes the "roles must alternate" 400 error in Ollama
        diet_plan = DietPlan.query.filter_by(user_id=user_record.id).order_by(DietPlan.id.desc()).first() if user_record else None
        if diet_plan and diet_plan.diet_plan_text:
            plan_summary = diet_plan.diet_plan_text[:1500]
            system_prompt += f"\n\nCONTEXT - USER'S CURRENT DIET PLAN:\n{plan_summary}\n\nPlease reference this plan when the user asks for changes or clarifications."

        messages = [
            {"role": "system", "content": system_prompt}
        ]

        if history:
            for msg in history:
                messages.append({"role": "user" if msg.role == 'user' else "assistant", "content": msg.content})
        
        messages.append({"role": "user", "content": user_question})

        q_lower = user_question.lower()
        response = None

        # Rule-based fallback for standard questions if Ollama is offline
        # (diet_plan already queried above for context)
        
        if diet_plan and ("protein" in q_lower or "calor" in q_lower or "macro" in q_lower):
            try:
                plan_data = json.loads(diet_plan.diet_plan_text)
                macros = plan_data.get("macros", {})
                metrics = plan_data.get("metrics", {})
                
                if "protein" in q_lower:
                    response = f"Based on your personalized plan, you require **{macros.get('protein', 'N/A')}g** of protein daily to achieve your goal."
                elif "calor" in q_lower:
                    response = f"Your daily energy target is **{metrics.get('recommended_calories', 'N/A')} kcal**."
                elif "macro" in q_lower:
                    response = f"Your Daily Macronutrient Splits are:\n\n" \
                               f"• 🥩 **Protein:** {macros.get('protein', 'N/A')}g\n" \
                               f"• 🍞 **Carbohydrates:** {macros.get('carbs', 'N/A')}g\n" \
                               f"• 🥑 **Fats:** {macros.get('fat', 'N/A')}g"
            except Exception:
                pass

        if not response:
            try:
                response = call_ollama_chat(messages)
            except Exception:
                response = "I couldn't connect to my AI nodes right now. However, you can ask me about your **protein**, **calories**, or **macros** to receive an instant answer!"

        if user_record:
            # Save Assistant Response to DB
            assist_msg = ChatMessage(user_id=user_record.id, role='assistant', content=response)
            db.session.add(assist_msg)
            db.session.commit()

        return jsonify({"success": True, "response": response})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/modify-diet", methods=["POST"])
def modify():
    """Regenerate diet plan using stored user data from DB."""
    try:
        data = request.get_json()
        session_id = data.get("session_id", "default")
        user_record = User.query.filter_by(session_id=session_id).first()

        if not user_record:
            return jsonify({"success": False, "error": "No user profile found. Please create a new diet first."}), 404

        # Rebuild data dict from DB
        user_data = {
            "age": user_record.age,
            "gender": user_record.gender,
            "height": user_record.height,
            "weight": user_record.weight,
            "goal": user_record.goal,
            "activity_level": user_record.activity_level,
            "diet_type": user_record.diet_type,
            "cuisine": user_record.cuisine,
            "state": user_record.state,
            "allergies": user_record.allergies,
            "health_conditions": user_record.health_conditions,
            "meals_per_day": user_record.meals_per_day or 4,
        }

        weight = parse_float(user_data["weight"], 70.0)
        height = parse_float(user_data["height"], 170.0)
        age = parse_int(user_data["age"], 25)
        gender = user_data["gender"] or "Male"
        activity_level = user_data["activity_level"] or "Sedentary"

        bmi = calculate_bmi(weight, height)
        bmr = calculate_bmr(weight, height, age, gender)
        tdee = calculate_tdee(bmr, activity_level)

        goal = user_data["goal"] or "Maintenance"
        if "loss" in goal.lower(): rec_cal = tdee - 500; mult = 1.6
        elif "gain" in goal.lower(): rec_cal = tdee + 300; mult = 2.0
        else: rec_cal = tdee; mult = 1.2

        protein_target = round(weight * mult)

        # Re-build Prompt outside stream
        prompt = build_diet_prompt(user_data, bmi, bmr, tdee, rec_cal, protein_target)
        prompt += "\n\nProvide a new variation or adjustment for alternative meals."

        def generate_stream():
            try:
                if not OLLAMA_API_KEY:
                    yield "❌ Error: `OLLAMA_API_KEY` is missing on Render. Please configure it in your Render environment variables dashboard."
                    return

                client = get_ollama_client()
                print(f"[HawkAI] Modifying Diet Stream Starting (chat API) for model={MODEL_NAME}...")
                full_text = ""
                
                # Ollama Cloud returns ChatResponse objects (attribute access, not dict)
                messages = [{"role": "user", "content": prompt}]
                for part in client.chat(model=MODEL_NAME, messages=messages, stream=True):
                    chunk = part.message.content if part.message else ""
                    if chunk:
                        full_text += chunk
                        yield chunk
                
                if full_text.strip():
                    with app.app_context():
                        diet_plan_record = DietPlan(user_id=user_record.id, diet_plan_text=full_text)
                        db.session.add(diet_plan_record)
                        db.session.commit()
                        print("[HawkAI] Streamed modified diet plan saved to DB.")
            except Exception as e:
                yield f"❌ Error during AI generation: {str(e)}"

        resp = Response(stream_with_context(generate_stream()), mimetype='text/event-stream')
        resp.headers['X-Accel-Buffering'] = 'no'
        resp.headers['Cache-Control'] = 'no-cache'
        return resp
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500



@app.route("/api/sessions/history", methods=["POST"])
def get_sessions_history():
    try:
        data = request.get_json()
        session_ids = data.get("session_ids", [])
        if not session_ids:
            return jsonify({"success": True, "sessions": []})
        
        users = User.query.filter(User.session_id.in_(session_ids)).order_by(User.created_at.desc()).all()
        results = []
        for u in users:
            # Get last message date if exists
            last_msg = ChatMessage.query.filter_by(user_id=u.id).order_by(ChatMessage.id.desc()).first()
            date = last_msg.created_at if last_msg else u.created_at
            
            results.append({
                "session_id": u.session_id,
                "goal": u.goal or "General Health",
                "cuisine": u.cuisine or "Indian",
                "date": date.isoformat(),
                "has_plan": DietPlan.query.filter_by(user_id=u.id).first() is not None
            })
        return jsonify({"success": True, "sessions": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/session/<session_id>", methods=["GET"])
def get_session_data(session_id):
    try:
        user_record = User.query.filter_by(session_id=session_id).first()
        if not user_record:
            return jsonify({"success": False, "error": "Session not found"}), 404
            
        # 1. User Data
        user_data = {
            "age": user_record.age,
            "gender": user_record.gender,
            "height": user_record.height,
            "weight": user_record.weight,
            "goal": user_record.goal,
            "activity_level": user_record.activity_level,
            "diet_type": user_record.diet_type,
            "cuisine": user_record.cuisine,
            "state": user_record.state,
            "allergies": user_record.allergies,
            "health_conditions": user_record.health_conditions,
            "meals_per_day": user_record.meals_per_day
        }
        
        # 2. Diet Plan
        diet_plan = DietPlan.query.filter_by(user_id=user_record.id).order_by(DietPlan.id.desc()).first()
        plan_text = diet_plan.diet_plan_text if diet_plan else None
        
        # 3. Chat Messages
        messages = ChatMessage.query.filter_by(user_id=user_record.id).order_by(ChatMessage.id.asc()).all()
        msg_list = [{"role": msg.role, "content": msg.content} for msg in messages]
        
        return jsonify({
            "success": True, 
            "userData": user_data,
            "dietPlan": plan_text,
            "messages": msg_list,
            "phase": "chat" if plan_text else "survey"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
