from cryptography.fernet import Fernet
import os

def get_fernet():
    key = os.getenv("ENCRYPTION_KEY")
    return Fernet(key.encode())

def encrypt_password(password: str) -> str:
    f = get_fernet()
    return f.encrypt(password.encode()).decode()

def decrypt_password(encrypted: str) -> str:
    f = get_fernet()
    return f.decrypt(encrypted.encode()).decode()