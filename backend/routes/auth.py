import os
import traceback
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

from backend.extensions import db
from backend.models import Student, Teacher
from backend.services.utils import save_base64_image, ensure_directories
from backend.services.face_verification import train_recognizer
from backend.services.cloudinary_service import upload_base64_image

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@auth_bp.route('/student/register', methods=['POST'])
def register_student():
    data = request.json or {}
    student_id = data.get('student_id')
    name = data.get('name')
    password = data.get('password')
    profile_image = data.get('profile_image')

    if not student_id or not name or not password or not profile_image:
        return jsonify({'message': 'Missing required student registration fields'}), 400

    ensure_directories()

    if Student.query.filter_by(student_id=student_id).first():
        return jsonify({'message': 'Student ID already registered'}), 409

    image_path = save_base64_image(profile_image, 'profile', filename=student_id)

    try:
        cloudinary_data = upload_base64_image(profile_image, public_id=student_id)
    except Exception:
        traceback.print_exc()
        return jsonify({'message': 'Cloudinary upload failed. See server logs.'}), 500

    student = Student(
        student_id=student_id,
        name=name,
        profile_image=image_path,
        cloudinary_asset_id=cloudinary_data.get('asset_id'),
        cloudinary_public_id=cloudinary_data.get('public_id'),
    )
    student.set_password(password)
    db.session.add(student)
    db.session.commit()

    if not train_recognizer():
        return jsonify({'message': 'Face registration failed. Unable to detect a face in the profile image.'}), 400

    return jsonify({'message': 'Student registered successfully'}), 201

@auth_bp.route('/teacher/register', methods=['POST'])
def register_teacher():
    return jsonify({
        "message": "Teacher registration is disabled. Only administrator can create teacher accounts."
    }), 403

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    user_type = data.get('user_type')
    identifier = data.get('identifier')
    password = data.get('password')

    if user_type not in ['student', 'teacher']:
        return jsonify({'message': 'Invalid user type'}), 400

    if not identifier or not password:
        return jsonify({'message': 'Identifier and password required'}), 400

    if user_type == 'student':
        user = Student.query.filter_by(student_id=identifier).first()
    else:
        user = Teacher.query.filter_by(teacher_id=identifier).first()

    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = create_access_token(
    identity=str(user.id),
    additional_claims={
        "type": user_type
    }
    )
    profile_url = None
    if user_type == 'student':
        if getattr(user, 'profile_image', None):
            profile_url = request.host_url.rstrip('/') + '/uploads/profile/' + os.path.basename(user.profile_image)
    return jsonify({
        'access_token': token,
        'user': {
            'id': user.id,
            'type': user_type,
            'name': user.name,
            'identifier': identifier,
            'profile_image': profile_url,
        }
    }), 200
