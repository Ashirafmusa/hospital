import { useState } from 'react'
import { allQuestions } from '../data/knowledgeBase.js'

const SEVERITY_META = {
  urgent: { label: 'Urgent', className: 'sev-urgent', icon: '🚨' },
  high: { label: 'High', className: 'sev-high', icon: '⚠️' },
  moderate: { label: 'Moderate', className: 'sev-moderate', icon: '🔶' },
  info: { label: 'Info', className: 'sev-info', icon: 'ℹ️' },
}

const QUESTION_LABELS = Object.fromEntries(
  allQuestions.map((q) => [q.id, q.label]),
)

function labelFor(id) {
  return QUESTION_LABELS[id] ?? id
}

function formatValue(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return String(value)
}

function ConclusionCard({ conclusion }) {
  const [open, setOpen] = useState(false)
  const meta = SEVERITY_META[conclusion.severity] ?? SEVERITY_META.info

  return (
    <article className={`result-card ${meta.className}`}>
      <div className="result-top">
        <span className="sev-badge">
          <span aria-hidden="true">{meta.icon}</span> {meta.label}
        </span>
        <span className="result-cat">{conclusion.category}</span>
      </div>

      <h3>{conclusion.title}</h3>
      <p className="result-summary">{conclusion.summary}</p>

      <div className="result-advice">
        <strong>Suggested next step</strong>
        <p>{conclusion.advice}</p>
      </div>

      <button
        className="why-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? 'Hide reasoning' : 'Why this conclusion?'}{' '}
        <span className="why-rule">rule {conclusion.ruleId}</span>
      </button>

      {open && (
        <ul className="why-list">
          {conclusion.why.map((w) => (
            <li key={w.id}>
              <span className="why-fact">{labelFor(w.id)}</span>
              <span className="why-value">{formatValue(w.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export default function Results({ report, onRestart, onEdit }) {
  const { conclusions, hasFindings, trace } = report
  const [showTrace, setShowTrace] = useState(false)

  return (
    <section className="results">
      <div className="results-head card">
        <div>
          <h2>Assessment results</h2>
          <p className="muted">
            {hasFindings
              ? `${conclusions.length} pattern${
                  conclusions.length > 1 ? 's' : ''
                } matched · ${trace.length} rule${
                  trace.length > 1 ? 's' : ''
                } fired`
              : 'No specific patterns matched the rules.'}
          </p>
        </div>
        <div className="results-actions">
          <button className="btn btn-ghost" onClick={onEdit}>
            Edit answers
          </button>
          <button className="btn btn-primary" onClick={onRestart}>
            Start over
          </button>
        </div>
      </div>

      {hasFindings ? (
        <div className="result-grid">
          {conclusions.map((c) => (
            <ConclusionCard key={c.id} conclusion={c} />
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <span className="empty-icon" aria-hidden="true">
            🌿
          </span>
          <h3>No rule patterns triggered</h3>
          <p>
            Based on your answers, none of the knowledge-base rules fired. This
            is not a clean bill of health — if you have concerns, please consult
            a healthcare professional.
          </p>
        </div>
      )}

      {trace.length > 0 && (
        <div className="card trace-card">
          <button
            className="why-toggle"
            onClick={() => setShowTrace((s) => !s)}
            aria-expanded={showTrace}
          >
            {showTrace ? 'Hide' : 'Show'} inference trace
          </button>
          {showTrace && (
            <ol className="trace-list">
              {trace.map((t, i) => (
                <li key={`${t.ruleId}-${i}`}>
                  <code>cycle {t.cycle}</code> fired{' '}
                  <strong>{t.ruleId}</strong>
                  <span className="trace-why">
                    {t.why
                      .map((w) => `${labelFor(w.id)} = ${formatValue(w.value)}`)
                      .join(', ')}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  )
}
