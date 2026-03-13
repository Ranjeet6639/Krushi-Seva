import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
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

        <h1>Log in or Sign up</h1>

        <button className="social-btn">
          <img src="https://img.icons8.com/color/48/google-logo.png"/>
          Continue with Google
        </button>

        <button className="social-btn">
          <img src="https://img.icons8.com/color/48/microsoft.png"/>
          Continue with Microsoft
        </button>

        <button className="social-btn">
          <img src="https://img.icons8.com/ios-filled/50/mac-os.png"/>
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

        <input
          type="email"
          placeholder="Email address"
          className="input-field"
        />

        <input
          type="password"
          placeholder="Password"
          className="input-field"
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

export default Login;