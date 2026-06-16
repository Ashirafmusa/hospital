export default function QuestionField({ question, value, onChange }) {
  const { id, type, label, help, options, placeholder } = question

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {help && <p className="field-help">{help}</p>}

      {type === 'boolean' && (
        <div className="toggle-group" role="group" aria-label={label}>
          <button
            type="button"
            className={`toggle ${value === true ? 'is-yes' : ''}`}
            aria-pressed={value === true}
            onClick={() => onChange(id, value === true ? undefined : true)}
          >
            Yes
          </button>
          <button
            type="button"
            className={`toggle ${value === false ? 'is-no' : ''}`}
            aria-pressed={value === false}
            onClick={() => onChange(id, value === false ? undefined : false)}
          >
            No
          </button>
        </div>
      )}

      {type === 'choice' && (
        <div className="choice-group" role="group" aria-label={label}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`chip ${value === opt.value ? 'is-active' : ''}`}
              aria-pressed={value === opt.value}
              onClick={() => onChange(id, opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {type === 'number' && (
        <input
          id={id}
          className="text-input"
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(id, e.target.value)}
        />
      )}
    </div>
  )
}
