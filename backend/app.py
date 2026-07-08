import os
import sys
from flask import Flask, jsonify, send_from_directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.config import Config
from backend.extensions import init_extensions, db, socketio
from backend.routes.auth import auth_bp
from backend.routes.attendance import attendance_bp
from backend.routes.admin import admin_bp
from backend.services.face_verification import ensure_face_directories, train_recognizer

def create_app():
    app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')

    print("STATIC FOLDER:", app.static_folder)
    print("INDEX EXISTS:", os.path.exists(os.path.join(app.static_folder, "index.html")))

    app.config.from_object(Config)
    init_extensions(app)

    with app.app_context():
        ensure_face_directories()
        # db.create_all()   # Commented for TiDB
        train_recognizer()

    app.register_blueprint(auth_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(admin_bp)

    @app.route('/uploads/profile/<filename>')
    def profile_image(filename):
        return send_from_directory(app.config['PROFILE_UPLOAD_FOLDER'], filename)

    @app.route('/uploads/attendance/<filename>')
    def attendance_image(filename):
        return send_from_directory(app.config['ATTENDANCE_UPLOAD_FOLDER'], filename)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        if os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')
    @app.errorhandler(404)
    def handle_404(e):
        return jsonify({'message': 'Resource not found'}), 404

    return app
app = create_app()

if __name__ == '__main__':
    socketio.run(
        app,
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=True
    )