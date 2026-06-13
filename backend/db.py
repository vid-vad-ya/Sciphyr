import os
import json

DATABASE_URL = os.environ.get("DATABASE_URL", "")

# Use PostgreSQL if DATABASE_URL is set (production), else SQLite (local dev)
USE_POSTGRES = DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres")

if USE_POSTGRES:
    import psycopg2
    import psycopg2.extras

    def get_conn():
        return psycopg2.connect(DATABASE_URL)

    def init_db():
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id         SERIAL PRIMARY KEY,
                name       TEXT NOT NULL,
                email      TEXT UNIQUE NOT NULL,
                password   TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id          SERIAL PRIMARY KEY,
                user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
                lens        TEXT NOT NULL,
                paper_names TEXT[],
                result_json JSONB,
                created_at  TIMESTAMPTZ DEFAULT NOW()
            );
        """)
        conn.commit(); cur.close(); conn.close()

else:
    import sqlite3

    DB_PATH = os.path.join(os.path.dirname(__file__), "sciphyr.db")

    def get_conn():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db():
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name       TEXT NOT NULL,
                email      TEXT UNIQUE NOT NULL,
                password   TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER REFERENCES users(id),
                lens        TEXT NOT NULL,
                paper_names TEXT,
                result_json TEXT,
                created_at  TEXT DEFAULT (datetime('now'))
            );
        """)
        conn.commit(); cur.close(); conn.close()
