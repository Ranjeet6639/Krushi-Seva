import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithProvider,
  googleProvider,
  microsoftProvider,
  appleProvider
} from "../lib/firebase";
import api from "../lib/api";
import googleLogo from "../assets/google-logo.jpg";
import microsoftLogo from "../assets/microsoft-logo.jpg";
import appleLogo from "../assets/apple-logo.jpg";

function SocialLogin({ role, dashboardPath }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function handleSocialLogin(provider, providerName) {
    setLoading(providerName);
    setError("");

    try {
      const { firebaseToken } = await signInWithProvider(provider);

      const response = await api.post("/auth/social-login", {
        firebaseToken,
        role
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("currentUser", JSON.stringify(response.data.user));

      navigate(dashboardPath);

    } catch (err) {
      console.error("Social login error:", err);

      if (err.code === "auth/popup-closed-by-user") {
        setError("Login cancelled. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup blocked. Please allow popups for this site.");
      } else {
        setError(
          err?.response?.data?.message ||
          "Social login failed. Please try again."
        );
      }
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="social-login">

      {error && (
        <p style={{
          color: "red",
          fontSize: "13px",
          textAlign: "center",
          marginBottom: "10px"
        }}>
          {error}
        </p>
      )}

      <button
        className="social-btn"
        onClick={() => handleSocialLogin(googleProvider, "google")}
        disabled={!!loading}
      >
        <img src={googleLogo} alt="Google" width={20} height={20}
          style={{ objectFit: "cover", borderRadius: "2px" }}
        />
        {loading === "google" ? "Signing in..." : "Continue with Google"}
      </button>

      <button
        className="social-btn"
        onClick={() => handleSocialLogin(microsoftProvider, "microsoft")}
        disabled={!!loading}
      >
        <img src={microsoftLogo} alt="Microsoft" width={20} height={20}
          style={{ objectFit: "cover", borderRadius: "2px" }}
        />
        {loading === "microsoft" ? "Signing in..." : "Continue with Microsoft"}
      </button>

      <button
        className="social-btn"
        onClick={() => handleSocialLogin(appleProvider, "apple")}
        disabled={!!loading}
      >
        <img src={appleLogo} alt="Apple" width={20} height={20}
          style={{ objectFit: "cover", borderRadius: "2px" }}
        />
        {loading === "apple" ? "Signing in..." : "Continue with Apple"}
      </button>

    </div>
  );
}

export default SocialLogin;