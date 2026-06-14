import { test } from 'node:test'
import assert from 'node:assert/strict'
import { infer, evaluateCondition } from './ruleEngine.js'
import { runAdvisor } from './advisor.js'

test('evaluateCondition handles operators', () => {
  assert.equal(evaluateCondition({ id: 'a', equals: 1 }, { a: 1 }), true)
  assert.equal(evaluateCondition({ id: 'a', gt: 5 }, { a: 10 }), true)
  assert.equal(evaluateCondition({ id: 'a', lt: 5 }, { a: 10 }), false)
  assert.equal(evaluateCondition({ id: 'a' }, { a: true }), true)
  assert.equal(evaluateCondition({ id: 'a' }, {}), false)
})

test('infer forward-chains derived facts', () => {
  const rules = [
    {
      id: 'R1',
      conditions: [{ id: 'x', equals: true }],
      conclude: [{ assert: { y: true } }],
    },
    {
      id: 'R2',
      conditions: [{ id: 'y', equals: true }],
      conclude: [{ result: { id: 'done', severity: 'info' } }],
    },
  ]
  const { facts, conclusions } = infer({ x: true }, rules)
  assert.equal(facts.y, true)
  assert.equal(conclusions.length, 1)
  assert.equal(conclusions[0].id, 'done')
})

test('advisor maps low eGFR to kidney failure (urgent)', () => {
  const report = runAdvisor({ egfr: '8' })
  const ids = report.conclusions.map((c) => c.id)
  assert.ok(ids.includes('kidney_failure'))
  assert.equal(report.conclusions[0].severity, 'urgent')
})

test('advisor detects AKI from NSAID + low output', () => {
  const report = runAdvisor({ recent_nsaid: true, urine_output: 'low' })
  assert.ok(report.conclusions.some((c) => c.id === 'aki'))
})

test('advisor returns no findings for empty input', () => {
  const report = runAdvisor({})
  assert.equal(report.hasFindings, false)
})
