import React, { useEffect, useState } from "react";
import api from "../services/api";

const STATUS_COLORS = {
  active: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca", icon: "" },
  resolved: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0", icon: "✅" },
  dismissed: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb", icon: "➖" },
};

export default function StudentAcademicStatusPage() {
  const token = localStorage.getItem("token");
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.patch("/notifications/read-all", { type: "academic_flag" }).catch(() => {});
    api
      .get("/academic-monitoring/my-flags", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setFlags(r.data.flags || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const activeCount = flags.filter((f) => f.status === "active").length;

  return (
    <div style={{ maxWidth: 750, padding: 24 }}>
      <h1 style={{ fontWeight: 900, fontSize: 24, marginBottom: 4 }}>
          Academic Status
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Academic monitoring flags raised by the administration for your account.
      </p>

      {activeCount > 0 && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div>
            <p style={{ fontWeight: 800, color: "#dc2626", margin: 0 }}>
              You are under academic monitoring
            </p>
            <p style={{ fontSize: 13, color: "#b91c1c", margin: 0 }}>
              {activeCount} active flag{activeCount > 1 ? "s" : ""} require attention. Please contact your advisor.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#9ca3af" }}>Loading…</p>
      ) : flags.length === 0 ? (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 12,
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
          <p style={{ fontWeight: 800, color: "#15803d", margin: 0 }}>
            No academic flags on your record
          </p>
          <p style={{ fontSize: 13, color: "#16a34a" }}>
            Keep up the good work!
          </p>
        </div>
      ) : (
        flags.map((f) => {
          const c = STATUS_COLORS[f.status] || STATUS_COLORS.dismissed;
          return (
            <div
              key={f.flag_id}
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontWeight: 800, color: c.text, fontSize: 15 }}>
                  {c.icon}{" "}
                  {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                </span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  {new Date(f.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#374151", margin: "0 0 4px" }}>
                {f.reason}
              </p>
              {f.course_code ? (
                <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>
                  Course: {f.course_code}
                  {f.course_name ? ` - ${f.course_name}` : ""}
                  {f.percent_score != null ? ` | Score: ${f.percent_score}%` : ""}
                </p>
              ) : null}
              {f.notes && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  Admin note: {f.notes}
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
