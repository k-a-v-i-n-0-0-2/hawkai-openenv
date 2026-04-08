# HawkAI — Diet Chart Backend

The **HawkAI Diet Chart Backend** is a Flask-powered API providing the intelligence behind the HawkAI personalized nutrition platform. It calculates health metrics, processes regional food data, and generates AI-driven diet plans.

## 🚀 Key Responsibilities

- **Metrics Calculation**: Automated BMI, BMR, and TDEE based on user profiles.
- **Regional Diets**: Specialized logic for 28 Indian states, including Tamil Nadu, Kerala, Punjab, and Maharashtra.
- **AI Integration**: Official **Ollama Chat API** and Google Gemini for dynamic diet chart generation.
- **State-Specific Menus**: `india_foods.py` contains tailored meal plans for various cuisines.
- **AI Streaming**: Supports Server-Sent Events (SSE) for a "live" plan generation experience.

## 🛠️ Technology Stack

- **Python 3.10+**
- **Flask**: Web framework for API routes.
- **SQLAlchemy**: ORM for SQLite (local) and Supabase (production).
- **Ollama**: Official Python client for local/cloud AI generation.
- **python-docx**: Data extraction utility for Word document datasets.

## ⚡ Getting Started

### 1. Installation
```bash
pip install -r requirements.txt
```

### 2. Environment Configuration
Create a `.env` file in the `diet-chart-backend` directory:
```env
OLLAMA_API_KEY=your_ollama_key_here
OLLAMA_HOST=http://localhost:11434/
OLLAMA_MODEL=gpt-oss:120b-cloud
DATABASE_URL=sqlite:///hawkai.db
FLASK_SECRET_KEY=your_secret_key
```

### 3. Database Initialization
```python
python init_db.py
```

### 4. Run the Server
```bash
python app.py
```
The backend will be available at `http://localhost:5000`.

## 📡 API Endpoints

- **`GET /health`**: Connectivity check.
- **`POST /generate`**: Generate a new diet plan based on user profile.
- **`POST /chat`**: Ask follow-up questions to the AI nutritionist.
- **`POST /modify-diet`**: Request adjustments to an existing diet plan.

---

<p align="center">
  Part of the <b>HawkAI</b> Ecosystem
</p>
