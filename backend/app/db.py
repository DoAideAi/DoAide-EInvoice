import json
import sqlite3
import time
from contextlib import contextmanager

from app.config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_data TEXT NOT NULL,
    invoice_type TEXT NOT NULL DEFAULT 'e-invoice',
    created_at REAL NOT NULL,
    ip_hash TEXT
);
CREATE TABLE IF NOT EXISTS usage_counter (
    ip_hash TEXT NOT NULL,
    month TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (ip_hash, month)
);
"""


@contextmanager
def connect():
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)


def save_invoice(invoice_id: str, data: dict, invoice_type: str, ip_hash: str) -> None:
    with connect() as conn:
        conn.execute(
            "INSERT INTO invoices (id, invoice_data, invoice_type, created_at, ip_hash) VALUES (?, ?, ?, ?, ?)",
            (invoice_id, json.dumps(data, ensure_ascii=False), invoice_type, time.time(), ip_hash),
        )


def get_invoice(invoice_id: str) -> dict | None:
    with connect() as conn:
        row = conn.execute("SELECT invoice_data FROM invoices WHERE id = ?", (invoice_id,)).fetchone()
    return json.loads(row["invoice_data"]) if row else None


def get_monthly_count(ip_hash: str) -> int:
    month = time.strftime("%Y-%m")
    with connect() as conn:
        row = conn.execute("SELECT count FROM usage_counter WHERE ip_hash = ? AND month = ?", (ip_hash, month)).fetchone()
    return row["count"] if row else 0


def increment_usage(ip_hash: str) -> int:
    month = time.strftime("%Y-%m")
    with connect() as conn:
        conn.execute(
            "INSERT INTO usage_counter (ip_hash, month, count) VALUES (?, ?, 1) "
            "ON CONFLICT(ip_hash, month) DO UPDATE SET count = count + 1",
            (ip_hash, month),
        )
        row = conn.execute("SELECT count FROM usage_counter WHERE ip_hash = ? AND month = ?", (ip_hash, month)).fetchone()
    return row["count"]
