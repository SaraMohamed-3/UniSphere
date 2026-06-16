import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  // ✅ Announcements state
  const [aErr, setAErr] = useState("");
  const [loadingA, setLoadingA] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  const [newA, setNewA] = useState({
    title: "",
    body: "",
    is_published: true,
  });

  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token],
  );

  useEffect(() => {
    api
      .get("/admin/dashboard", authHeaders)
      .then((res) => setData(res.data))
      .catch((e) => setErr(e.response?.data?.message || e.message));
  }, [authHeaders]);

  const fetchAnnouncements = async () => {
    try {
      setLoadingA(true);
      setAErr("");
      // ✅ Admin endpoint (published + unpublished)
      const res = await api.get("/announcements/all", authHeaders);
      setAnnouncements(res.data || []);
    } catch (e) {
      setAErr(e.response?.data?.message || e.message);
    } finally {
      setLoadingA(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setAErr("");
      if (!newA.title.trim() || !newA.body.trim()) {
        setAErr("Title and message are required.");
        return;
      }

      await api.post("/announcements", newA, authHeaders);

      setNewA({ title: "", body: "", is_published: true });
      fetchAnnouncements();
    } catch (e2) {
      setAErr(e2.response?.data?.message || e2.message);
    }
  };

  const togglePublish = async (a) => {
    try {
      setAErr("");
      await api.put(
        `/announcements/${a.announcement_id}`,
        { is_published: !a.is_published },
        authHeaders,
      );
      fetchAnnouncements();
    } catch (e) {
      setAErr(e.response?.data?.message || e.message);
    }
  };

  const deleteAnnouncement = async (a) => {
    const ok = window.confirm("Delete this announcement?");
    if (!ok) return;

    try {
      setAErr("");
      await api.delete(`/announcements/${a.announcement_id}`, authHeaders);
      fetchAnnouncements();
    } catch (e) {
      setAErr(e.response?.data?.message || e.message);
    }
  };

  if (err) return <div className="error-message">{err}</div>;
  if (!data) return <div className="profile-loading"><div className="profile-loading-card">Loading…</div></div>;

  return (
    <div>
      <section className="dashboard-hero">
        <div>
          <h1>{data.header.title}</h1>
          <p>{data.header.subtitle}</p>
        </div>
      </section>

      <section className="stats-grid">
        {data.topStats.map((s) => (
          <div key={s.key} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">
              {s.value}
            </div>
            <div className="stat-label" style={{ marginTop: 8, fontSize: 12 }}>
              {s.badge}
            </div>
          </div>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">
            Students by Department
            </h2>
          </div>
          {data.studentsByDepartment.map((d) => (
            <div key={d.name} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <div>{d.name}</div>
                <div>{d.students} students</div>
              </div>
              <div
                style={{ height: 8, borderRadius: 999, background: "#e5e7eb" }}
              >
                <div
                  style={{
                    height: 8,
                    width: "60%",
                    borderRadius: 999,
                    background: "var(--primary)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">
            Recent Activity
            </h2>
          </div>
          {data.recentActivity.map((a, i) => (
            <div
              key={i}
              className="list-card"
            >
              <div className="list-card-title" style={{ fontSize: 13 }}>
                {a.title}
              </div>
              <div className="list-card-subtitle" style={{ marginTop: 2 }}>
                {a.time}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-panel" style={{ marginTop: 14 }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <div>
            <div className="dashboard-panel-title" style={{ fontSize: 16 }}>
              Global Announcements
            </div>
            <div className="list-card-subtitle" style={{ marginTop: 4 }}>
              Create announcements visible to all students & professors.
            </div>
          </div>

          <button onClick={fetchAnnouncements} className="btn btn-soft" disabled={loadingA}>
            {loadingA ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {aErr ? (
          <div className="error-message" style={{ marginTop: 10 }}>{aErr}</div>
        ) : null}

        <form onSubmit={createAnnouncement} style={{ marginTop: 12 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <input
              className="form-input"
              value={newA.title}
              onChange={(e) =>
                setNewA((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Announcement title"
            />

            <textarea
              className="form-input"
              value={newA.body}
              onChange={(e) => setNewA((p) => ({ ...p, body: e.target.value }))}
              placeholder="Announcement message"
              rows={4}
              style={{ resize: "vertical" }}
            />

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!newA.is_published}
                  onChange={(e) =>
                    setNewA((p) => ({ ...p, is_published: e.target.checked }))
                  }
                />
                <span style={{ fontSize: 13 }}>Publish immediately</span>
                </label>

              <button type="submit" className="btn btn-primary">
                Post Announcement
              </button>
            </div>
          </div>
        </form>

        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          {(announcements || []).length === 0 ? (
            <div className="empty-state" style={{ padding: 0 }}>
              No announcements yet.
            </div>
          ) : (
            announcements.map((a) => (
              <div
                key={a.announcement_id}
                className="list-card"
                style={{
                  background: a.is_published ? "#fbfbfa" : "#f7f8f6",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <div className="list-card-title">{a.title}</div>
                    <div className="list-card-subtitle" style={{ marginTop: 4 }}>
                      {a.created_at
                        ? new Date(a.created_at).toLocaleString()
                        : ""}
                      {" • "}
                      {a.is_published ? "Published" : "Unpublished"}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <button onClick={() => togglePublish(a)} className="btn btn-soft">
                      {a.is_published ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => deleteAnnouncement(a)} className="btn btn-danger">
                      Delete
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    color: "var(--text)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {a.body}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
