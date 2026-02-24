// src/pages/LandingPage.jsx
import { useNavigate } from "react-router-dom";
import logoColorido from "../assets/Design sem nome (4).png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <img
        src={logoColorido}
        alt="VaiTerPlay"
        style={{
          height: 120,
          width: "auto",
          marginBottom: 40,
        }}
      />
      <button
        onClick={() => navigate("/login")}
        style={{
          padding: "16px 40px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#37648c",
          color: "#ffffff",
          fontSize: 18,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#2d5070";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "#37648c";
        }}
      >
        Entrar
      </button>
    </div>
  );
}
