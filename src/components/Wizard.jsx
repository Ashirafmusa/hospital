import { useState } from 'react'
import QuestionField from './QuestionField.jsx'

export default function Wizard({ groups, answers, onAnswer, onBack, onFinish }) {
  const [index, setIndex] = useState(0)
  const group = groups[index]
  const isLast = index === groups.length - 1
  const progress = Math.round(((index + 1) / groups.length) * 100)

  function next() {
    if (isLast) {
      onFinish()
    } else {
      setIndex((i) => i + 1)
    }
  }

  function prev() {
    if (index === 0) {
      onBack()
    } else {
      setIndex((i) => i - 1)
    }
  }

  return (
    <section className="wizard card">
      <div className="wizard-head">
        <div className="steps">
          {groups.map((g, i) => (
            <span
              key={g.id}
              className={`step-dot ${i === index ? 'is-active' : ''} ${
                i < index ? 'is-done' : ''
              }`}
              title={g.title}
            />
          ))}
        </div>
        <span className="step-count">
          Step {index + 1} of {groups.length}
        </span>
      </div>

      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <header className="group-head">
        <span className="group-icon" aria-hidden="true">
          {group.icon}
        </span>
        <h2>{group.title}</h2>
      </header>

      <div className="fields">
        {group.questions.map((q) => (
          <QuestionField
            key={q.id}
            question={q}
            value={answers[q.id]}
            onChange={onAnswer}
          />
        ))}
      </div>

      <div className="wizard-actions">
        <button className="btn btn-ghost" onClick={prev}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={next}>
          {isLast ? 'Analyse symptoms' : 'Next →'}
        </button>
      </div>
    </section>
  )
}
