import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  MessageSquare,
  Shield,
  Users,
  User,
} from "lucide-react";

export default function AdminLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const [pendingTranscriptCount, setPendingTranscriptCount] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 960);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    api
      .get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const stats = res.data?.topStats || [];
        const pending = stats.find((s) => s.key === "transcripts")?.value ?? 0;
        setPendingTranscriptCount(Number(pending) || 0);
      })
      .catch(() => {
        setPendingTranscriptCount(0);
      });
  }, [token]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 960;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    nav("/");
  };

  const navItems = [
    { label: "My Profile", path: "/admin/profile", icon: User },
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "User Management", path: "/admin/users", icon: Users },
    { label: "Announcements", path: "/admin/announcements", icon: Megaphone },
    { label: "Course Management", path: "/admin/courses", icon: BookOpen },
    {
      label: "Predictive Analytics",
      path: "/admin/predictive-analytics",
      icon: ClipboardList,
    },
    {
      label: "Academic Monitoring",
      path: "/admin/academic-monitoring",
      icon: Shield,
    },
    { label: "Messages", path: "/admin/messages", icon: MessageSquare },
    {
      label: "Requests",
      path: "/admin/requests",
      icon: ClipboardList,
      badge: pendingTranscriptCount,
      danger: true,
    },
  ];

  const sidebar = (
    <aside
      className={`sidebar ${isMobile && !mobileNavOpen ? "sidebar-hidden" : ""}`}
    >
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          🛡️
        </div>
        <div>
          <h2 className="sidebar-title">Admin Portal</h2>
          <p className="sidebar-subtitle">Faculty of Engineering</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              type="button"
              className={`nav-item admin ${active ? "active" : ""}`}
              onClick={() => nav(item.path)}
            >
              <span className="nav-label">
                <Icon size={18} />
                {item.label}
              </span>

              {item.badge > 0 ? (
                <span className={`badge ${item.danger ? "danger" : ""}`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <div className="app-shell">
      {isMobile ? (
        <>
          {mobileNavOpen ? (
            <button
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
              className="mobile-overlay"
            />
          ) : null}
          {sidebar}
        </>
      ) : (
        sidebar
      )}

      {/* MAIN */}
      <main className="main-area">
        <header className="topbar">
          {isMobile ? (
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="btn"
            >
              <Menu size={18} />
              Menu
            </button>
          ) : null}
          <div className="topbar-actions">
            <button type="button" onClick={logout} className="btn btn-danger">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
