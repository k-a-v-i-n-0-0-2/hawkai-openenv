<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HawkAI — FitPulse Frontend

This is the user-facing web and mobile interface for the **HawkAI** nutrition platform. Built with **React 19**, **Vite**, and **Tailwind CSS**, it features a modern, interactive design for tracking fitness stats and viewing AI-generated diet plans.

## 🚀 Key Features

- **Personalized Onboarding**: Input your age, gender, height, weight, activity level, and goal.
- **Regional Selection**: Choose your favorite Indian cuisines (e.g., South Indian, North Indian) and specific states for tailored food suggestions.
- **Interactive Reports**: View your BMI, BMR, and TDEE in real-time.
- **AI Chatbot**: A dedicated assistant for nutritional advice and diet plan modifications.
- **Dynamic Charts**: Nutritional breakdowns and progress visualizations.

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: (Version 18.0 or higher recommended)
- **Git**

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root of the `fitpulse` directory and add your API keys:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Locally
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 📦 Building for Production

### Web
```bash
npm run build
```

### Mobile (Capacitor)
To sync changes and build for Android/iOS:
```bash
npx cap sync
npx cap open android # or ios
```

## 🎨 Design System
- **Styling**: Tailwind CSS v4.0 for utility-first responsive design.
- **Animations**: `motion` for smooth UI transitions and micro-interactions.
- **Icons**: `lucide-react` for a consistent visual language.

---

<p align="center">
  Part of the <b>HawkAI</b> Ecosystem
</p>
