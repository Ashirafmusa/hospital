import { useMemo, useState } from 'react'
import { questionGroups } from './data/knowledgeBase.js'
import { runAdvisor } from './engine/advisor.js'
import Hero from './components/Hero.jsx'
import Wizard from './components/Wizard.jsx'
import Results from './components/Results.jsx'
import Disclaimer from './components/Disclaimer.jsx'

const STAGE = {
  INTRO: 'intro',
  WIZARD: 'wizard',
  RESULTS: 'results',
}

export default function App() {
  const [stage, setStage] = useState(STAGE.INTRO)
  const [answers, setAnswers] = useState({})

  const report = useMemo(
    () => (stage === STAGE.RESULTS ? runAdvisor(answers) : null),
    [stage, answers],
  )

  function setAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  function restart() {
    setAnswers({})
    setStage(STAGE.INTRO)
  }

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>

      <header className="topbar">
        <div className="brand" onClick={restart} role="button" tabIndex={0}>
          <img src="/kidney.svg" alt="" className="brand-logo" />
          <div>
            <span className="brand-name">Nephro Advisor</span>
            <span className="brand-tag">Kidney Specialist Expert System</span>
          </div>
        </div>
        <span className="badge-rule">Rule-based · forward chaining</span>
      </header>

      <main className="content">
        {stage === STAGE.INTRO && (
          <Hero
            groups={questionGroups}
            onStart={() => setStage(STAGE.WIZARD)}
          />
        )}

        {stage === STAGE.WIZARD && (
          <Wizard
            groups={questionGroups}
            answers={answers}
            onAnswer={setAnswer}
            onBack={() => setStage(STAGE.INTRO)}
            onFinish={() => setStage(STAGE.RESULTS)}
          />
        )}

        {stage === STAGE.RESULTS && report && (
          <Results
            report={report}
            onRestart={restart}
            onEdit={() => setStage(STAGE.WIZARD)}
          />
        )}
      </main>

      <Disclaimer />

      <footer className="footer">
        <span>
          Built for education — demonstrating a CLIPS / Prolog-style inference
          engine in JavaScript.
        </span>
      </footer>
    </div>
  )
}
