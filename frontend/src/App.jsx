import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Support from "./pages/Support";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerLogout from "./pages/FarmerLogout";
import SickCrop from "./pages/SickCrop";
import SellMyHarvest from "./pages/SellMyHarvest";
import ListCrop from "./pages/ListCrop";
import OffersReceived from "./pages/OffersReceived";
import WhatToGrow from "./pages/WhatToGrow";
import TraderLogin from "./pages/Trader/TraderLogin";
import TraderRegister from "./pages/Trader/TraderRegister";
import TraderDashboard from "./pages/Trader/TraderDashboard";
import TraderLogout from "./pages/Trader/TraderLogout";
import TraderProfile from "./pages/Trader/TraderProfile";
import TraderBuyCrops from "./pages/Trader/BuyCrops";
import EditProfile from "./pages/EditProfile";

function Home() {
  return (
    <div className="container">

      <header className="header">
        <div className="logo">
          🌱 <span>Krushi Seva</span>
        </div>
        <button className="lang-btn">
          🌐 English / हिन्दी
        </button>
      </header>

      <section className="hero">
        <h1>
          Welcome to <span className="green">Krushi Seva</span>
        </h1>
        <p>
          Simple and direct access for farmers and traders. Choose your role to continue.
        </p>

        <div className="cards">
          <div className="card">
            <div className="icon">🚜</div>
            <h2>Farmer</h2>
            <p>Login to sell your crops, check prices, and get expert advice.</p>
            <Link to="/login">
              <button className="farmer-btn">Farmer Login →</button>
            </Link>
            <Link to="/register">Register as new farmer</Link>
          </div>

          <div className="card">
            <div className="icon">🚚</div>
            <h2>Trader</h2>
            <p>Login to browse local produce and connect with farmers.</p>
            <Link to="/Trader/TraderLogin">
              <button className="trader-btn">Trader Login →</button>
            </Link>
            <Link to="/Trader/TraderRegister">Register as new trader</Link>
          </div>
        </div>

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
        {/* Public routes — no login needed */}
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/support" element={<Support />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Trader/TraderLogin" element={<TraderLogin />} />
        <Route path="/Trader/TraderRegister" element={<TraderRegister />} />

        {/* Farmer protected routes — redirects to /login if not logged in */}
        <Route path="/farmerdashboard" element={
          <ProtectedRoute><FarmerDashboard /></ProtectedRoute>
        } />
        <Route path="/farmerlogout" element={
          <ProtectedRoute><FarmerLogout /></ProtectedRoute>
        } />
        <Route path="/sickcrop" element={
          <ProtectedRoute><SickCrop /></ProtectedRoute>
        } />
        <Route path="/sellmyharvest" element={
          <ProtectedRoute><SellMyHarvest /></ProtectedRoute>
        } />
        <Route path="/listcrop" element={
          <ProtectedRoute><ListCrop /></ProtectedRoute>
        } />
        <Route path="/offersreceived" element={
          <ProtectedRoute><OffersReceived /></ProtectedRoute>
        } />
        <Route path="/whattogrow" element={
          <ProtectedRoute><WhatToGrow /></ProtectedRoute>
        } />
        <Route path="/farmerdashboard" element={
       <ProtectedRoute requiredRole="farmer"><FarmerDashboard /></ProtectedRoute>
       } />
       <Route path="/editprofile" element={
       <ProtectedRoute><EditProfile /></ProtectedRoute>
       } />

        {/* Trader protected routes — redirects to /login if not logged in */}
        <Route path="/Trader/TraderDashboard" element={
          <ProtectedRoute><TraderDashboard /></ProtectedRoute>
        } />
        <Route path="/Trader/TraderLogout" element={
          <ProtectedRoute><TraderLogout /></ProtectedRoute>
        } />
        <Route path="/Trader/TraderProfile" element={
          <ProtectedRoute><TraderProfile /></ProtectedRoute>
        } />
        <Route path="/Trader/BuyCrops" element={
          <ProtectedRoute><TraderBuyCrops /></ProtectedRoute>
        } />
        <Route path="/Trader/TraderDashboard" element={
        <ProtectedRoute requiredRole="trader"><TraderDashboard /></ProtectedRoute>
        } />
      </Routes>
      

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