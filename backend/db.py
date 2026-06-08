import psycopg2
import psycopg2.extras
import os

def get_conn():
    return psycopg2.connect(os.environ.get("DATABASE_URL"))

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id        SERIAL PRIMARY KEY,
            name      TEXT NOT NULL,
            email     TEXT UNIQUE NOT NULL,
            password  TEXT NOT NULL,
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
    conn.commit()
    cur.close()
    conn.close()
