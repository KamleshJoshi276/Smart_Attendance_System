import os
from sqlalchemy import text

from backend.config import Config
from backend.extensions import db
from backend.models import Student
from backend.services.cloudinary_service import download_image_to_local, upload_local_image
from backend.services.utils import ensure_directories


def ensure_database_schema():
    if not db.engine or not db.engine.url:
        return

    try:
        inspector = db.inspect(db.engine)
        columns = {column["name"] for column in inspector.get_columns("students")}
    except Exception:
        return

    if "cloudinary_image_url" not in columns:
        db.session.execute(
            text("ALTER TABLE students ADD COLUMN cloudinary_image_url VARCHAR(512)")
        )
        db.session.commit()


def sync_student_profile_images():
    ensure_directories()

    students = Student.query.filter(
        (Student.profile_image.isnot(None)) | (Student.cloudinary_image_url.isnot(None))
    ).all()

    for student in students:
        local_path = None

        if student.profile_image and os.path.exists(student.profile_image):
            local_path = student.profile_image
        elif student.cloudinary_image_url:
            filename = f"{student.student_id}.jpg"
            local_path = os.path.join(Config.PROFILE_UPLOAD_FOLDER, filename)
            if download_image_to_local(student.cloudinary_image_url, local_path):
                student.profile_image = local_path
            else:
                continue

        if local_path and os.path.exists(local_path):
            student.profile_image = local_path
            if not student.cloudinary_image_url:
                cloudinary_url = upload_local_image(
                    local_path,
                    public_id=f"student_{student.student_id}",
                )
                if cloudinary_url:
                    student.cloudinary_image_url = cloudinary_url

    db.session.commit()
