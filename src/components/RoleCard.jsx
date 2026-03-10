import "../styles/card.css";

function RoleCard({ icon, title, description, button, register, color }) {

  return (
    <div className="card">

      <div className="icon">{icon}</div>

      <h2>{title}</h2>

      <p>{description}</p>

      <button className={color === "green" ? "btn green-btn" : "btn dark-btn"}>
        {button}
      </button>

      <a href="/" className="register">
        {register}
      </a>

    </div>
  );
}

export default RoleCard;