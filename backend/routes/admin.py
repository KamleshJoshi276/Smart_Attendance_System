import os
import traceback
from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
import csv
from io import BytesIO, StringIO

from backend.extensions import db
from backend.models import Student, Attendance
from backend.services.utils import save_base64_image
from backend.services.face_verification import train_recognizer
from backend.services.cloudinary_service import upload_base64_image

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def teacher_required():
    claims = get_jwt()

    if claims.get("type") != "teacher":
        return False

    return True

@admin_bp.route('/student', methods=['POST'])
@jwt_required()

def add_student():
    if not teacher_required():
        return jsonify({'message': 'Teacher authorization required'}), 403

    data = request.json or {}
    student_id = data.get('student_id')
    name = data.get('name')
    password = data.get('password')
    profile_image = data.get('profile_image')

    if not student_id or not name or not password or not profile_image:
        return jsonify({'message': 'Missing required fields'}), 400

    if Student.query.filter_by(student_id=student_id).first():
        return jsonify({'message': 'Student already exists'}), 409

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
        cloudinary_secure_url=cloudinary_data.get('secure_url'),
        cloudinary_public_id=cloudinary_data.get('public_id'),
    )
    student.set_password(password)
    db.session.add(student)
    db.session.commit()

    train_recognizer()
    return jsonify({'message': 'Student created'}), 201


@admin_bp.route('/student/<int:student_id>', methods=['PUT'])
@jwt_required()
def edit_student(student_id):
    if not teacher_required():
        return jsonify({'message': 'Teacher authorization required'}), 403

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'message': 'Student not found'}), 404

    data = request.json or {}
    student.name = data.get('name', student.name)
    new_student_id = data.get('student_id')
    if new_student_id:
        if Student.query.filter(Student.student_id == new_student_id, Student.id != student.id).first():
            return jsonify({'message': 'Student ID already used'}), 409
        student.student_id = new_student_id
    if data.get('password'):
        student.set_password(data['password'])
    if data.get('profile_image'):
        student.profile_image = save_base64_image(data['profile_image'], 'profile', filename=student.student_id)
        try:
            cloudinary_data = upload_base64_image(data['profile_image'], public_id=student.student_id)
            student.cloudinary_secure_url = cloudinary_data.get('secure_url')
            student.cloudinary_public_id = cloudinary_data.get('public_id')
        except Exception:
            traceback.print_exc()
            return jsonify({'message': 'Cloudinary upload failed. See server logs.'}), 500

    db.session.commit()
    train_recognizer()
    return jsonify({'message': 'Student updated'}), 200


@admin_bp.route('/student/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_student(student_id):
    if not teacher_required():
        return jsonify({'message': 'Teacher authorization required'}), 403

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'message': 'Student not found'}), 404

    Attendance.query.filter_by(student_id=student.id).delete()
    db.session.delete(student)
    db.session.commit()
    train_recognizer()
    return jsonify({'message': 'Student deleted'}), 200

# ============================
# Get All Students
# ============================

@admin_bp.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    if not teacher_required():
        return jsonify({'message': 'Teacher authorization required'}), 403

    students = Student.query.order_by(Student.name).all()

    data = []

    for student in students:
        profile_url = None

        if student.profile_image:
            profile_url = (
                request.host_url.rstrip("/")
                + "/uploads/profile/"
                + os.path.basename(student.profile_image)
            )

        data.append({
            "id": student.id,
            "student_id": student.student_id,
            "name": student.name,
            "profile_image": profile_url
        })

    return jsonify(data), 200


# ============================
# Export Attendance CSV
# ============================

@admin_bp.route('/attendance/export', methods=['GET'])
@jwt_required()
def export_attendance():
    if not teacher_required():
        return jsonify({'message': 'Teacher authorization required'}), 403

    records = (
        Attendance.query
        .join(Student)
        .order_by(Attendance.date.desc(), Attendance.time.desc())
        .all()
    )

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        'Student Name',
        'Student ID',
        'Date',
        'Time',
        'Image Path'
    ])

    for record in records:
        writer.writerow([
            record.student.name,
            record.student.student_id,
            record.date.isoformat(),
            record.time.strftime('%H:%M:%S'),
            os.path.basename(record.image_path)
        ])

    buffer = BytesIO(output.getvalue().encode("utf-8"))
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype="text/csv",
        download_name="attendance_export.csv",
        as_attachment=True
    )
