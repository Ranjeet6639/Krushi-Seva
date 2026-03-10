import "./Login.css";

function Login() {
  return (
    <div className="login-container">

      <div className="login-card">

        <h1>Log in or Sign up</h1>

        {/* Social Login Buttons */}

        <button className="social-btn">
          <img src="https://img.icons8.com/color/48/google-logo.png" />
          Continue with Google
        </button>

        <button className="social-btn">
          <img src="https://img.icons8.com/color/48/microsoft.png" />
          Continue with Microsoft
        </button>

        <button className="social-btn">
          <img src="https://img.icons8.com/ios-filled/50/mac-os.png" />
          Continue with Apple
        </button>

        <button className="social-btn">
          📞 Continue with Phone
        </button>

        {/* Divider */}

        <div className="divider">
          <span></span>
          OR
          <span></span>
        </div>

        {/* Email Login */}

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

        <button className="login-btn">
          Continue
        </button>

      </div>

    </div>
  );
}

export default Login;