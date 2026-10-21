import os

import mysql.connector


def get_connection():
    """Abre uma conexão MySQL usando as variáveis definidas no ambiente."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "3306")),
        database=os.getenv("DB_NAME", "aoldeya_fitness"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        charset="utf8mb4",
        collation="utf8mb4_unicode_ci",
    )
