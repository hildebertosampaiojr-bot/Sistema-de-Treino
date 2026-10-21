from contextlib import closing
from datetime import datetime

import mysql.connector
from flask import Blueprint, jsonify, request

from src.config.database import get_connection

progress_bp = Blueprint("progress", __name__)


@progress_bp.get("/api/users/<int:user_id>/load-records")
def list_load_records(user_id):
    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(
                    """SELECT id, user_id, exercise_name, weight_kg,
                              DATE_FORMAT(performed_at, '%Y-%m-%dT%H:%i:%s') AS performed_at,
                              workout_day
                       FROM exercise_load_records
                       WHERE user_id = %s
                       ORDER BY performed_at DESC, id DESC
                       LIMIT 2000""",
                    (user_id,),
                )
                rows = cursor.fetchall()
            finally:
                cursor.close()
        for row in rows:
            row["weight_kg"] = float(row["weight_kg"])
        return jsonify(rows)
    except mysql.connector.Error:
        return jsonify({"error": "Nao foi possivel consultar a evolucao de cargas."}), 503


@progress_bp.post("/api/users/<int:user_id>/load-records")
def create_load_record(user_id):
    data = request.get_json(silent=True) or {}
    exercise_name = str(data.get("exercise_name", "")).strip()
    try:
        weight = float(data.get("weight_kg"))
    except (TypeError, ValueError):
        return jsonify({"error": "Informe uma carga numerica."}), 400
    workout_day = data.get("workout_day") or None

    if not exercise_name or len(exercise_name) > 160:
        return jsonify({"error": "Informe um exercicio valido."}), 400
    if not 0.1 <= weight <= 1000:
        return jsonify({"error": "A carga deve estar entre 0,1 e 1000 kg."}), 400
    if workout_day not in {None, "seg", "ter", "qua", "qui", "sex", "sab", "dom"}:
        return jsonify({"error": "Dia de treino invalido."}), 400

    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
                if cursor.fetchone() is None:
                    return jsonify({"error": "Usuario nao encontrado."}), 404
                cursor.execute(
                    "INSERT INTO exercise_load_records (user_id, exercise_name, weight_kg, workout_day) VALUES (%s, %s, %s, %s)",
                    (user_id, exercise_name, weight, workout_day),
                )
                record_id = cursor.lastrowid
                connection.commit()
                cursor.execute(
                    """SELECT id, user_id, exercise_name, weight_kg,
                              DATE_FORMAT(performed_at, '%Y-%m-%dT%H:%i:%s') AS performed_at,
                              workout_day
                       FROM exercise_load_records WHERE id = %s""",
                    (record_id,),
                )
                row = cursor.fetchone()
            finally:
                cursor.close()
        row["weight_kg"] = float(row["weight_kg"])
        return jsonify(row), 201
    except mysql.connector.Error:
        return jsonify({"error": "Nao foi possivel salvar a carga no banco de dados."}), 503
@progress_bp.get("/api/users/<int:user_id>/training-days")
def list_training_days(user_id):
    month = request.args.get("month", "")
    try:
        month_start = datetime.strptime(month, "%Y-%m").date()
    except ValueError:
        return jsonify({"error": "Informe o mes no formato AAAA-MM."}), 400
    if not month:
        return jsonify({"error": "Informe o mes no formato AAAA-MM."}), 400
    if month_start.month == 12:
        next_month = month_start.replace(year=month_start.year + 1, month=1)
    else:
        next_month = month_start.replace(month=month_start.month + 1)

    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(
                    """SELECT id, DATE_FORMAT(trained_on, '%Y-%m-%d') AS trained_on,
                              workout_name, workout_day, record_source AS source
                       FROM workout_sessions
                       WHERE user_id = %s AND trained_on >= %s AND trained_on < %s
                       ORDER BY trained_on""",
                    (user_id, month_start, next_month),
                )
                rows = cursor.fetchall()
            finally:
                cursor.close()
        return jsonify(rows)
    except mysql.connector.Error:
        return jsonify({"error": "Nao foi possivel consultar o calendario de treinos."}), 503


@progress_bp.post("/api/users/<int:user_id>/training-days")
def save_training_day(user_id):
    data = request.get_json(silent=True) or {}
    try:
        trained_on = datetime.strptime(str(data.get("trained_on", "")), "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Informe uma data valida no formato AAAA-MM-DD."}), 400
    workout_name = str(data.get("workout_name", "Treino concluido")).strip() or "Treino concluido"
    workout_day = data.get("workout_day") or None
    source = data.get("source", "manual")
    if len(workout_name) > 100:
        return jsonify({"error": "O nome do treino deve ter ate 100 caracteres."}), 400
    if workout_day not in {None, "seg", "ter", "qua", "qui", "sex", "sab", "dom"}:
        return jsonify({"error": "Dia da semana invalido."}), 400
    if source not in {"manual", "completed"}:
        return jsonify({"error": "Origem do registro invalida."}), 400

    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(
                    """INSERT INTO workout_sessions (user_id, trained_on, workout_name, workout_day, record_source)
                       VALUES (%s, %s, %s, %s, %s)
                       ON DUPLICATE KEY UPDATE workout_name = VALUES(workout_name),
                         workout_day = VALUES(workout_day), record_source = VALUES(record_source), updated_at = CURRENT_TIMESTAMP""",
                    (user_id, trained_on, workout_name, workout_day, source),
                )
                connection.commit()
                cursor.execute(
                    """SELECT id, DATE_FORMAT(trained_on, '%Y-%m-%d') AS trained_on,
                              workout_name, workout_day, record_source AS source
                       FROM workout_sessions WHERE user_id = %s AND trained_on = %s""",
                    (user_id, trained_on),
                )
                row = cursor.fetchone()
            finally:
                cursor.close()
        return jsonify(row), 201
    except mysql.connector.Error:
        return jsonify({"error": "Nao foi possivel salvar o dia de treino no banco de dados."}), 503