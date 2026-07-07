from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()
socketio = SocketIO(cors_allowed_origins='*')


def init_extensions(app):
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/*": {"origins": app.config['CORS_ORIGINS']}})
    socketio.init_app(app)
