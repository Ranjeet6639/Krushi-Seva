import "./TraderLogin.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function TraderLogin() {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");   
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleLogin = () => {
     if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/Trader/TraderDashboard");
    }, 500);
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

        <button className="social-btn">
          <img src="https://img.icons8.com/color/48/google-logo.png" alt="google"/>
          Continue with Google
        </button>

        <button className="social-btn">
          <img src="https://img.icons8.com/color/48/microsoft.png" alt="microsoft"/>
          Continue with Microsoft
        </button>

        <button className="social-btn">
          <img src="https://img.icons8.com/ios-filled/50/mac-os.png" alt="apple"/>
          Continue with Apple
        </button>

        <button className="social-btn">
          📞 Continue with Phone
        </button>

        <div className="divider">
          <span></span>
          OR
          <span></span>
        </div>

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

        <button
          className="login-btn"
          onClick={handleLogin}
        >
          Continue
        </button>

      </div>

    </div>
  );
}

export default TraderLogin;