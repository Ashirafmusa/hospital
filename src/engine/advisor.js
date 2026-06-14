import { infer } from './ruleEngine.js'
import { rules, allQuestions, SEVERITY } from '../data/knowledgeBase.js'

const SEVERITY_RANK = {
  [SEVERITY.URGENT]: 4,
  [SEVERITY.HIGH]: 3,
  [SEVERITY.MODERATE]: 2,
  [SEVERITY.INFO]: 1,
}

/**
 * Convert raw answers from the UI into a clean fact base.
 * Empty strings (e.g. an untouched numeric field) are dropped so they don't
 * accidentally satisfy numeric rules.
 */
export function answersToFacts(answers) {
  const facts = {}
  for (const q of allQuestions) {
    const value = answers[q.id]
    if (value === undefined || value === null || value === '') continue
    if (q.type === 'number') {
      const num = Number(value)
      if (!Number.isNaN(num)) facts[q.id] = num
    } else {
      facts[q.id] = value
    }
  }
  return facts
}

/**
 * Run the expert system end to end.
 * Returns the asserted facts, the ranked conclusions and the firing trace.
 */
export function runAdvisor(answers) {
  const facts = answersToFacts(answers)
  const { facts: derivedFacts, conclusions, trace } = infer(facts, rules)

  const ranked = [...conclusions].sort(
    (a, b) =>
      (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0),
  )

  const topSeverity = ranked.reduce(
    (max, c) => Math.max(max, SEVERITY_RANK[c.severity] ?? 0),
    0,
  )

  return {
    facts: derivedFacts,
    conclusions: ranked,
    trace,
    topSeverity,
    hasFindings: ranked.length > 0,
  }
}

export { SEVERITY_RANK }
