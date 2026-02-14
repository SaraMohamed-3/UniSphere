import React from "react";
import LoginForm from "../components/LoginForm";
import bgImage from "../images/img4.JPG";

export default function LoginPage() {
  const leftSideStyle = {
    flex: 1,
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: "white",
    padding: "40px",
  };

  const overlay = {
    background: "rgba(0,0,0,0.5)",
    padding: "40px",
    borderRadius: "10px",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* LEFT IMAGE */}
      <div style={leftSideStyle}>
        <div style={overlay}>
          <h1 style={{ fontSize: "40px", fontWeight: "700" }}>
            Faculty of Engineering
          </h1>

          <h2 style={{ fontSize: "24px", marginTop: "10px" }}>
            Alexandria University
          </h2>

          <p style={{ fontSize: "18px", marginTop: "20px" }}>
            Access your academic information and services
          </p>

          <button
            style={{
              marginTop: "25px",
              padding: "10px 20px",
              background: "#facc15",
              color: "black",
              border: "none",
              borderRadius: "20px",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            Est. 1942
          </button>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div
        style={{
          flex: 1,
          background: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <LoginForm />
      </div>
    </div>
  );
}
