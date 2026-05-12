from flask_sqlalchemy import SQLAlchemy
#from sqlalchemy import UniqueConstraint
#from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    role     = db.Column(db.String, nullable=False, default="student")