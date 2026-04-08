import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TRACKER_DB = os.path.join(BASE_DIR, "diet_tracker.db")

def migrate_tracker():
    if not os.path.exists(TRACKER_DB):
        print("diet_tracker.db not found!")
        return
    conn = sqlite3.connect(TRACKER_DB)
    cur = conn.cursor()
    
    # 1. Create AI enrichment table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS ai_food_enrichments (
            food_id TEXT PRIMARY KEY,
            iron_per_100g REAL DEFAULT 0,
            calcium_per_100g REAL DEFAULT 0,
            vit_a_per_100g REAL DEFAULT 0,
            vit_c_per_100g REAL DEFAULT 0,
            potassium_per_100g REAL DEFAULT 0,
            measures_json TEXT DEFAULT '{}',
            last_updated TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)
    print("Ensured ai_food_enrichments table exists.")
    
    # 2. Add columns to meal_logs
    columns_to_add = [
        ("iron", "REAL DEFAULT 0"),
        ("calcium", "REAL DEFAULT 0"),
        ("vit_a", "REAL DEFAULT 0"),
        ("vit_c", "REAL DEFAULT 0"),
        ("potassium", "REAL DEFAULT 0"),
    ]
    
    for col_name, col_def in columns_to_add:
        try:
            cur.execute(f"ALTER TABLE meal_logs ADD COLUMN {col_name} {col_def}")
            print(f"Added {col_name} to diet_tracker.db meal_logs")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col_name} already exists in diet_tracker.db")
            else:
                print(f"Error adding {col_name} to diet_tracker.db: {e}")
                
    conn.commit()
    conn.close()

if __name__ == "__main__":
    print("Migrating diet_tracker.db...")
    migrate_tracker()
    print("Migration complete.")
