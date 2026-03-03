# Dashboard Data Wiring

Place your live metrics JSON at `data/metrics.json`.

Recommended shape:
```json
{
  "updated": "YYYY-MM-DD HH:MM UTC",
  "kpis": {
    "capital_command": "Active",
    "acquisition_pipeline": "Operational",
    "voice_mesh": "Online",
    "ai_workforce": "Scaling",
    "automation_latency": "Low",
    "data_integrity": "98%",
    "compliance_guard": "Active",
    "agent_coverage": "12 lanes",
    "revenue": "$0.00",
    "active_deals": "0",
    "daily_voice_interactions": "0",
    "win_rate": "0%"
  },
  "pulse": [35, 52, 68, 58, 76, 84, 92],
  "alerts": [
    {"title": "...", "status": "Complete", "tone": "ok|warn|info", "detail": "..."}
  ],
  "brief": {
    "wins": "...",
    "next": "..."
  }
}
```

Next step: plug Supabase/Stripe/CRM into a script that writes this file on a schedule.
