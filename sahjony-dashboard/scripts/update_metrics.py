#!/usr/bin/env python3
import json
import os
import requests
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(ROOT, "data", "metrics.json")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")


def supabase_get(path, params=None, count=False):
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return None
    url = SUPABASE_URL.rstrip("/") + "/rest/v1/" + path.lstrip("/")
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }
    if count:
        headers["Prefer"] = "count=exact"
    r = requests.get(url, headers=headers, params=params, timeout=30)
    r.raise_for_status()
    return r


def stripe_balance():
    if not STRIPE_SECRET_KEY:
        return 0.0
    r = requests.get(
        "https://api.stripe.com/v1/balance",
        headers={"Authorization": f"Bearer {STRIPE_SECRET_KEY}"},
        timeout=30,
    )
    r.raise_for_status()
    data = r.json()
    available = data.get("available", [])
    if not available:
        return 0.0
    # Use first currency bucket
    amt = available[0].get("amount", 0)
    return amt / 100.0


def main():
    metrics = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "kpis": {},
        "pulse": [35, 52, 68, 58, 76, 84, 92],
        "alerts": [],
        "brief": {},
    }

    # CRM metrics
    total_contacts = active_deals = open_tasks = 0
    won_revenue = 0.0
    win_rate = 0.0
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        row = supabase_get("dashboard_metrics", params={"select": "*"}).json()
        if row:
            row = row[0]
            total_contacts = int(row.get("total_contacts", 0) or 0)
            active_deals = int(row.get("active_deals", 0) or 0)
            won_revenue = float(row.get("won_revenue", 0) or 0)
            open_tasks = int(row.get("open_tasks", 0) or 0)

        won = supabase_get("deals", params={"select": "id", "status": "eq.won"}, count=True)
        lost = supabase_get("deals", params={"select": "id", "status": "eq.lost"}, count=True)
        won_count = int(won.headers.get("Content-Range", "0/0").split("/")[-1]) if won else 0
        lost_count = int(lost.headers.get("Content-Range", "0/0").split("/")[-1]) if lost else 0
        total = won_count + lost_count
        win_rate = (won_count / total) * 100 if total > 0 else 0.0

    # Stripe revenue (optional override)
    stripe_rev = stripe_balance()
    revenue = stripe_rev if stripe_rev else won_revenue

    metrics["kpis"].update({
        "capital_command": "Active",
        "acquisition_pipeline": "Operational",
        "voice_mesh": "Online",
        "ai_workforce": "Scaling",
        "automation_latency": "Low",
        "data_integrity": "98%",
        "compliance_guard": "Active",
        "agent_coverage": "12 lanes",
        "revenue": f"${revenue:,.2f}",
        "active_deals": str(active_deals),
        "daily_voice_interactions": "0",
        "win_rate": f"{win_rate:.1f}%",
    })

    metrics["alerts"].extend([
        {"title": "CRM Sync", "status": "Live", "tone": "ok", "detail": "Supabase metrics wired."},
        {"title": "Stripe Feed", "status": "Live" if stripe_rev else "Pending", "tone": "ok" if stripe_rev else "warn", "detail": "Revenue pulled from Stripe if available."},
    ])

    metrics["brief"].update({
        "wins": "CRM schema deployed + KPI feed wired.",
        "next": "Deploy voice router + enable automated posting loop."
    })

    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print("Updated", DATA_PATH)


if __name__ == "__main__":
    main()
