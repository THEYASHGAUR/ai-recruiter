import os
import uuid
import shutil


def save_upload_file(upload_file, folder: str = "uploads") -> str:
    os.makedirs(folder, exist_ok=True)
    ext = os.path.splitext(upload_file.filename)[1] or ".pdf"
    file_id = f"{uuid.uuid4()}{ext}"
    path = os.path.join(folder, file_id)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return path
