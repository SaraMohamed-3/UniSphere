import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  MessageSquare,
  School,
  User,
} from "lucide-react";

export default function ProfessorLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 960);

  const isActive = (path) => {
    if (path === "/professor") return location.pathname === "/professor";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    nav("/");
  };

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

  const navItems = [
    { label: "My Profile", path: "/professor/profile", icon: User },
    { label: "Dashboard", path: "/professor", icon: LayoutDashboard },
    { label: "My Classes", path: "/professor/classes", icon: School },
    { label: "Enter Grades", path: "/professor/grades", icon: ClipboardList },
    { label: "Attendance", path: "/professor/attendance", icon: BookOpen },
    { label: "Assignments", path: "/professor/assignments", icon: FileText },
    { label: "Announcements", path: "/professor/announcements", icon: Megaphone },
    { label: "Messages", path: "/professor/messages", icon: MessageSquare },
  ];

  const sidebar = (
    <aside
      className={`sidebar ${isMobile && !mobileNavOpen ? "sidebar-hidden" : ""}`}
    >
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          👨‍🏫
        </div>
        <div>
          <h2 className="sidebar-title">Professor Portal</h2>
          <p className="sidebar-subtitle">Teaching Overview</p>
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
              className={`nav-item professor ${active ? "active" : ""}`}
              onClick={() => nav(item.path)}
            >
              <span className="nav-label">
                <Icon size={18} />
                {item.label}
              </span>
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

      {/* Main */}
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
