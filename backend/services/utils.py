import os
import base64
import uuid
from backend.config import Config


def ensure_directories():
    os.makedirs(Config.PROFILE_UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(Config.ATTENDANCE_UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(Config.FACE_MODEL_FOLDER, exist_ok=True)


def save_base64_image(image_base64: str, folder: str, filename: str = None) -> str:
    if ',' in image_base64:
        image_base64 = image_base64.split(',', 1)[1]
    data = base64.b64decode(image_base64)
    if folder == 'profile':
        directory = Config.PROFILE_UPLOAD_FOLDER
    elif folder == 'attendance':
        directory = Config.ATTENDANCE_UPLOAD_FOLDER
    elif folder == 'face':
        directory = Config.FACE_MODEL_FOLDER
    else:
        raise ValueError('Invalid folder specified for image saving')

    os.makedirs(directory, exist_ok=True)
    if filename:
        if not filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            filename = f"{filename}.jpg"
    else:
        filename = f"{uuid.uuid4().hex}.jpg"
    filepath = os.path.join(directory, filename)
    with open(filepath, 'wb') as f:
        f.write(data)
    return filepath
