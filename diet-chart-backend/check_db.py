import sqlite3
import os

DB_PATH = r"C:\Users\profe\OneDrive\Desktop\HawkAI\hawk_diet.db"

def check():
    if not os.path.exists(DB_PATH):
        print("DB not found")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Checking database structure...")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    print("Tables:", cursor.fetchall())
    
    print("\nChecking sample data (Rice)...")
    cursor.execute("""
        SELECT f.description, n.name, fn.amount, n.unit_name
        FROM food f
        JOIN food_nutrient fn ON f.fdc_id = fn.fdc_id
        JOIN nutrient n ON fn.nutrient_id = n.nutrient_id
        WHERE f.description LIKE '%Rice%'
        LIMIT 10
    """)
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    
    conn.close()

if __name__ == "__main__":
    check()
