from app import app
from models import db, User, DietPlan

def initialize_database():
    with app.app_context():
        print("Creating database tables...")
        try:
            db.create_all()
            print("Tables created successfully.")
        except Exception as e:
            print(f"Error creating tables: {e}")
            print("\nPlease ensure your database is running and credentials in `.env` are correct.")

if __name__ == "__main__":
    initialize_database()
