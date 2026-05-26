/**
 * Phase 1 Verification Script
 * Checks all 5 success criteria from ROADMAP.md
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

let pass = 0
let fail = 0
const results = []

function check(label, condition, detail = '') {
  if (condition) {
    pass++
    results.push(`  ✅ ${label}`)
  } else {
    fail++
    results.push(`  ❌ ${label}${detail ? ' — ' + detail : ''}`)
  }
}

console.log('\n═══════════════════════════════════════════')
console.log('  Phase 1 Verification')
console.log('═══════════════════════════════════════════\n')

// ---- Criterion 1: Vite config has base: '/annotation/' ----
console.log('Criterion 1: Vite dev server with base: \'/annotation/\'')
try {
  const viteConfig = readFileSync(resolve(__dirname, 'vite.config.js'), 'utf8')
  check('vite.config.js exists', true)
  check('base: \'/data-annotation/\' is set', viteConfig.includes("'/data-annotation/'"))
} catch (e) {
  check('vite.config.js exists', false, e.message)
}

// ---- Criterion 2: ESLint banned-terminology rule ----
console.log('\nCriterion 2: ESLint banned-terminology rule')
try {
  const eslintConfig = readFileSync(resolve(__dirname, 'eslint.config.js'), 'utf8')
  check('eslint.config.js exists', true)
  const bannedTerms = ['flag', 'zone', 'clue', 'hint', 'classif', 'moderat']
  for (const term of bannedTerms) {
    check(`Bans '${term}'`, eslintConfig.includes(term))
  }
  check('Uses no-restricted-syntax rule', eslintConfig.includes('no-restricted-syntax'))
} catch (e) {
  check('eslint.config.js exists', false, e.message)
}

// ---- Criterion 3: All 10 scenarios importable with no undefined fields ----
console.log('\nCriterion 3: Scenarios data integrity')
try {
  // Read scenarios.js raw
  const scenariosRaw = readFileSync(resolve(__dirname, 'src/data/scenarios.js'), 'utf8')
  check('src/data/scenarios.js exists', true)

  // Read taxonomy.js raw
  const taxonomyRaw = readFileSync(resolve(__dirname, 'src/data/taxonomy.js'), 'utf8')
  check('src/data/taxonomy.js exists', true)

  // Extract signal IDs from taxonomy
  const signalMatches = taxonomyRaw.matchAll(/id:\s*'([^']+)'/g)
  const allTaxonomyIds = new Set([...signalMatches].map(m => m[1]))
  check(`Taxonomy has signal IDs (found ${allTaxonomyIds.size})`, allTaxonomyIds.size >= 10)

  // Parse scenarios (simple eval-based approach since it's an ES module)
  // Check for 10 scenario blocks
  const scenarioIdMatches = [...scenariosRaw.matchAll(/id:\s*(\d+)/g)]
  check(`Has 10 scenarios (found ${scenarioIdMatches.length})`, scenarioIdMatches.length === 10)

  // Check for undefined/null fields that shouldn't be null
  const requiredFields = ['id', 'title', 'email', 'answer', 'scoring']
  for (const field of requiredFields) {
    const fieldPattern = new RegExp(`${field}:`, 'g')
    const matches = scenariosRaw.match(fieldPattern)
    check(`All scenarios have '${field}' field (${matches ? matches.length : 0} occurrences)`,
      matches && matches.length >= 10)
  }

  // Check email sub-fields
  const emailFields = ['from', 'replyTo', 'to', 'subject', 'body']
  for (const field of emailFields) {
    const fieldPattern = new RegExp(`${field}:`, 'g')
    const matches = scenariosRaw.match(fieldPattern)
    check(`All emails have '${field}' (${matches ? matches.length : 0})`,
      matches && matches.length >= 10)
  }

  // Check scoring sub-fields
  const scoringFields = ['severity', 'signals', 'action']
  for (const field of scoringFields) {
    // scoring.X.correct or scoring.X.required
    const hasField = scenariosRaw.includes(`${field}:`)
    check(`Scoring has '${field}' fields`, hasField)
  }

  // Check all signal IDs in rubrics exist in taxonomy
  const rubricSignals = new Set()
  const requiredSignalMatches = scenariosRaw.matchAll(/required:\s*\[([^\]]*)\]/g)
  for (const m of requiredSignalMatches) {
    const ids = m[1].matchAll(/'([^']+)'/g)
    for (const id of ids) {
      rubricSignals.add(id[1])
    }
  }
  const partialSignalMatches = scenariosRaw.matchAll(/partial:\s*\[([^\]]*)\]/g)
  for (const m of partialSignalMatches) {
    const ids = m[1].matchAll(/'([^']+)'/g)
    for (const id of ids) {
      rubricSignals.add(id[1])
    }
  }

  let missingSignals = []
  for (const sig of rubricSignals) {
    if (!allTaxonomyIds.has(sig)) {
      missingSignals.push(sig)
    }
  }
  check(`All rubric signal IDs exist in taxonomy (${rubricSignals.size} unique signals)`,
    missingSignals.length === 0,
    missingSignals.length > 0 ? `Missing: ${missingSignals.join(', ')}` : '')

} catch (e) {
  check('Scenarios/taxonomy files exist', false, e.message)
}

// ---- Criterion 4: Scenario 9 auth-fail + no answer signal missing from scoring ----
console.log('\nCriterion 4: Scenario 9 auth-fail & answer/scoring consistency')
try {
  const scenariosRaw = readFileSync(resolve(__dirname, 'src/data/scenarios.js'), 'utf8')

  // Find scenario 9 block (between id: 9 and id: 10)
  const s9Start = scenariosRaw.indexOf("id: 9")
  const s9End = scenariosRaw.indexOf("id: 10")
  const s9Block = scenariosRaw.substring(s9Start, s9End)

  // Check auth-fail in answer.signals
  const answerSection = s9Block.substring(s9Block.indexOf('answer:'), s9Block.indexOf('scoring:'))
  check('S9 answer.signals includes auth-fail',
    answerSection.includes("'auth-fail'"))

  // Check auth-fail in scoring.signals.required
  const scoringSection = s9Block.substring(s9Block.indexOf('scoring:'))
  const requiredMatch = scoringSection.match(/required:\s*\[([^\]]+)\]/)
  check('S9 scoring.signals.required includes auth-fail',
    requiredMatch && requiredMatch[1].includes("'auth-fail'"))

  // Check ALL scenarios: every answer signal should appear in scoring (required ∪ partial)
  // Parse each scenario block
  const scenarioBlocks = scenariosRaw.split(/\{\s*\n\s*id:/).slice(1)
  let allConsistent = true
  let inconsistencies = []

  for (let i = 0; i < scenarioBlocks.length; i++) {
    const block = scenarioBlocks[i]
    const idMatch = block.match(/(\d+)/)
    const scenarioId = idMatch ? idMatch[1] : i + 1

    // Extract answer signals
    const answerSigMatch = block.match(/answer:\s*\{[^}]*signals:\s*\[([^\]]*)\]/)
    if (!answerSigMatch) continue
    const answerSignals = [...answerSigMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1])

    // Extract scoring required + partial signals
    const scoringBlock = block.substring(block.indexOf('scoring:'))
    const reqMatch = scoringBlock.match(/signals:\s*\{[^}]*required:\s*\[([^\]]*)\]/)
    const partMatch = scoringBlock.match(/partial:\s*\[([^\]]*)\]/)

    const requiredSignals = reqMatch ? [...reqMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]) : []

    // Need to be more careful with partial - find the signals.partial not severity.partial
    const signalsSectionMatch = scoringBlock.match(/signals:\s*\{([^}]+)\}/)
    let partialSignals = []
    if (signalsSectionMatch) {
      const sigSection = signalsSectionMatch[1]
      const partialInSig = sigSection.match(/partial:\s*\[([^\]]*)\]/)
      if (partialInSig) {
        partialSignals = [...partialInSig[1].matchAll(/'([^']+)'/g)].map(m => m[1])
      }
    }

    const scoringSignals = new Set([...requiredSignals, ...partialSignals])

    for (const sig of answerSignals) {
      if (!scoringSignals.has(sig)) {
        allConsistent = false
        inconsistencies.push(`S${scenarioId}: '${sig}' in answer but not in scoring`)
      }
    }
  }

  check('No answer signal absent from scoring rubric',
    allConsistent,
    inconsistencies.length > 0 ? inconsistencies.join('; ') : '')

} catch (e) {
  check('Scenario 9 verification', false, e.message)
}

// ---- Criterion 5: taxonomy.js exports ----
console.log('\nCriterion 5: Taxonomy exports')
try {
  const taxonomyRaw = readFileSync(resolve(__dirname, 'src/data/taxonomy.js'), 'utf8')
  check('Exports SEVERITY_OPTS', taxonomyRaw.includes('export const SEVERITY_OPTS'))
  check('Exports SIGNAL_OPTS', taxonomyRaw.includes('export const SIGNAL_OPTS'))
  check('Exports ACTION_OPTS', taxonomyRaw.includes('export const ACTION_OPTS'))

  // Count severity options (should be 5)
  const sevCount = (taxonomyRaw.match(/id:\s*'[^']+',\s*label:\s*'[^']+',\s*cls:/g) || []).length
  check(`SEVERITY_OPTS has 5 entries (found ${sevCount})`, sevCount === 5)

  // Count signal options (should be 10)
  const sigBlocks = taxonomyRaw.substring(
    taxonomyRaw.indexOf('SIGNAL_OPTS'),
    taxonomyRaw.indexOf('ACTION_OPTS')
  )
  const sigCount = (sigBlocks.match(/id:\s*'/g) || []).length
  check(`SIGNAL_OPTS has 10 entries (found ${sigCount})`, sigCount === 10)

  // Count action options (should be 4)
  const actBlock = taxonomyRaw.substring(taxonomyRaw.indexOf('ACTION_OPTS'))
  const actCount = (actBlock.match(/id:\s*'/g) || []).length
  check(`ACTION_OPTS has 4 entries (found ${actCount})`, actCount === 4)

} catch (e) {
  check('taxonomy.js verification', false, e.message)
}

// ---- Additional checks ----
console.log('\nAdditional checks:')

// Check for lint errors
try {
  const mainJsx = readFileSync(resolve(__dirname, 'src/main.jsx'), 'utf8')
  check('main.jsx imports App', mainJsx.includes("import App"))
  check('main.jsx renders App', mainJsx.includes('<App'))

  // Check if App.jsx is still boilerplate
  const appJsx = readFileSync(resolve(__dirname, 'src/App.jsx'), 'utf8')
  const isBoilerplate = appJsx.includes('Count is {count}') || appJsx.includes('Get started')
  check('App.jsx is NOT boilerplate', !isBoilerplate,
    isBoilerplate ? 'Still contains Vite scaffold code' : '')

  // Check index.html title
  const indexHtml = readFileSync(resolve(__dirname, 'index.html'), 'utf8')
  check('index.html has proper title',
    !indexHtml.includes('annotation-temp'),
    indexHtml.includes('annotation-temp') ? 'Still has placeholder title "annotation-temp"' : '')

  // Check package.json for unnecessary deps
  const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8'))
  const hasRouter = pkg.dependencies && pkg.dependencies['react-router-dom']
  check('No unnecessary react-router-dom dependency',
    !hasRouter,
    hasRouter ? 'react-router-dom installed but CLAUDE.md says no router' : '')

} catch (e) {
  check('Additional checks', false, e.message)
}

// ---- Summary ----
console.log('\n═══════════════════════════════════════════')
console.log('  Results')
console.log('═══════════════════════════════════════════')
for (const r of results) console.log(r)
console.log(`\n  Total: ${pass} passed, ${fail} failed out of ${pass + fail}`)
if (fail > 0) {
  console.log('  ⚠️  Phase 1 has unresolved issues!')
} else {
  console.log('  ✅ Phase 1 fully verified!')
}
console.log('')
