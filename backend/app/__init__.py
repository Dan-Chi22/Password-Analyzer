from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes and origins
    CORS(app, 
         resources={r"/api/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "OPTIONS"])
    
    from app.routes import api
    app.register_blueprint(api)
    
    return app