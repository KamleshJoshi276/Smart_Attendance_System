import os
from dotenv import load_dotenv

load_dotenv()


def get_database_uri():
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        return database_url

    database_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "database",
    )
    os.makedirs(database_dir, exist_ok=True)
    return f"sqlite:///{os.path.join(database_dir, 'attendance.db')}"


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "super-secret-key")
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {}
    if not SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        SQLALCHEMY_ENGINE_OPTIONS = {
            "connect_args": {
                "ssl": {}
            },
            "pool_pre_ping": True,
        }

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    PROFILE_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, "profile")
    ATTENDANCE_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, "attendance")
    FACE_MODEL_FOLDER = os.path.join(UPLOAD_FOLDER, "face_recognition")
    FACE_MODEL_PATH = os.path.join(FACE_MODEL_FOLDER, "lbph_model.yml")
    FACE_LABELS_PATH = os.path.join(FACE_MODEL_FOLDER, "labels.json")

    CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME", "").strip()
    CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY", "").strip()
    CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET", "").strip()