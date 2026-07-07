import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-key')
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:Kamlesh%40123@localhost:3306/smart_attendance"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    PROFILE_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'profile')
    ATTENDANCE_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'attendance')
    FACE_MODEL_FOLDER = os.path.join(UPLOAD_FOLDER, 'face_recognition')
    FACE_MODEL_PATH = os.path.join(FACE_MODEL_FOLDER, 'lbph_model.yml')
    FACE_LABELS_PATH = os.path.join(FACE_MODEL_FOLDER, 'labels.json')
