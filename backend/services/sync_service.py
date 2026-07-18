import os
from sqlalchemy import text

from backend.config import Config
from backend.extensions import db
from backend.models import Student
from backend.services.cloudinary_service import download_image_to_local, upload_local_image, download_private_image
from backend.services.utils import ensure_directories


def ensure_database_schema():
    if not db.engine or not db.engine.url:
        return

    try:
        inspector = db.inspect(db.engine)
        columns = {column["name"] for column in inspector.get_columns("students")}
    except Exception:
        return

    if "cloudinary_asset_id" not in columns:
        db.session.execute(
            text("ALTER TABLE students ADD COLUMN cloudinary_asset_id VARCHAR(256)")
        )
        db.session.commit()

    if "cloudinary_public_id" not in columns:
        db.session.execute(
            text("ALTER TABLE students ADD COLUMN cloudinary_public_id VARCHAR(256)")
        )
        db.session.commit()


def sync_student_profile_images():
    """
    Sync student profile images from Cloudinary on startup.
    
    1. For students with cloudinary_asset_id and cloudinary_public_id, download from Cloudinary.
    2. Restore images to backend/uploads/profile/.
    3. Retrain LBPH face recognition model.
    """
    ensure_directories()

    students = Student.query.filter(
        (Student.cloudinary_asset_id.isnot(None)) & (Student.cloudinary_public_id.isnot(None))
    ).all()

    downloaded_count = 0
    for student in students:
        filename = f"{student.student_id}.jpg"
        local_path = os.path.join(Config.PROFILE_UPLOAD_FOLDER, filename)
        
        if os.path.exists(local_path):
            student.profile_image = local_path
            continue
        
        if download_private_image(student.cloudinary_asset_id, student.cloudinary_public_id, local_path):
            student.profile_image = local_path
            downloaded_count += 1
            print(f"[Sync] Downloaded profile image for {student.student_id}")
        else:
            print(f"[Sync] Failed to download profile image for {student.student_id}")

    if downloaded_count > 0:
        db.session.commit()
        print(f"[Sync] Downloaded {downloaded_count} profile images from Cloudinary")
    elif any(student.profile_image for student in students):
        db.session.commit()
