import os
import shutil
from urllib.request import urlopen

import cloudinary
import cloudinary.uploader

_cloudinary_configured = None


def configure_cloudinary():
    global _cloudinary_configured
    if _cloudinary_configured is not None:
        return _cloudinary_configured

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
    api_key = os.getenv("CLOUDINARY_API_KEY", "").strip()
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "").strip()

    missing = []
    if not cloud_name:
        missing.append("CLOUDINARY_CLOUD_NAME")
    if not api_key:
        missing.append("CLOUDINARY_API_KEY")
    if not api_secret:
        missing.append("CLOUDINARY_API_SECRET")

    if missing:
        _cloudinary_configured = False
        return False

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )
    _cloudinary_configured = True
    return True


def is_cloudinary_configured():
    return configure_cloudinary()


def upload_base64_image(image_base64, public_id):
    if not is_cloudinary_configured():
        raise RuntimeError(
            "Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
        )

    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    result = cloudinary.uploader.upload(
        "data:image/jpeg;base64," + image_base64,
        folder="smart_attendance/profile",
        public_id=public_id,
        type="upload",
        overwrite=True,
        resource_type="image",
    )

    secure_url = result.get("secure_url")
    uploaded_public_id = result.get("public_id")
    
    if not secure_url or not uploaded_public_id:
        raise RuntimeError(f"Cloudinary upload failed, missing secure_url or public_id. Response: {result}")

    print(f"[Cloudinary] Upload successful: {secure_url}")
    return {
        "secure_url": secure_url,
        "public_id": uploaded_public_id,
    }


def upload_local_image(local_path, public_id=None):
    if not is_cloudinary_configured():
        return None

    if not local_path or not os.path.exists(local_path):
        return None

    public_id = public_id or os.path.splitext(os.path.basename(local_path))[0]

    result = cloudinary.uploader.upload(
        local_path,
        folder="smart_attendance/profile",
        public_id=public_id,
        type="upload",
        overwrite=True,
        resource_type="image",
    )

    secure_url = result.get("secure_url")
    uploaded_public_id = result.get("public_id")
    
    if secure_url and uploaded_public_id:
        return {
            "secure_url": secure_url,
            "public_id": uploaded_public_id,
        }
    
    return None


def download_image_to_local(image_url, destination_path):
    if not image_url:
        return False

    try:
        os.makedirs(os.path.dirname(destination_path), exist_ok=True)
        with urlopen(image_url) as response, open(destination_path, "wb") as destination:
            shutil.copyfileobj(response, destination)
        return True
    except Exception:
        return False
    if not image_url:
        return False

    try:
        os.makedirs(os.path.dirname(destination_path), exist_ok=True)
        with urlopen(image_url) as response, open(destination_path, "wb") as destination:
            shutil.copyfileobj(response, destination)
        return True
    except Exception:
        return False