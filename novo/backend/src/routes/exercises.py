from contextlib import closing

import mysql.connector
from flask import Blueprint, jsonify, request

from src.config.database import get_connection

exercises_bp = Blueprint("exercises", __name__)
VALID_DAYS = {"seg", "ter", "qua", "qui", "sex", "sab", "dom"}


@exercises_bp.get("/api/exercise-categories")
def list_categories():
    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(
                    "SELECT id, name, sort_order FROM exercise_categories ORDER BY sort_order, id"
                )
                categories = cursor.fetchall()
            finally:
                cursor.close()
        return jsonify(categories)
    except mysql.connector.Error:
        return jsonify({"error": "Não foi possível consultar as categorias no banco de dados."}), 503


@exercises_bp.get("/api/exercises")
def list_exercises():
    category_id = request.args.get("categoria_id", type=int)
    raw_category_id = request.args.get("categoria_id")
    if raw_category_id and category_id is None:
        return jsonify({"error": "categoria_id deve ser um número inteiro."}), 400

    search = request.args.get("busca", "").strip()
    conditions = []
    values = []
    if category_id is not None:
        conditions.append("e.category_id = %s")
        values.append(category_id)
    if search:
        conditions.append("e.name LIKE %s")
        values.append(f"%{search}%")
    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    sql = f"""
        SELECT e.id, e.category_id, c.name AS category, e.name, e.sort_order,
               image.media_url AS image_url, image.source_name AS image_source,
               image.source_url AS image_source_url,
               image.license_name AS image_license,
               image.attribution AS image_attribution,
               animation.media_url AS gif_url, animation.source_name AS gif_source,
               animation.source_url AS gif_source_url,
               animation.license_name AS gif_license,
               animation.attribution AS gif_attribution
        FROM exercises AS e
        INNER JOIN exercise_categories AS c ON c.id = e.category_id
        LEFT JOIN exercise_media AS image
               ON image.exercise_id = e.id AND image.media_type = 'image'
        LEFT JOIN exercise_media AS animation
               ON animation.exercise_id = e.id AND animation.media_type = 'gif'
        {where_clause}
        ORDER BY c.sort_order, e.sort_order, e.id
    """
    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(sql, tuple(values))
                exercises = cursor.fetchall()
            finally:
                cursor.close()
        return jsonify(exercises)
    except mysql.connector.Error:
        return jsonify({"error": "Não foi possível consultar os exercícios no banco de dados."}), 503


def get_user_workout_exercises(user_id):
    day = request.args.get("dia")
    if day and day not in VALID_DAYS:
        return jsonify({"error": "Dia inválido. Use seg, ter, qua, qui, sex, sab ou dom."}), 400

    where_day = "AND w.day_of_week = %s" if day else ""
    values = (user_id, day) if day else (user_id,)
    sql = f"""
        SELECT w.id AS workout_id, w.user_id, u.name AS user_name,
               w.day_of_week, w.name AS workout_name,
               e.id AS exercise_id, e.name AS exercise_name,
               c.name AS category, we.sets, we.reps, we.rest_seconds,
               we.notes, we.sort_order,
               NULL AS image_url, NULL AS gif_url
        FROM workouts AS w
        INNER JOIN users AS u ON u.id = w.user_id
        LEFT JOIN workout_exercises AS we ON we.workout_id = w.id
        LEFT JOIN exercises AS e ON e.id = we.exercise_id
        LEFT JOIN exercise_categories AS c ON c.id = e.category_id
        WHERE w.user_id = %s {where_day}
        ORDER BY FIELD(w.day_of_week, 'seg','ter','qua','qui','sex','sab','dom'),
                 we.sort_order, we.id
    """
    try:
        with closing(get_connection()) as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(sql, values)
                workout_exercises = cursor.fetchall()
            finally:
                cursor.close()
        return jsonify(workout_exercises)
    except mysql.connector.Error:
        return jsonify({"error": "Não foi possível consultar os treinos no banco de dados."}), 503


@exercises_bp.get("/api/users/<int:user_id>/workouts")
def list_user_workouts(user_id):
    return get_user_workout_exercises(user_id)


@exercises_bp.get("/api/users/<int:user_id>/exercises")
def list_user_workout_exercises(user_id):
    return get_user_workout_exercises(user_id)
