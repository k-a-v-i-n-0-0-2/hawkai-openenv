# HawkAI — Personalized AI Nutrition and Diet Planning

<div align="center">
  <img src="https://img.shields.io/badge/Tech-React%20%7C%20Flask%20%7C%20Ionic-blue?style=for-the-badge" alt="Tech Stack" />
  <img src="https://img.shields.io/badge/Internal-v1.0.0-green?style=for-the-badge" alt="Version" />
</div>

**HawkAI** is a comprehensive fitness and nutrition ecosystem designed specifically for the diverse dietary landscapes of India. By combining state-of-the-art AI (using Ollama and Gemini) with regional food data for 28 Indian states, HawkAI provides hyper-personalized diet charts and real-time nutritional guidance.

## 🚀 Repository Structure

The project is organized into modular components:

- **[`fitpulse/`](./fitpulse)**: The frontend application built with **React**, **Vite**, and **Tailwind CSS**. It provides a sleek, responsive interface for users to input their stats and receive diet plans.
- **[`diet-chart-backend/`](./diet-chart-backend)**: The core intelligence layer built with **Flask**, **SQLAlchemy**, and **Ollama**. It handles BMI/TDEE calculations and generates diet plans using AI.
- **[`extract_docx.py`](./extract_docx.py)**: A data extraction utility that processes regional food datasets from Microsoft Word documents.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Motion (formerly Framer Motion)
- **Components**: Lucide React, Recharts
- **Platform**: Ionic/Capacitor for mobile deployment

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite (local) / Supabase (production)
- **AI Integration**: Ollama (official Python client), Google Gemini
- **Architecture**: RESTful API with Server-Sent Events (SSE) for streaming AI responses

## ⚡ Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python 3.10+](https://www.python.org/)
- [Ollama](https://ollama.com/) (running locally or configured via API key)

### 2. Backend Setup
```bash
cd diet-chart-backend
pip install -r requirements.txt
# Configure your .env file
python app.py
```
The backend will run at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd fitpulse
npm install
npm run dev
```
The frontend will run at `http://localhost:3000`.

## 🥗 Key Features

- **Regional Food Data**: Supports specialized diets for 28 Indian states, including Tamil Nadu, Kerala, and Punjab.
- **AI-Powered Chat**: Ask follow-up questions about your diet plan through an interactive AI assistant.
- **Streaming Responses**: Real-time generation of diet plans for a "live" feel.
- **Mobile Ready**: Capacitor configuration allows for easy deployment as an Android/iOS app.

---

<p align="center">
  Developed by <b>Kavin M</b> | HawkAI Startup
</p>

## 🏆 Meta PyTorch Hackathon (Round 1) - OpenEnv Submission

This repository has been updated to comply with the **OpenEnv** specification for the Round 1 submission.

### 📁 OpenEnv Structure
- **`openenv.yaml`**: Environment specification (action/observation spaces, tasks).
- **`openenv_server/`**: FastAPI implementation of the environment logic (`reset`, `step`, `state`).
- **`inference.py`**: Baseline inference script using the OpenAI client with required `[START]`, `[STEP]`, `[END]` logging.
- **`Dockerfile`**: Containerization for Hugging Face Spaces.

### 🛠️ How to run locally
1. **Start the Environment Server**:
   ```bash
   uvicorn openenv_server.app:app --host 0.0.0.0 --port 7860
   ```
2. **Run Inference**:
   Open a new terminal and run:
   ```bash
   # Make sure to set environment variables if using a remote LLM
   export API_BASE_URL="https://api.openai.com/v1"
   export MODEL_NAME="gpt-3.5-turbo"
   export HF_TOKEN="your_token_here"
   # To test locally, the ENV_URL in inference.py is currently pointing to http://127.0.0.1:7860
   python inference.py
   ```

### ✅ Pre-Submission Checklist
- [x] Must simulate a real-world task (Personalized Indian Diet Planning).
- [x] Implement full OpenEnv spec (`openenv.yaml`, `step`/`reset`/`state` endpoints).
- [x] Minimum 3 tasks with agent graders (Easy, Medium, Hard).
- [x] Meaningful reward function (0.0 - 1.0).
- [x] Baseline inference script (`inference.py`) with reproducible scores.
- [x] `Dockerfile` included for HF Spaces deployment.
- [x] README with environment description and action/observation spaces.
