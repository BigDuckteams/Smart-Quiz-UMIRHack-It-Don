"""SQLite-backed submission service."""

from __future__ import annotations

import json
import logging
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class SubmissionService:
    def __init__(self, db_path: str) -> None:
        self.db_path = db_path
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute('PRAGMA journal_mode=WAL')
            conn.execute('PRAGMA synchronous=NORMAL')
            conn.execute(
                '''
                CREATE TABLE IF NOT EXISTS submissions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    room_type TEXT NOT NULL,
                    zones TEXT NOT NULL,
                    area INTEGER NOT NULL,
                    style TEXT NOT NULL,
                    budget TEXT NOT NULL,
                    name TEXT,
                    phone TEXT NOT NULL,
                    email TEXT,
                    comment TEXT,
                    page_url TEXT,
                    utm_source TEXT,
                    timestamp TEXT NOT NULL,
                    consent INTEGER NOT NULL,
                    created_at TEXT NOT NULL
                )
                '''
            )
            conn.execute('CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at)')
            conn.execute('CREATE INDEX IF NOT EXISTS idx_submissions_phone ON submissions(phone)')

    def save(self, payload: dict[str, Any]) -> int:
        with self._connect() as conn:
            cursor = conn.execute(
                '''
                INSERT INTO submissions (
                    room_type, zones, area, style, budget, name, phone, email, comment,
                    page_url, utm_source, timestamp, consent, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    payload['room_type'],
                    json.dumps(payload['zones'], ensure_ascii=False),
                    payload['area'],
                    payload['style'],
                    payload['budget'],
                    payload.get('name', ''),
                    payload['phone'],
                    payload.get('email', ''),
                    payload.get('comment', ''),
                    payload.get('page_url', ''),
                    payload.get('utm_source', ''),
                    str(payload['timestamp']),
                    1 if payload.get('consent') else 0,
                    datetime.utcnow().isoformat(),
                ),
            )
            submission_id = int(cursor.lastrowid)
            logger.info('submission_saved', extra={'id': submission_id, 'phone_tail': payload.get('phone', '')[-4:]})
            return submission_id

    def list_submissions(self, filters: dict[str, str], limit: int = 100) -> list[dict[str, Any]]:
        query = 'SELECT * FROM submissions WHERE 1=1'
        params: list[Any] = []

        if filters.get('name'):
            query += ' AND name LIKE ?'
            params.append(f"%{filters['name']}%")
        if filters.get('phone'):
            query += ' AND phone LIKE ?'
            params.append(f"%{filters['phone']}%")
        if filters.get('email'):
            query += ' AND email LIKE ?'
            params.append(f"%{filters['email']}%")
        if filters.get('query'):
            query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR comment LIKE ?)'
            q = f"%{filters['query']}%"
            params.extend([q, q, q, q])
        if filters.get('date_from'):
            query += ' AND created_at >= ?'
            params.append(filters['date_from'])
        if filters.get('date_to'):
            query += ' AND created_at <= ?'
            params.append(filters['date_to'])

        query += ' ORDER BY id DESC LIMIT ?'
        params.append(limit)

        with self._connect() as conn:
            rows = conn.execute(query, params).fetchall()

        result: list[dict[str, Any]] = []
        for row in rows:
            item = dict(row)
            item['zones'] = json.loads(item['zones']) if item.get('zones') else []
            item['consent'] = bool(item.get('consent'))
            result.append(item)
        return result

    def analytics(self) -> dict[str, Any]:
        with self._connect() as conn:
            total = conn.execute('SELECT COUNT(*) AS c FROM submissions').fetchone()['c']
            room = conn.execute('SELECT room_type, COUNT(*) AS c FROM submissions GROUP BY room_type ORDER BY c DESC').fetchall()
            style = conn.execute('SELECT style, COUNT(*) AS c FROM submissions GROUP BY style ORDER BY c DESC').fetchall()
            budget = conn.execute('SELECT budget, COUNT(*) AS c FROM submissions GROUP BY budget ORDER BY c DESC').fetchall()

        return {
            'total': total,
            'room_type_distribution': [dict(r) for r in room],
            'style_distribution': [dict(r) for r in style],
            'budget_distribution': [dict(r) for r in budget],
        }
