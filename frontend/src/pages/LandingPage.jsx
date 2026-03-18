// src/pages/LandingPage.jsx
import { useNavigate } from "react-router-dom"
import logoColorido from "../assets/Design sem nome (4).png"
import "./auth.css"

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="landing-wrapper">
      <img
        src={logoColorido}
        alt="VaiTerPlay"
        className="landing-logo"
      />
      <button
        onClick={() => navigate("/login")}
        className="landing-btn-entrar"
      >
        Entrar
      </button>
    </div>
  )
}

export default LandingPage
