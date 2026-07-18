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
        type="private",
        overwrite=True,
        resource_type="image",
    )

    asset_id = result.get("asset_id")
    uploaded_public_id = result.get("public_id")
    
    if not asset_id or not uploaded_public_id:
        raise RuntimeError(f"Cloudinary upload failed, missing asset_id or public_id. Response: {result}")

    print(f"[Cloudinary] Upload successful: asset_id={asset_id}, public_id={uploaded_public_id}")
    return {
        "asset_id": asset_id,
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
        type="private",
        overwrite=True,
        resource_type="image",
    )

    asset_id = result.get("asset_id")
    uploaded_public_id = result.get("public_id")
    
    if asset_id and uploaded_public_id:
        return {
            "asset_id": asset_id,
            "public_id": uploaded_public_id,
        }
    
    return None


def download_private_image(asset_id, public_id, destination_path):
    """
    Download a private image from Cloudinary using authenticated API.
    Private assets require authentication and cannot be accessed via public URLs.
    """
    if not is_cloudinary_configured() or not asset_id or not public_id:
        return False

    try:
        import urllib.request
        import base64
        
        os.makedirs(os.path.dirname(destination_path), exist_ok=True)
        
        cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
        api_key = os.getenv("CLOUDINARY_API_KEY", "").strip()
        
        download_url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/download?asset_id={asset_id}"
        
        credentials = base64.b64encode(f"{api_key}:".encode()).decode()
        
        request = urllib.request.Request(
            download_url,
            headers={"Authorization": f"Basic {credentials}"}
        )
        
        with urllib.request.urlopen(request) as response, open(destination_path, "wb") as destination:
            shutil.copyfileobj(response, destination)
        
        return True
    except Exception as e:
        print(f"[Cloudinary] Failed to download private image {asset_id}: {e}")
        return False


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