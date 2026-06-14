/**
 * A small CLIPS / Prolog-inspired forward-chaining inference engine.
 *
 * The engine keeps a working memory of "facts" (attribute -> value) and a set
 * of declarative "rules". Each rule has a list of conditions tested against the
 * working memory and a set of conclusions that are asserted when every
 * condition matches. Newly asserted facts can satisfy further rules, so the
 * engine keeps iterating until it reaches a fixed point (no rule fires).
 *
 * The engine is intentionally dependency-free so the whole expert system runs
 * in the browser with no backend.
 */

const OPERATORS = {
  equals: (actual, expected) => actual === expected,
  notEquals: (actual, expected) => actual !== expected,
  gt: (actual, expected) => Number(actual) > Number(expected),
  gte: (actual, expected) => Number(actual) >= Number(expected),
  lt: (actual, expected) => Number(actual) < Number(expected),
  lte: (actual, expected) => Number(actual) <= Number(expected),
  in: (actual, expected) => Array.isArray(expected) && expected.includes(actual),
  exists: (actual) => actual !== undefined && actual !== null,
}

/** Resolve the operator + comparison value used by a single condition. */
function evaluateCondition(condition, facts) {
  const actual = facts[condition.id]
  const opName = Object.keys(OPERATORS).find((op) => op in condition)
  if (!opName) {
    // No explicit operator -> treat as a truthiness / existence check.
    return Boolean(actual)
  }
  return OPERATORS[opName](actual, condition[opName])
}

/**
 * Run forward chaining over the supplied facts using the supplied rules.
 *
 * @param {Object} initialFacts - attribute -> value map of known facts.
 * @param {Array}  rules        - declarative rule list.
 * @returns {{ facts: Object, conclusions: Array, trace: Array }}
 */
export function infer(initialFacts, rules) {
  const facts = { ...initialFacts }
  const conclusions = []
  const trace = []
  const firedRules = new Set()

  // Rules with higher priority are considered first within each cycle.
  const ordered = [...rules].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
  )

  let changed = true
  let cycle = 0
  const MAX_CYCLES = 100

  while (changed && cycle < MAX_CYCLES) {
    changed = false
    cycle += 1

    for (const rule of ordered) {
      if (firedRules.has(rule.id)) continue

      const matched = rule.conditions.every((c) => evaluateCondition(c, facts))
      if (!matched) continue

      firedRules.add(rule.id)
      changed = true

      const why = rule.conditions.map((c) => ({
        id: c.id,
        value: facts[c.id],
      }))

      trace.push({ ruleId: rule.id, cycle, why })

      for (const conclusion of rule.conclude ?? []) {
        if (conclusion.assert) {
          for (const [key, value] of Object.entries(conclusion.assert)) {
            facts[key] = value
          }
        }
        if (conclusion.result) {
          conclusions.push({
            ...conclusion.result,
            ruleId: rule.id,
            why,
          })
        }
      }
    }
  }

  return { facts, conclusions, trace }
}

/** Helper kept separate so it can be unit tested in isolation. */
export { evaluateCondition }
