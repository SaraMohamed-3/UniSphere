// frontend/src/pages/ProfessorPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import RecentAnnouncementsCard from "../components/RecentAnnouncementsCard";

export default function ProfessorPage() {
  const nav = useNavigate();
  const [data, setData] = useState({
    header: { title: "Professor Dashboard", subtitle: "", department: "" },
    stats: [],
    quickActions: [],
    todaySchedule: [],
    submissions: [],
    coursePerformance: [],
    pendingTasks: [],
  });

  const [err, setErr] = useState("");

  function fmtDateTime(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    api
      .get("/professor/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData((prev) => ({ ...prev, ...res.data })))
      .catch((e) => setErr(e.response?.data?.message || e.message));
  }, []);

  if (err) return <div style={{ padding: 20, color: "crimson" }}>{err}</div>;

  return (
    <div>
      <section className="dashboard-hero">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1>{data.header.title}</h1>
            <p>{data.header.subtitle}</p>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.14)",
              padding: "8px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {data.header.department}
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gap: 14 }}>
        <section className="stats-grid">
          {(data.stats || []).map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>
                {s.value}
              </div>
            </div>
          ))}
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="quick-action-grid">
            {(data.quickActions || []).map((a, idx) => (
              <button
                key={a.key || idx}
                type="button"
                onClick={() => {
                  if (a.key === "attendance") nav("/professor/attendance");
                  if (a.key === "grades") nav("/professor/grades");
                  if (a.key === "assignments") nav("/professor/assignments");
                  if (a.key === "announce") nav("/professor/announcements");
                  if (a.key === "students") nav("/professor/classes");
                }}
                className={
                  idx === 0
                    ? "action-button primary"
                    : idx === 1
                      ? "action-button secondary"
                      : idx === 2
                        ? "action-button accent"
                        : "action-button danger"
                }
              >
                {a.label}
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title">Today's Classes</h2>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {(!data.todaySchedule || data.todaySchedule.length === 0) && (
                <div className="empty-state" style={{ padding: 0 }}>
                  No classes scheduled for today.
                </div>
              )}
              {(data.todaySchedule || []).map((c, idx) => (
                <div
                  key={`${c.course}-${idx}`}
                  className="list-card"
                >
                  <div className="list-card-title">{c.course}</div>
                  <div className="list-card-subtitle">
                    {c.time} • {c.location} • {c.students ?? "-"} students
                  </div>
                </div>
              ))}
            </div>
          </div>

          <RecentAnnouncementsCard viewAllPath="/professor/announcements" />
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title">Recent Submissions</h2>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {(!data.submissions || data.submissions.length === 0) && (
                <div className="empty-state" style={{ padding: 0 }}>
                  No recent submissions yet.
                </div>
              )}
              {(data.submissions || []).map((s, idx) => (
                <div
                  key={`${s.title}-${idx}`}
                  className="list-card"
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div className="list-card-title" style={{ margin: 0 }}>
                      {s.title}
                    </div>
                    <span className="list-card-subtitle" style={{ margin: 0 }}>
                      {fmtDateTime(s.when)}
                    </span>
                  </div>
                  <div className="list-card-subtitle" style={{ marginTop: 4 }}>
                    {s.meta}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title">Course Performance</h2>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {(!data.coursePerformance || data.coursePerformance.length === 0) && (
                <div className="empty-state" style={{ padding: 0 }}>
                  No performance data yet.
                </div>
              )}
              {(data.coursePerformance || []).map((p, idx) => (
                <div key={`${p.course}-${idx}`}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontWeight: 900 }}>{p.course}</span>
                    <span style={{ color: "#6b7280" }}>
                      Avg {Number(p.avg || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "#eef2f7",
                      borderRadius: 999,
                      marginTop: 6,
                    }}
                  >
                    <div
                      style={{
                        height: 8,
                        width: `${p.avg || 0}%`,
                        background: "#111827",
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">Pending Tasks</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {(!data.pendingTasks || data.pendingTasks.length === 0) && (
              <div className="empty-state" style={{ padding: 0 }}>
                No pending tasks.
              </div>
            )}
            {(data.pendingTasks || []).map((t, idx) => (
              <div
                key={`${t.title}-${idx}`}
                onClick={() => t.route && nav(t.route)}
                className="list-card"
                style={{ cursor: t.route ? "pointer" : "default" }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div style={{ fontWeight: 900 }}>{t.title}</div>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "2px 10px",
                      borderRadius: 999,
                      background: "#fef3c7",
                    }}
                  >
                    {t.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
