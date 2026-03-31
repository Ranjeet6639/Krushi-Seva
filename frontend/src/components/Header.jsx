import "../styles/header.css";

function Header() {
  return (
    <header className="header">

      <div className="logo">
        🌱 <span>Krushi Seva</span>
      </div>

      <button className="lang-btn">
        🌐 English / हिन्दी
      </button>

    </header>
  );
}

export default Header;