import os
from dotenv import load_dotenv
from app import app
from models import db, User, DietPlan, ChatMessage

backend_dir = r"c:\Users\profe\OneDrive\Desktop\HawkAI\diet-chart-backend"
load_dotenv(os.path.join(backend_dir, '.env'), override=True)

def verify():
    with app.app_context():
        print("--- Supabase Table Row Counts ---")
        print(f"Users: {User.query.count()}")
        print(f"Diet Plans: {DietPlan.query.count()}")
        print(f"Chat Messages: {ChatMessage.query.count()}")
        print("---------------------------------")

if __name__ == "__main__":
    verify()
