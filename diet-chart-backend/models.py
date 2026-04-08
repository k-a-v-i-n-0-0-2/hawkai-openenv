from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), unique=True, nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    height = db.Column(db.Float)
    weight = db.Column(db.Float)
    goal = db.Column(db.String(100))
    activity_level = db.Column(db.String(50))
    diet_type = db.Column(db.String(50))
    cuisine = db.Column(db.String(100))
    allergies = db.Column(db.String(200))
    health_conditions = db.Column(db.String(200))
    state = db.Column(db.String(100))
    meals_per_day = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to diet plans
    plans = db.relationship('DietPlan', backref='user', lazy=True)
    # Relationship to chat messages
    messages = db.relationship('ChatMessage', backref='user', lazy=True)

class DietPlan(db.Model):
    __tablename__ = 'diet_plans'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    diet_plan_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
