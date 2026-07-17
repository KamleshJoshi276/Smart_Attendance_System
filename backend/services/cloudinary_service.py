import os
import shutil
from urllib.request import urlopen

import cloudinary
import cloudinary.uploader


def configure_cloudinary():
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
    api_key = os.getenv("CLOUDINARY_API_KEY", "").strip()
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "").strip()

    if not all([cloud_name, api_key, api_secret]):
        return False

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )
    return True


def is_cloudinary_configured():
    return configure_cloudinary()


def upload_base64_image(image_base64, public_id):
    if not is_cloudinary_configured():
        return None

    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    result = cloudinary.uploader.upload(
        "data:image/jpeg;base64," + image_base64,
        folder="smart_attendance/profile",
        public_id=public_id,
        overwrite=True,
        resource_type="image",
    )

    return result.get("secure_url")


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
        overwrite=True,
        resource_type="image",
    )

    return result.get("secure_url")


def download_image_to_local(image_url, destination_path):
    if not is_cloudinary_configured() or not image_url:
        return False

    try:
        os.makedirs(os.path.dirname(destination_path), exist_ok=True)
        with urlopen(image_url) as response, open(destination_path, "wb") as destination:
            shutil.copyfileobj(response, destination)
        return True
    except Exception:
        return False