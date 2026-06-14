export default function Hero({ groups, onStart }) {
  const total = groups.reduce((n, g) => n + g.questions.length, 0)

  return (
    <section className="hero card">
      <div className="hero-text">
        <span className="pill">Expert system · Nephrology</span>
        <h1>
          Reason about kidney symptoms with a{' '}
          <span className="grad-text">transparent rule engine</span>
        </h1>
        <p className="lead">
          Answer a short structured questionnaire. The built-in inference engine
          forward-chains over a nephrology knowledge base and explains exactly
          which rules fired and why.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary" onClick={onStart}>
            Start assessment →
          </button>
          <span className="hint">{total} questions · ~2 minutes</span>
        </div>
      </div>

      <ul className="feature-list">
        {groups.map((g) => (
          <li key={g.id} className="feature">
            <span className="feature-icon" aria-hidden="true">
              {g.icon}
            </span>
            <div>
              <strong>{g.title}</strong>
              <span>{g.questions.length} questions</span>
            </div>
          </li>
        ))}
        <li className="feature">
          <span className="feature-icon" aria-hidden="true">
            🧠
          </span>
          <div>
            <strong>Explainable output</strong>
            <span>See the reasoning trace</span>
          </div>
        </li>
      </ul>
    </section>
  )
}
