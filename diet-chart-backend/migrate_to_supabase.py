import os
from dotenv import load_dotenv
from app import app
from models import db, User, DietPlan, ChatMessage
import sqlite3

# Load environment variables from the correct directory
backend_dir = r"c:\Users\profe\OneDrive\Desktop\HawkAI\diet-chart-backend"
load_dotenv(os.path.join(backend_dir, '.env'), override=True)

def migrate():
    print("Initializing Supabase Migration...")
    db_url = os.getenv("DATABASE_URL")
    if "sqlite" in db_url:
        print("Error: DATABASE_URL is still pointing to SQLite. Please update your .env file with the database password.")
        return

    print(f"Connecting to: {db_url.split('@')[-1]}") # print only host for safety

    try:
        with app.app_context():
            # Create tables
            print("Creating tables in Supabase...")
            db.create_all()
            print("Tables created successfully or already exist.")

            # Optional: Migrate existing data from SQLite
            sqlite_db = os.path.join(backend_dir, 'instance', 'user_sessions.db')
            if not os.path.exists(sqlite_db):
                 # Check root dir too just in case
                 sqlite_db = os.path.join(backend_dir, 'user_sessions.db')

            if os.path.exists(sqlite_db):
                print(f"Found local SQLite database at {sqlite_db}. Attempting to migrate data...")
                conn = sqlite3.connect(sqlite_db)
                cursor = conn.cursor()

                # Migrate Users
                cursor.execute("SELECT id, session_id, age, gender, height, weight, goal, activity_level, diet_type, cuisine, allergies, health_conditions, meals_per_day FROM users")
                users = cursor.fetchall()
                print(f"Found {len(users)} users to migrate.")

                for u in users:
                    if not User.query.get(u[0]):
                        user = User(
                            id=u[0], session_id=u[1], age=u[2], gender=u[3],
                            height=u[4], weight=u[5], goal=u[6],
                            activity_level=u[7], diet_type=u[8], cuisine=u[9],
                            allergies=u[10], health_conditions=u[11], meals_per_day=u[12]
                        )
                        db.session.add(user)
                db.session.commit()

                # Migrate DietPlans
                cursor.execute("SELECT id, user_id, diet_plan_text FROM diet_plans")
                plans = cursor.fetchall()
                print(f"Found {len(plans)} diet plans to migrate.")
                for p in plans:
                     if not DietPlan.query.get(p[0]):
                         plan = DietPlan(id=p[0], user_id=p[1], diet_plan_text=p[2])
                         db.session.add(plan)
                db.session.commit()

                # Migrate ChatMessages
                cursor.execute("SELECT id, user_id, role, content FROM chat_messages")
                msgs = cursor.fetchall()
                print(f"Found {len(msgs)} chat messages to migrate.")
                for m in msgs:
                     if not ChatMessage.query.get(m[0]):
                         msg = ChatMessage(id=m[0], user_id=m[1], role=m[2], content=m[3])
                         db.session.add(msg)
                db.session.commit()

                conn.close()
                print("Data migration complete.")
            else:
                print("No local SQLite database found to migrate. Fresh setup complete.")

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
