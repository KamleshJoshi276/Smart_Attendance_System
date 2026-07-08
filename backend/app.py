import os
import sys
from flask import Flask, jsonify, send_from_directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.config import Config
from backend.models import Teacher
from backend.extensions import init_extensions, db, socketio
from backend.routes.auth import auth_bp
from backend.routes.attendance import attendance_bp
from backend.routes.admin import admin_bp

from backend.services.face_verification import ensure_face_directories, train_recognizer

def create_app():
    app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')

    print("STATIC FOLDER:", app.static_folder)
    print("INDEX EXISTS:", os.path.exists(os.path.join(app.static_folder, "index.html")))

    app.config.from_object(Config)
    init_extensions(app)

    with app.app_context():
     ensure_face_directories()

    # Default Admin 1
    if not Teacher.query.filter_by(teacher_id="Kamal@123").first():
        admin1 = Teacher(
            teacher_id="Kamal@123",
            name="Kamal Joshi"
        )
        admin1.set_password("Kamal@123")
        db.session.add(admin1)

    # Default Admin 2
    if not Teacher.query.filter_by(teacher_id="Ajay@123").first():
        admin2 = Teacher(
            teacher_id="Ajay@123",
            name="Ajay Rawat"
        )
        admin2.set_password("Ajay@123")
        db.session.add(admin2)

    db.session.commit()

    train_recognizer()