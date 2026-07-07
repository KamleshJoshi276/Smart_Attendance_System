import os
from datetime import datetime, date

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from backend.extensions import db, socketio
from backend.models import Student, Attendance
from backend.services.utils import save_base64_image
from backend.services.face_verification import verify_face

attendance_bp = Blueprint(
    "attendance",
    __name__,
    url_prefix="/api/attendance"
)


@attendance_bp.route('/mark', methods=['POST'])
@jwt_required()
def mark_attendance():

    user_id = int(get_jwt_identity())
    claims = get_jwt()

    if claims["type"] != "student":
        return jsonify({
            "message": "Only students can mark attendance"
        }), 403

    data = request.json or {}

    image_data = data.get("image")
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    # Location Required
    if latitude is None or longitude is None:
        return jsonify({
            "message": "Location permission is required."
        }), 400

    # Image Required
    if not image_data:
        return jsonify({
            "message": "Image required"
        }), 400

    student = Student.query.get(user_id)

    if not student:
        return jsonify({
            "message": "Student not found"
        }), 404

    today = date.today()

    existing = Attendance.query.filter_by(
        student_id=student.id,
        date=today
    ).first()

    if existing:
        return jsonify({
            "message": "Attendance already marked for today"
        }), 409

    # Face Verification
    if not verify_face(image_data, student.student_id):
        return jsonify({
            "message": "Face verification failed"
        }), 403

    image_path = save_base64_image(
        image_data,
        "attendance"
    )

    attendance = Attendance(
        student_id=student.id,
        date=today,
        time=datetime.now().time(),
        image_path=image_path,
        latitude=latitude,
        longitude=longitude
    )

    db.session.add(attendance)
    db.session.commit()

    attendance_data = {
        "student_name": student.name,
        "student_id": student.student_id,
        "date": today.isoformat(),
        "time": attendance.time.strftime("%H:%M:%S"),
        "latitude": attendance.latitude,
        "longitude": attendance.longitude,
        "image_url": request.host_url.rstrip("/") +
        "/uploads/attendance/" +
        os.path.basename(image_path)
    }

    socketio.emit(
        "attendance_update",
        attendance_data
    )

    return jsonify({
        "message": "Attendance marked successfully",
        "attendance": attendance_data
    }), 201


@attendance_bp.route('/list', methods=['GET'])
@jwt_required()
def list_attendance():
    
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    user_type = claims["type"]

    student_name = request.args.get("student_name")
    student_id = request.args.get("student_id")
    date_filter = request.args.get("date")

    query = Attendance.query.join(Student)

    if user_type == "student":
        query = query.filter(Attendance.student_id == user_id)

    if student_name:
        query = query.filter(Student.name.ilike(f"%{student_name}%"))

    if student_id:
        query = query.filter(Student.student_id.ilike(f"%{student_id}%"))

    if date_filter:
        try:
            parsed = datetime.strptime(
                date_filter,
                "%Y-%m-%d"
            ).date()

            query = query.filter(
                Attendance.date == parsed
            )

        except ValueError:
            return jsonify({
                "message": "Invalid date format. Use YYYY-MM-DD."
            }), 400

    records = query.order_by(
        Attendance.date.desc(),
        Attendance.time.desc()
    ).all()

    result = []

    for item in records:

        result.append({

            "id": item.id,

            "student_name": item.student.name,

            "student_id": item.student.student_id,

            "date": item.date.isoformat(),

            "time": item.time.strftime("%H:%M:%S"),

            "latitude": item.latitude,

            "longitude": item.longitude,

            "map_url": (
                f"https://www.google.com/maps?q="
                f"{item.latitude},{item.longitude}"
            ) if item.latitude and item.longitude else None,

            "image_url": request.host_url.rstrip("/")
            + "/uploads/attendance/"
            + os.path.basename(item.image_path)

        })

    return jsonify(result), 200


@attendance_bp.route('/stats', methods=['GET'])
@jwt_required()
def attendance_stats():

    claims = get_jwt()

    if claims["type"] != "teacher":
        return jsonify({
            "message": "Unauthorized"
        }), 403

    total_students = Student.query.count()

    present_today = Attendance.query.filter(
        Attendance.date == date.today()
    ).count()

    absent_today = total_students - present_today

    percentage = round(
        (present_today / total_students) * 100,
        1
    ) if total_students else 0

    return jsonify({

        "total_students": total_students,

        "present_today": present_today,

        "absent_today": absent_today,

        "attendance_percentage": percentage

    }), 200