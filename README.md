# EduSense — Student Performance Prediction Platform

An AI-powered EdTech platform that predicts student performance and helps educators intervene early.

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Flask + Python
- **ML Model**: CatBoost (R² = 0.8433)
- **Explainability**: SHAP
- **AI Layer**: Gemini 1.5 Pro
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth

## Features
- 🔮 Predict math scores before exams
- 🧠 SHAP explainability — understand why
- 🚨 Automatic early alerts for educators
- 🤖 Gemini AI academic advisor for students
- 📊 Prediction history and trend tracking
- 🔐 Role-based access (Student / Educator / Admin)

## Running Locally

### Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

### Frontend
cd frontend
npm install
npm run dev
