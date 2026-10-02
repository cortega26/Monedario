"""Tests de scripts/ops_reminders.py (recordatorios de operación)."""

from datetime import date

import ops_reminders

DATA = {
    "items": [
        {"id": "a", "date": "2026-09-28", "title": "A", "owner": "carlos"},
        {"id": "b", "date": "2026-09-23", "title": "B", "owner": "carlos"},
        {
            "id": "c",
            "date": "2026-10-30",
            "end_date": "2026-11-02",
            "title": "C",
            "owner": "carlos",
        },
    ],
    "undated": [{"id": "d", "title": "D", "owner": "carlos"}],
}


def test_due_incluye_ventana_y_vencidos_recientes():
    items = ops_reminders.due_items(DATA, today=date(2026, 9, 25), days=7)
    assert [it["id"] for it in items] == ["b", "a"]


def test_vencido_viejo_queda_fuera_de_la_ventana():
    items = ops_reminders.due_items(DATA, today=date(2026, 9, 30), days=7)
    assert "b" not in [it["id"] for it in items]


def test_item_largo_aparece_mientras_esta_activo():
    items = ops_reminders.due_items(DATA, today=date(2026, 10, 30), days=7)
    assert "c" in [it["id"] for it in items]


def test_relative_label():
    assert ops_reminders.relative_label(date(2026, 9, 25), date(2026, 9, 25)) == "hoy"
    assert ops_reminders.relative_label(date(2026, 9, 26), date(2026, 9, 25)) == "mañana"
    assert "vencido" in ops_reminders.relative_label(date(2026, 9, 24), date(2026, 9, 25))


def test_schedule_real_es_valido():
    data = ops_reminders.load_schedule()
    assert data["items"], "el calendario no puede estar vacío"
    for item in data["items"]:
        date.fromisoformat(item["date"])
        if item.get("end_date"):
            date.fromisoformat(item["end_date"])
        assert item["title"]


def test_recurring_lines_formatea_cadencia_y_owner():
    data = {
        "recurring": [
            {
                "id": "growth-review",
                "title": "Revisar Growth",
                "owner": "carlos",
                "cadence": "weekly",
            }
        ]
    }
    assert ops_reminders.recurring_lines(data) == [
        "↻ Revisar Growth [carlos] (weekly)"
    ]
    assert ops_reminders.recurring_lines({}) == []


def test_schedule_real_recurring_valido():
    data = ops_reminders.load_schedule()
    for item in data.get("recurring", []):
        assert item.get("id") and item.get("title") and item.get("owner")
        assert item.get("cadence")
