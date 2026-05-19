import "./TraderLogin.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import SocialLogin from "../../components/SocialLogin";

function TraderLogin() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        role: "trader"
      });

      localStorage.setItem("currentUser", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      navigate("/Trader/TraderDashboard");

    } catch (apiError) {
      setError(apiError.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <div className="login-card">
        <h1>Trader Log in or Sign up</h1>

        {/* Social login buttons — Google, Microsoft, Apple */}
        <SocialLogin
          role="trader"
          dashboardPath="/Trader/TraderDashboard"
        />

        <button className="social-btn">Continue with Phone</button>

        <div className="divider">
          <span></span>
          OR
          <span></span>
        </div>

        {location.state?.successMessage && (
          <p className="success-text">{location.state.successMessage}</p>
        )}

        {error && <p className="error-text">{error}</p>}

        <input
          type="email"
          placeholder="Email address"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default TraderLogin;