import pandas as pd
import sqlite3
import os
import sys

# Paths
DATA_DIR = r"C:\Users\profe\OneDrive\Desktop\HawkAI\FoodData_Central_csv_2025-12-18"
DB_PATH = r"C:\Users\profe\OneDrive\Desktop\HawkAI\hawk_diet.db"

# Nutrient IDs of interest
# 1008: Energy (kcal)
# 1003: Protein (g)
# 1004: Total lipid (fat) (g)
# 1005: Carbohydrate, by difference (g)
NUTRIENT_IDS = [1008, 1003, 1004, 1005]

def index_data():
    if not os.path.exists(DATA_DIR):
        print(f"Error: Data directory not found at {DATA_DIR}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create tables
    cursor.execute("DROP TABLE IF EXISTS food")
    cursor.execute("CREATE TABLE food (fdc_id INTEGER PRIMARY KEY, description TEXT, food_category_id INTEGER)")
    
    cursor.execute("DROP TABLE IF EXISTS nutrient")
    cursor.execute("CREATE TABLE nutrient (nutrient_id INTEGER PRIMARY KEY, name TEXT, unit_name TEXT)")
    
    cursor.execute("DROP TABLE IF EXISTS food_nutrient")
    cursor.execute("CREATE TABLE food_nutrient (fdc_id INTEGER, nutrient_id INTEGER, amount REAL)")

    # 1. Index food.csv
    print("Indexing food.csv...")
    food_df = pd.read_csv(os.path.join(DATA_DIR, "food.csv"), usecols=['fdc_id', 'description', 'food_category_id'])
    food_df.to_sql('food', conn, if_exists='append', index=False)

    # 2. Index nutrient.csv
    print("Indexing nutrient.csv...")
    nutrient_df = pd.read_csv(os.path.join(DATA_DIR, "nutrient.csv"), usecols=['id', 'name', 'unit_name'])
    nutrient_df.rename(columns={'id': 'nutrient_id'}, inplace=True)
    nutrient_df = nutrient_df[nutrient_df['nutrient_id'].isin(NUTRIENT_IDS)]
    nutrient_df.to_sql('nutrient', conn, if_exists='append', index=False)

    # 3. Index food_nutrient.csv (Chunked reading due to size)
    print("Indexing food_nutrient.csv (this may take a while)...")
    chunk_size = 100000
    nutrient_file = os.path.join(DATA_DIR, "food_nutrient.csv")
    
    # We only care about specific nutrients
    count = 0
    for chunk in pd.read_csv(nutrient_file, usecols=['fdc_id', 'nutrient_id', 'amount'], chunksize=chunk_size):
        filtered_chunk = chunk[chunk['nutrient_id'].isin(NUTRIENT_IDS)]
        filtered_chunk.to_sql('food_nutrient', conn, if_exists='append', index=False)
        count += len(chunk)
        if count % 1000000 == 0:
            print(f"Processed {count} rows...")

    # Create indexes for performance
    print("Creating indexes...")
    cursor.execute("CREATE INDEX idx_food_desc ON food(description)")
    cursor.execute("CREATE INDEX idx_fn_fdc ON food_nutrient(fdc_id)")
    
    conn.commit()
    conn.close()
    print(f"Database created successfully at {DB_PATH}")

if __name__ == "__main__":
    index_data()
