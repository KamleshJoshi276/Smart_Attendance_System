import os
import json
import base64
import cv2
import numpy as np
from backend.config import Config
from backend.services.utils import ensure_directories

CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
FACE_CASCADE = cv2.CascadeClassifier(CASCADE_PATH)
CONFIDENCE_THRESHOLD = 80.0


def ensure_face_directories():
    ensure_directories()
    os.makedirs(Config.FACE_MODEL_FOLDER, exist_ok=True)


def decode_base64_image(image_base64: str) -> np.ndarray | None:
    if ',' in image_base64:
        image_base64 = image_base64.split(',', 1)[1]
    try:
        image_data = base64.b64decode(image_base64)
        image_array = np.frombuffer(image_data, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        return image
    except Exception:
        return None


def extract_face(image: np.ndarray) -> np.ndarray | None:
    if image is None:
        return None
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = FACE_CASCADE.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))
    if len(faces) == 0:
        return None
    x, y, w, h = faces[0]
    face = gray[y:y+h, x:x+w]
    return cv2.resize(face, (200, 200))


def load_label_map() -> dict[str, int] | None:
    if not os.path.exists(Config.FACE_LABELS_PATH):
        return None
    with open(Config.FACE_LABELS_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_label_map(label_map: dict[str, int]) -> None:
    with open(Config.FACE_LABELS_PATH, 'w', encoding='utf-8') as f:
        json.dump(label_map, f)


def create_recognizer() -> cv2.face_LBPHFaceRecognizer:
    return cv2.face.LBPHFaceRecognizer_create()


def train_recognizer() -> bool:
    from backend.models import Student

    ensure_face_directories()
    students = Student.query.filter(Student.profile_image.isnot(None)).all()
    samples = []
    labels: list[int] = []
    label_map: dict[str, int] = {}
    next_label = 0

    for student in students:
        if not student.profile_image or not os.path.exists(student.profile_image):
            continue
        image = cv2.imread(student.profile_image)
        face = extract_face(image)
        if face is None:
            continue
        if student.student_id not in label_map:
            label_map[student.student_id] = next_label
            next_label += 1
        samples.append(face)
        labels.append(label_map[student.student_id])

    if not samples or not labels:
        return False

    recognizer = create_recognizer()
    recognizer.train(samples, np.array(labels, dtype=np.int32))
    recognizer.write(Config.FACE_MODEL_PATH)
    save_label_map(label_map)
    return True


def verify_face(captured_image_base64: str, expected_student_id: str) -> bool:
    ensure_face_directories()
    image = decode_base64_image(captured_image_base64)
    face = extract_face(image)
    if face is None:
        return False

    label_map = load_label_map()
    if not label_map or not os.path.exists(Config.FACE_MODEL_PATH):
        return False

    recognizer = create_recognizer()
    recognizer.read(Config.FACE_MODEL_PATH)
    label, confidence = recognizer.predict(face)
    print("=================================")
    print("Predicted Label :", label)
    print("Confidence      :", confidence)
    print("Expected Student:", expected_student_id)
    print("Label Map       :", label_map)
    print("=================================")
    student_id = None
    for sid, lid in label_map.items():
        if int(lid) == int(label):
            student_id = sid
            break

    if student_id != expected_student_id:
        return False

    return confidence <= CONFIDENCE_THRESHOLD