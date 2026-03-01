import React, { useEffect, useState } from "react";
import api from "../services/api";
import RecentAnnouncementsCard from "../components/RecentAnnouncementsCard";
import { useNavigate } from "react-router-dom";

function Card({ children }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        border: "1px solid #eef2f7",
      }}
    >
      {children}
    </div>
  );
}

function Table({ columns, rows, emptyText = "No data." }) {
  if (!rows || rows.length === 0) {
    return <div style={{ color: "#6b7280", fontWeight: 700 }}>{emptyText}</div>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderBottom: "1px solid #e5e7eb",
                  color: "#6b7280",
                  fontSize: 12,
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #eef2f7",
                    fontSize: 13,
                    color: "#111827",
                    fontWeight: 700,
                  }}
                >
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StudentPage({ view = "dashboard" }) {
  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [dashboard, setDashboard] = useState({
    header: { title: "Student Portal", subtitle: "" },
    stats: [],
    quickActions: [],
    schedule: [],
    courseProgress: [],
    deadlines: [],
  });
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState({ summary: {}, rows: [] });
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState({ summary: {}, rows: [] });
  const [requests, setRequests] = useState([]);
  const [submitBusy, setSubmitBusy] = useState(false);

  function fmtDateTime(value) {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  }

  function goQuickAction(key) {
    if (key === "courses") nav("/student/courses");
    if (key === "grades") nav("/student/grades");
    if (key === "transcript") nav("/student/transcript");
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      try {
        if (view === "dashboard") {
          const res = await api.get("/student/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setDashboard((prev) => ({ ...prev, ...res.data }));
        } else if (view === "courses") {
          const res = await api.get("/student/courses", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCourses(res.data);
        } else if (view === "grades") {
          const [g, e] = await Promise.all([
            api.get("/student/grades", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/student/exams", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setGrades(g.data);
          setExams(e.data);
        } else if (view === "attendance") {
          const res = await api.get("/student/attendance", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAttendance(res.data);
        } else if (view === "transcript") {
          const res = await api.get("/student/transcript-requests", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRequests(res.data);
        }
      } catch (e) {
        setErr(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, view]);

  async function submitTranscriptRequest() {
    try {
      setSubmitBusy(true);
      setErr("");
      await api.post(
        "/student/transcript-requests",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const res = await api.get("/student/transcript-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    } finally {
      setSubmitBusy(false);
    }
  }

  if (loading) return <div style={{ padding: 20, color: "#6b7280" }}>Loading...</div>;
  if (err) return <div style={{ padding: 20, color: "crimson" }}>{err}</div>;

  if (view === "courses") {
    return (
      <div style={{ padding: 18, display: "grid", gap: 14 }}>
        <Card>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>My Courses</div>
          <div style={{ color: "#6b7280", fontSize: 13 }}>Enrolled courses and timetable.</div>
        </Card>
        <Card>
          <Table
            rows={courses}
            emptyText="No enrolled courses found."
            columns={[
              { key: "course_code", label: "Code" },
              { key: "course_name", label: "Course" },
              { key: "semester", label: "Semester" },
              { key: "year", label: "Year" },
              { key: "credits", label: "Credits" },
              { key: "day", label: "Day" },
              {
                key: "time",
                label: "Time",
                render: (r) =>
                  r.time_start && r.time_end ? `${r.time_start} - ${r.time_end}` : "TBA",
              },
              { key: "location", label: "Location" },
            ]}
          />
        </Card>
      </div>
    );
  }

  if (view === "grades") {
    return (
      <div style={{ padding: 18, display: "grid", gap: 14 }}>
        <Card>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Grades & Results</div>
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            GPA calculation and generated course results.
          </div>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          <Card>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Cumulative GPA</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{grades.summary?.cumulativeGpa ?? 0}</div>
          </Card>
          <Card>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Semester GPA</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{grades.summary?.semesterGpa ?? 0}</div>
          </Card>
          <Card>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Credits Attempted</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{grades.summary?.creditsAttempted ?? 0}</div>
          </Card>
          <Card>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Completed Courses</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{grades.summary?.completedCourses ?? 0}</div>
          </Card>
        </div>
        <Card>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Course Results</div>
          <Table
            rows={grades.rows}
            emptyText="No course grades yet."
            columns={[
              { key: "course_code", label: "Code" },
              { key: "course_name", label: "Course" },
              { key: "semester", label: "Semester" },
              { key: "year", label: "Year" },
              { key: "credits", label: "Credits" },
              { key: "graded_items", label: "Items" },
              {
                key: "avg_percent",
                label: "Avg %",
                render: (r) => `${Number(r.avg_percent || 0).toFixed(2)}%`,
              },
              { key: "letter_grade", label: "Letter" },
              { key: "grade_points", label: "Points" },
              { key: "result_status", label: "Result" },
            ]}
          />
        </Card>
        <Card>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Exam Schedule</div>
          <Table
            rows={exams}
            emptyText="No upcoming exams found."
            columns={[
              { key: "course_code", label: "Code" },
              { key: "course_name", label: "Course" },
              { key: "exam_type", label: "Type" },
              { key: "exam_date", label: "Date", render: (r) => fmtDateTime(r.exam_date) },
              { key: "start_time", label: "Start" },
              { key: "end_time", label: "End" },
              { key: "location", label: "Location" },
            ]}
          />
        </Card>
      </div>
    );
  }

  if (view === "attendance") {
    return (
      <div style={{ padding: 18, display: "grid", gap: 14 }}>
        <Card>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Attendance Summary</div>
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            Overall average: {attendance.summary?.avgAttendance ?? "0%"}
          </div>
        </Card>
        <Card>
          <Table
            rows={attendance.rows}
            emptyText="No attendance records yet."
            columns={[
              { key: "course_code", label: "Code" },
              { key: "course_name", label: "Course" },
              { key: "sessions_total", label: "Sessions" },
              { key: "present_count", label: "Present" },
              { key: "absent_count", label: "Absent" },
              { key: "late_count", label: "Late" },
              { key: "excused_count", label: "Excused" },
              {
                key: "attendance_percent",
                label: "Attendance %",
                render: (r) => `${Number(r.attendance_percent || 0).toFixed(2)}%`,
              },
            ]}
          />
        </Card>
      </div>
    );
  }

  if (view === "transcript") {
    const hasPending = requests.some((r) => String(r.status).toLowerCase() === "pending");
    return (
      <div style={{ padding: 18, display: "grid", gap: 14 }}>
        <Card>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Transcript Requests</div>
          <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 12 }}>
            Submit transcript requests and track statuses.
          </div>
          <button
            disabled={submitBusy || hasPending}
            onClick={submitTranscriptRequest}
            style={{
              border: 0,
              borderRadius: 10,
              padding: "10px 14px",
              background: hasPending ? "#94a3b8" : "#1d4ed8",
              color: "#fff",
              cursor: hasPending ? "not-allowed" : "pointer",
              fontWeight: 900,
            }}
          >
            {hasPending ? "Pending Request Exists" : submitBusy ? "Submitting..." : "Submit Request"}
          </button>
        </Card>
        <Card>
          <Table
            rows={requests}
            emptyText="No transcript requests yet."
            columns={[
              { key: "request_id", label: "Request ID" },
              { key: "status", label: "Status" },
              { key: "created_at", label: "Created At", render: (r) => fmtDateTime(r.created_at) },
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 18 }}>
      <div
        style={{
          background: "linear-gradient(90deg,#1d4ed8,#2563eb)",
          padding: "20px 22px",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 900 }}>
          {dashboard?.header?.title || "Student Dashboard"}
        </div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          {dashboard?.header?.subtitle || "Here’s your academic overview"}
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: 18,
          display: "grid",
          gap: 14,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {(dashboard.stats || []).map((s) => (
            <Card key={s.label}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>{s.value}</div>
            </Card>
          ))}
        </div>

        <Card>
          <div style={{ fontWeight: 900, marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {(dashboard.quickActions || []).map((a, idx) => (
              <button
                key={a.key || a.label || idx}
                onClick={() => goQuickAction(a.key)}
                style={{
                  border: 0,
                  borderRadius: 12,
                  padding: "12px 10px",
                  fontWeight: 900,
                  cursor: "pointer",
                  color: "#fff",
                  background: idx === 0 ? "#2563eb" : idx === 1 ? "#22c55e" : "#a855f7",
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card>
            <div style={{ fontWeight: 900, marginBottom: 12 }}>My Schedule</div>
            <div style={{ display: "grid", gap: 10 }}>
              {(dashboard.schedule || []).map((c, idx) => (
                <div
                  key={c.course || idx}
                  style={{ border: "1px solid #eef2f7", borderRadius: 12, padding: 12 }}
                >
                  <div style={{ fontWeight: 900 }}>{c.course}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {c.time} • {c.location}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <RecentAnnouncementsCard viewAllPath="/student/announcements" />
        </div>
      </div>
    </div>
  );
}
