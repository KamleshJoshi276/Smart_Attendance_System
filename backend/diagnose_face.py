import os
import json
import sys

sys.path.append('D:/Smart_attendenvce_system')

from backend.app import create_app
from backend.config import Config
from backend.services.face_verification import train_recognizer, load_label_map, create_recognizer
from backend.models import Student

app = create_app()
with app.app_context():
    print('[DIAG] model path:', Config.FACE_MODEL_PATH)
    print('[DIAG] model exists:', os.path.exists(Config.FACE_MODEL_PATH))
    if os.path.exists(Config.FACE_MODEL_PATH):
        print('[DIAG] model size:', os.path.getsize(Config.FACE_MODEL_PATH))
    print('[DIAG] labels path:', Config.FACE_LABELS_PATH)
    print('[DIAG] labels exists:', os.path.exists(Config.FACE_LABELS_PATH))
    if os.path.exists(Config.FACE_LABELS_PATH):
        with open(Config.FACE_LABELS_PATH, 'r', encoding='utf-8') as f:
            labels = json.load(f)
        print('[DIAG] labels data:', labels)
        print('[DIAG] labels count:', len(labels))
    students = Student.query.filter(Student.profile_image.isnot(None)).all()
    print('[DIAG] students with profile_image:', len(students))
    for s in students[:10]:
        print('[DIAG] student', s.student_id, 'profile_image=', s.profile_image, 'exists=', os.path.exists(s.profile_image) if s.profile_image else None)
    try:
        result = train_recognizer()
        print('[DIAG] train_recognizer returned:', result)
    except Exception as e:
        print('[DIAG] train_recognizer exception:', repr(e))
    print('[DIAG] labels after train:', load_label_map())
    if os.path.exists(Config.FACE_MODEL_PATH):
        print('[DIAG] model size after train:', os.path.getsize(Config.FACE_MODEL_PATH))
    try:
        recognizer = create_recognizer()
        recognizer.read(Config.FACE_MODEL_PATH)
        print('[DIAG] recognizer.read OK')
    except Exception as e:
        print('[DIAG] recognizer.read failed:', repr(e))
