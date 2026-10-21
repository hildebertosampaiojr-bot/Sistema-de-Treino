from contextlib import closing

import mysql.connector
from flask import Blueprint, jsonify, request

from src.config.database import get_connection

users_bp = Blueprint("users", __name__)

USER_FIELDS = "id, name, display_name, goal, weight_kg, height_m"


def serialize_user(row):
    row["weight_kg"] = float(row["weight_kg"]) if row["weight_kg"] is not None else None
    row["height_m"] = float(row["height_m"]) if row["height_m"] is not None else None
    return row


@users_bp.get("/api/users")
def list_users():
    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(f"SELECT {USER_FIELDS} FROM users ORDER BY id")
                users = [serialize_user(row) for row in cursor.fetchall()]
            finally:
                cursor.close()
        return jsonify(users)
    except mysql.connector.Error:
        return jsonify({"error": "Não foi possível consultar os usuários no banco de dados."}), 503


@users_bp.get("/api/users/<int:user_id>")
def get_user(user_id):
    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(
                    f"SELECT {USER_FIELDS} FROM users WHERE id = %s",
                    (user_id,),
                )
                user = cursor.fetchone()
            finally:
                cursor.close()
        if user is None:
            return jsonify({"error": "Usuário não encontrado."}), 404
        return jsonify(serialize_user(user))
    except mysql.connector.Error:
        return jsonify({"error": "Não foi possível consultar o usuário no banco de dados."}), 503

@users_bp.put("/api/users/<int:user_id>/measurements")
def update_user_measurements(user_id):
    data = request.get_json(silent=True) or {}
    try:
        weight = float(data.get("weight_kg"))
        height = float(data.get("height_m"))
    except (TypeError, ValueError):
        return jsonify({"error": "Informe peso e altura numericos."}), 400

    if not (20 <= weight <= 400) or not (0.8 <= height <= 2.5):
        return jsonify({"error": "Peso ou altura fora do intervalo permitido."}), 400

    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute("UPDATE users SET weight_kg = %s, height_m = %s WHERE id = %s", (weight, height, user_id))
                if cursor.rowcount == 0:
                    cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
                    if cursor.fetchone() is None:
                        return jsonify({"error": "Usuario nao encontrado."}), 404
                connection.commit()
                cursor.execute(f"SELECT {USER_FIELDS} FROM users WHERE id = %s", (user_id,))
                user = cursor.fetchone()
            finally:
                cursor.close()
        return jsonify(serialize_user(user))
    except mysql.connector.Error:
        return jsonify({"error": "Nao foi possivel atualizar as medidas no banco de dados."}), 503
@users_bp.put("/api/users/<int:user_id>/profile")
def update_user_profile(user_id):
    data = request.get_json(silent=True) or {}
    display_name = str(data.get("display_name", "")).strip()
    if not display_name or len(display_name) > 80:
        return jsonify({"error": "Informe um nome de perfil com ate 80 caracteres."}), 400
    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute("UPDATE users SET display_name = %s WHERE id = %s", (display_name, user_id))
                if cursor.rowcount == 0:
                    cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
                    if cursor.fetchone() is None:
                        return jsonify({"error": "Usuario nao encontrado."}), 404
                connection.commit()
                cursor.execute(f"SELECT {USER_FIELDS} FROM users WHERE id = %s", (user_id,))
                user = cursor.fetchone()
            finally:
                cursor.close()
        return jsonify(serialize_user(user))
    except mysql.connector.Error:
        return jsonify({"error": "Nao foi possivel atualizar o perfil no banco de dados."}), 503
@users_bp.get("/api/users/<int:user_id>/profile")
def get_user_profile(user_id):
    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(
                    "SELECT id, name, display_name, profile_photo_data FROM users WHERE id = %s",
                    (user_id,),
                )
                user = cursor.fetchone()
            finally:
                cursor.close()
        if user is None:
            return jsonify({"error": "Usuario nao encontrado."}), 404
        return jsonify(user)
    except mysql.connector.Error:
        return jsonify({"error": "Nao foi possivel consultar o perfil."}), 503


@users_bp.put("/api/users/<int:user_id>/profile-photo")
def update_user_profile_photo(user_id):
    data = request.get_json(silent=True) or {}
    photo_data = data.get("photo_data")
    if photo_data is not None:
        allowed_prefixes = ("data:image/jpeg;base64,", "data:image/png;base64,", "data:image/webp;base64,")
        if not isinstance(photo_data, str) or not photo_data.startswith(allowed_prefixes) or len(photo_data) > 400000:
            return jsonify({"error": "Envie uma foto JPEG, PNG ou WebP de ate 300 KB."}), 400
    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor()
            try:
                cursor.execute("UPDATE users SET profile_photo_data = %s WHERE id = %s", (photo_data, user_id))
                if cursor.rowcount == 0:
                    cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
                    if cursor.fetchone() is None:
                        return jsonify({"error": "Usuario nao encontrado."}), 404
                connection.commit()
            finally:
                cursor.close()
        return jsonify({"user_id": user_id, "photo_saved": photo_data is not None})
    except mysql.connector.Error:
        return jsonify({"error": "Nao foi possivel salvar a foto no banco de dados."}), 503