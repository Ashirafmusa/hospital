/**
 * Kidney (nephrology) knowledge base for the expert system.
 *
 * This file is the "domain" layer: it declares the questions presented to the
 * user (which become facts) and the rules the inference engine reasons over.
 *
 * IMPORTANT: This is a simplified, educational demonstration of rule-based
 * reasoning. It is NOT a diagnostic tool and must not be used for real medical
 * decisions.
 */

/* ------------------------------------------------------------------ */
/* Questions -> facts                                                  */
/* ------------------------------------------------------------------ */

export const questionGroups = [
  {
    id: 'risk',
    title: 'Risk factors & history',
    icon: '🩺',
    questions: [
      {
        id: 'diabetes',
        type: 'boolean',
        label: 'Do you have diabetes?',
        help: 'Diabetes is the leading cause of chronic kidney disease.',
      },
      {
        id: 'hypertension',
        type: 'boolean',
        label: 'Do you have high blood pressure (hypertension)?',
      },
      {
        id: 'family_kidney_disease',
        type: 'boolean',
        label: 'Any family history of kidney disease?',
      },
      {
        id: 'recent_nsaid',
        type: 'boolean',
        label: 'Recent heavy use of painkillers (NSAIDs like ibuprofen)?',
        help: 'NSAIDs and dehydration are common causes of acute kidney injury.',
      },
    ],
  },
  {
    id: 'symptoms',
    title: 'Symptoms',
    icon: '🌡️',
    questions: [
      {
        id: 'swelling',
        type: 'boolean',
        label: 'Swelling (edema) in legs, ankles, feet or around the eyes?',
      },
      {
        id: 'foamy_urine',
        type: 'boolean',
        label: 'Persistently foamy or bubbly urine?',
        help: 'Foamy urine can indicate protein leaking into the urine.',
      },
      {
        id: 'blood_in_urine',
        type: 'boolean',
        label: 'Blood in the urine (pink, red or cola-coloured)?',
      },
      {
        id: 'painful_urination',
        type: 'boolean',
        label: 'Pain or burning when urinating?',
      },
      {
        id: 'frequent_night_urination',
        type: 'boolean',
        label: 'Needing to urinate often at night (nocturia)?',
      },
      {
        id: 'flank_pain',
        type: 'boolean',
        label: 'One-sided pain in the back or side (flank)?',
      },
      {
        id: 'fever',
        type: 'boolean',
        label: 'Fever or chills?',
      },
      {
        id: 'fatigue',
        type: 'boolean',
        label: 'Unusual tiredness, weakness or poor concentration?',
      },
      {
        id: 'nausea',
        type: 'boolean',
        label: 'Nausea, vomiting or loss of appetite?',
      },
      {
        id: 'urine_output',
        type: 'choice',
        label: 'How is your urine output recently?',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'low', label: 'Much less than usual' },
          { value: 'high', label: 'Much more than usual' },
        ],
        default: 'normal',
      },
    ],
  },
  {
    id: 'labs',
    title: 'Lab values (optional)',
    icon: '🧪',
    questions: [
      {
        id: 'egfr',
        type: 'number',
        label: 'eGFR (mL/min/1.73m²) — leave blank if unknown',
        placeholder: 'e.g. 55',
        help: 'Estimated glomerular filtration rate. Lower means worse kidney function.',
        optional: true,
      },
      {
        id: 'acr',
        type: 'number',
        label: 'Urine albumin-to-creatinine ratio, ACR (mg/g) — optional',
        placeholder: 'e.g. 120',
        optional: true,
      },
    ],
  },
]

/** Flat list of all questions, useful for lookups. */
export const allQuestions = questionGroups.flatMap((g) => g.questions)

/* ------------------------------------------------------------------ */
/* Rules                                                               */
/* ------------------------------------------------------------------ */

const SEVERITY = {
  INFO: 'info',
  MODERATE: 'moderate',
  HIGH: 'high',
  URGENT: 'urgent',
}

export const rules = [
  /* ----- Derived facts: CKD stage from eGFR ----------------------- */
  {
    id: 'EGFR-G1',
    priority: 50,
    conditions: [{ id: 'egfr', gte: 90 }],
    conclude: [{ assert: { ckd_stage: 'G1', egfr_known: true } }],
  },
  {
    id: 'EGFR-G2',
    priority: 50,
    conditions: [{ id: 'egfr', gte: 60 }, { id: 'egfr', lt: 90 }],
    conclude: [{ assert: { ckd_stage: 'G2', egfr_known: true } }],
  },
  {
    id: 'EGFR-G3a',
    priority: 50,
    conditions: [{ id: 'egfr', gte: 45 }, { id: 'egfr', lt: 60 }],
    conclude: [{ assert: { ckd_stage: 'G3a', egfr_known: true, reduced_function: true } }],
  },
  {
    id: 'EGFR-G3b',
    priority: 50,
    conditions: [{ id: 'egfr', gte: 30 }, { id: 'egfr', lt: 45 }],
    conclude: [{ assert: { ckd_stage: 'G3b', egfr_known: true, reduced_function: true } }],
  },
  {
    id: 'EGFR-G4',
    priority: 50,
    conditions: [{ id: 'egfr', gte: 15 }, { id: 'egfr', lt: 30 }],
    conclude: [{ assert: { ckd_stage: 'G4', egfr_known: true, reduced_function: true } }],
  },
  {
    id: 'EGFR-G5',
    priority: 50,
    conditions: [{ id: 'egfr', lt: 15 }],
    conclude: [{ assert: { ckd_stage: 'G5', egfr_known: true, kidney_failure: true } }],
  },

  /* ----- Derived fact: albuminuria from ACR ----------------------- */
  {
    id: 'ACR-HIGH',
    priority: 50,
    conditions: [{ id: 'acr', gte: 30 }],
    conclude: [{ assert: { albuminuria: true } }],
  },

  /* ----- CKD stage reporting ------------------------------------- */
  {
    id: 'CKD-STAGE-REPORT',
    priority: 30,
    conditions: [{ id: 'reduced_function', equals: true }],
    conclude: [
      {
        result: {
          id: 'ckd',
          title: 'Reduced kidney function (CKD pattern)',
          severity: SEVERITY.HIGH,
          category: 'Chronic',
          summary:
            'Your eGFR indicates reduced kidney function consistent with a stage of chronic kidney disease (CKD).',
          advice:
            'Arrange a review with a doctor/nephrologist. Repeat kidney function tests, control blood pressure and blood sugar, and review your medications.',
        },
      },
    ],
  },
  {
    id: 'KIDNEY-FAILURE',
    priority: 40,
    conditions: [{ id: 'kidney_failure', equals: true }],
    conclude: [
      {
        result: {
          id: 'kidney_failure',
          title: 'Severely reduced kidney function (eGFR < 15)',
          severity: SEVERITY.URGENT,
          category: 'Chronic',
          summary:
            'An eGFR below 15 indicates kidney failure (CKD stage G5). This needs specialist care.',
          advice:
            'Seek urgent nephrology care. Treatments such as dialysis or transplant planning may be required.',
        },
      },
    ],
  },

  /* ----- CKD risk (no labs, risk + symptoms) --------------------- */
  {
    id: 'CKD-RISK',
    priority: 20,
    conditions: [
      { id: 'diabetes', equals: true },
      { id: 'frequent_night_urination', equals: true },
    ],
    conclude: [
      {
        result: {
          id: 'ckd_risk',
          title: 'Elevated risk of chronic kidney disease',
          severity: SEVERITY.MODERATE,
          category: 'Chronic',
          summary:
            'Diabetes combined with nocturia (frequent night urination) raises the likelihood of early chronic kidney disease.',
          advice:
            'Ask your doctor for an eGFR blood test and a urine albumin (ACR) test to screen for kidney damage.',
        },
      },
    ],
  },
  {
    id: 'CKD-RISK-HTN',
    priority: 20,
    conditions: [
      { id: 'hypertension', equals: true },
      { id: 'swelling', equals: true },
    ],
    conclude: [
      {
        result: {
          id: 'ckd_risk_htn',
          title: 'Possible hypertensive kidney involvement',
          severity: SEVERITY.MODERATE,
          category: 'Chronic',
          summary:
            'High blood pressure together with swelling may reflect fluid retention from impaired kidney function.',
          advice:
            'Have your blood pressure, kidney function and urine protein checked. Reducing salt intake often helps.',
        },
      },
    ],
  },

  /* ----- Nephrotic / proteinuria pattern ------------------------- */
  {
    id: 'NEPHROTIC',
    priority: 25,
    conditions: [
      { id: 'swelling', equals: true },
      { id: 'foamy_urine', equals: true },
    ],
    conclude: [
      {
        result: {
          id: 'nephrotic',
          title: 'Proteinuria / possible nephrotic pattern',
          severity: SEVERITY.HIGH,
          category: 'Glomerular',
          summary:
            'Swelling plus persistently foamy urine suggests protein is leaking into the urine (proteinuria), which can point to a glomerular disorder such as nephrotic syndrome.',
          advice:
            'See a doctor for a urine protein/ACR test and kidney function tests. A nephrology referral is often appropriate.',
        },
      },
    ],
  },

  /* ----- Glomerulonephritis (nephritic) pattern ------------------ */
  {
    id: 'GLOMERULONEPHRITIS',
    priority: 25,
    conditions: [
      { id: 'blood_in_urine', equals: true },
      { id: 'swelling', equals: true },
      { id: 'hypertension', equals: true },
    ],
    conclude: [
      {
        result: {
          id: 'glomerulonephritis',
          title: 'Possible glomerulonephritis (nephritic pattern)',
          severity: SEVERITY.HIGH,
          category: 'Glomerular',
          summary:
            'Blood in the urine with swelling and high blood pressure is a classic nephritic pattern that can indicate inflammation of the kidney filters.',
          advice:
            'Prompt medical assessment is recommended, including urine microscopy, kidney function and blood pressure review.',
        },
      },
    ],
  },

  /* ----- Acute kidney injury ------------------------------------- */
  {
    id: 'AKI',
    priority: 35,
    conditions: [
      { id: 'recent_nsaid', equals: true },
      { id: 'urine_output', equals: 'low' },
    ],
    conclude: [
      {
        result: {
          id: 'aki',
          title: 'Possible acute kidney injury (AKI)',
          severity: SEVERITY.URGENT,
          category: 'Acute',
          summary:
            'A recent painkiller (NSAID) load together with sharply reduced urine output can trigger acute kidney injury, especially with dehydration.',
          advice:
            'Stop NSAIDs, stay hydrated if able, and seek medical care promptly for kidney function testing.',
        },
      },
    ],
  },
  {
    id: 'AKI-UREMIA',
    priority: 35,
    conditions: [
      { id: 'urine_output', equals: 'low' },
      { id: 'nausea', equals: true },
      { id: 'fatigue', equals: true },
    ],
    conclude: [
      {
        result: {
          id: 'uremia',
          title: 'Reduced output with uraemic symptoms',
          severity: SEVERITY.URGENT,
          category: 'Acute',
          summary:
            'Low urine output combined with nausea and marked fatigue may reflect a build-up of waste products (uraemia) from failing kidneys.',
          advice:
            'This combination warrants urgent medical evaluation.',
        },
      },
    ],
  },

  /* ----- Lower urinary tract infection --------------------------- */
  {
    id: 'UTI',
    priority: 20,
    conditions: [
      { id: 'painful_urination', equals: true },
      { id: 'flank_pain', notEquals: true },
    ],
    conclude: [
      {
        result: {
          id: 'uti',
          title: 'Possible lower urinary tract infection (UTI)',
          severity: SEVERITY.MODERATE,
          category: 'Infection',
          summary:
            'Burning or painful urination without flank pain commonly indicates a lower urinary tract (bladder) infection.',
          advice:
            'See a doctor for a urine test. Increase fluid intake; antibiotics may be needed.',
        },
      },
    ],
  },

  /* ----- Upper UTI / pyelonephritis ------------------------------ */
  {
    id: 'PYELONEPHRITIS',
    priority: 30,
    conditions: [
      { id: 'painful_urination', equals: true },
      { id: 'flank_pain', equals: true },
      { id: 'fever', equals: true },
    ],
    conclude: [
      {
        result: {
          id: 'pyelonephritis',
          title: 'Possible kidney infection (pyelonephritis)',
          severity: SEVERITY.HIGH,
          category: 'Infection',
          summary:
            'Painful urination together with flank pain and fever suggests the infection may have reached the kidney (pyelonephritis).',
          advice:
            'Seek medical care promptly — kidney infections usually require antibiotics and sometimes hospital treatment.',
        },
      },
    ],
  },

  /* ----- Kidney stones ------------------------------------------- */
  {
    id: 'STONES',
    priority: 25,
    conditions: [
      { id: 'flank_pain', equals: true },
      { id: 'blood_in_urine', equals: true },
      { id: 'fever', notEquals: true },
    ],
    conclude: [
      {
        result: {
          id: 'stones',
          title: 'Possible kidney stones (nephrolithiasis)',
          severity: SEVERITY.MODERATE,
          category: 'Structural',
          summary:
            'Severe one-sided flank pain with blood in the urine (and no fever) is a typical presentation of kidney stones.',
          advice:
            'See a doctor for imaging. Pain relief and increased fluids are common; some stones need a procedure.',
        },
      },
    ],
  },

  /* ----- General wellbeing fallback ------------------------------ */
  {
    id: 'HYDRATION',
    priority: 5,
    conditions: [{ id: 'urine_output', equals: 'high' }],
    conclude: [
      {
        result: {
          id: 'polyuria',
          title: 'Increased urine output (polyuria)',
          severity: SEVERITY.INFO,
          category: 'General',
          summary:
            'Passing much more urine than usual can be caused by high fluid intake, but persistent polyuria can also relate to diabetes or kidney concentrating problems.',
          advice:
            'If this persists, ask your doctor to check blood sugar and kidney function.',
        },
      },
    ],
  },
]

export { SEVERITY }
