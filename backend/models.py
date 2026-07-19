from datetime import datetime
from zoneinfo import ZoneInfo
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Index
from backend.config import IST_TIMEZONE
from backend.extensions import db


def get_ist_now():
    return datetime.now(IST_TIMEZONE)

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(64), nullable=False, unique=True, index=True)
    name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    profile_image = db.Column(db.String(512), nullable=True)
    cloudinary_secure_url = db.Column(db.String(512), nullable=True)
    cloudinary_public_id = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=get_ist_now)
    attendances = db.relationship('Attendance', backref='student', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Teacher(db.Model):
    __tablename__ = 'teachers'
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.String(64), nullable=False, unique=True, index=True)
    name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=get_ist_now)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, index=True)
    time = db.Column(db.Time, nullable=False)
    image_path = db.Column(db.String(256), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=get_ist_now)

    __table_args__ = (
        Index('ix_attendance_student_date', 'student_id', 'date', unique=True),
    )
