import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function RecentAnnouncementsCard({
  viewAllPath,
  title = "Recent Announcements",
  limit = 3,
}) {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token],
  );

  useEffect(() => {
    api
      .get("/announcements", authHeaders)
      .then((res) => {
        const all = res.data || [];
        setItems(all.slice(0, limit));
      })
      .catch((e) => setErr(e.response?.data?.message || e.message));
  }, [authHeaders, limit]);

  return (
    <div className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔔</span>
          <div className="dashboard-panel-title" style={{ fontSize: 16 }}>
            {title}
          </div>
        </div>

        <button
          onClick={() => nav(viewAllPath)}
          className="btn btn-soft"
          type="button"
        >
          View All
        </button>
      </div>

      {err ? (
        <div className="error-message" style={{ marginTop: 10 }}>
          {err}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {items.length === 0 ? (
          <div className="empty-state" style={{ padding: 0 }}>
            No announcements yet.
          </div>
        ) : (
          items.map((a) => (
            <div key={a.announcement_id} className="list-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div className="list-card-title">{a.title}</div>
                <span style={pill()}>Notice</span>
              </div>

              <div className="list-card-subtitle" style={{ marginTop: 6 }}>
                {a.created_at ? timeAgo(a.created_at) : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function pill() {
  return {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontWeight: 900,
  };
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
}
