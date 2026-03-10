import "./App.css";

function App() {
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

            <button className="farmer-btn">
              Farmer Login →
            </button>

            <a href="#">Register as new farmer</a>

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

            <a href="#">Register as new trader</a>

          </div>

        </div>


        {/* Help Section */}
        <div className="help">
          <span>📞</span>

          <div>
            <p>NEED HELP?</p>
            <h3>Call 1800-KRUSHI-SEVA</h3>
          </div>
        </div>

      </section>


      {/* Footer */}
      <footer className="footer">

        <p>© 2026 Krushi Seva Digital Platform</p>

        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
        </div>

      </footer>

    </div>
  );
}

export default App;