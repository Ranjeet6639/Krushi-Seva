import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Support from "./pages/Support";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Home() {
  return (
    <div className="container">

      {/* Header */}
      <header className="header">
        <div className="logo">
          🌱 <span>Krushi Seva</span>
        </div>

        <button className="lang-btn">
          🌐 English / हिन्दी
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero">

        <h1>
          Welcome to <span className="green">Krushi Seva</span>
        </h1>

        <p>
          Simple and direct access for farmers and traders. Choose your role to continue.
        </p>

        {/* Cards */}
        <div className="cards">

          {/* Farmer */}
          <div className="card">

            <div className="icon farmer">🚜</div>

            <h2>Farmer</h2>

            <p>
              Login to sell your crops, check prices, and get expert advice.
            </p>

            <Link to="/login">
            <button className="farmer-btn">
              Farmer Login →
            </button>
            </Link>

            <Link to="/register">Register as new farmer</Link>

          </div>


          {/* Trader */}
          <div className="card">

            <div className="icon trader">🚚</div>

            <h2>Trader</h2>

            <p>
              Login to browse local produce and connect with farmers.
            </p>

            <button className="trader-btn">
              Trader Login →
            </button>

            <Link to="#">Register as new trader</Link>

          </div>

        </div>

        {/* Help Section */}
        <div className="help">
          <span>📞</span>

           <div>
        <p>NEED HELP?</p>

        <h3>
          <a href="tel:+918005787382" className="phone-link">
            1800-KRUSHI-SEVA
          </a>
        </h3>

      </div>
        </div>

      </section>

    </div>
  );
}

function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/support" element={<Support />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      {/* Footer */}
      <footer className="footer">

        <p>© 2026 Krushi Seva Digital Platform</p>

        <div className="footer-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/support">Support</Link>
        </div>

      </footer>

    </Router>
  );
}

export default App;