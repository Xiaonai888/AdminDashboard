import React from 'react'

export const STORY_LANGUAGE_CHOICES = [
  { value: 'all', code: 'ALL', label: 'All Languages', description: 'All author stories' },
  { value: 'khmer', code: 'KH', label: 'Khmer', description: 'Khmer stories' },
  { value: 'english', code: 'US', label: 'English', description: 'English stories' },
  { value: 'chinese', code: 'CN', label: 'Chinese', description: 'Chinese stories' },
  { value: 'japanese', code: 'JP', label: 'Japanese', description: 'Japanese stories' },
  { value: 'korean', code: 'KR', label: 'Korean', description: 'Korean stories' },
]

const styles = `
  .story-language-picker { margin-bottom: 4px; }
  .story-language-heading { margin: 0 0 12px; color: #334155; font-size: 13px; font-weight: 900; }
  .story-language-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
  .story-language-choice { position: relative; display: flex; align-items: center; gap: 10px; width: 100%; min-width: 0; min-height: 82px; padding: 13px; border: 1px solid #E2E8F0; border-radius: 13px; background: #FFFFFF; box-shadow: 0 2px 7px rgba(15,23,42,.05); color: #0F172A; font: inherit; text-align: left; cursor: pointer; transition: border-color .18s, box-shadow .18s, transform .18s; }
  .story-language-choice:hover:not(:disabled) { border-color: #A5B4FC; box-shadow: 0 7px 20px rgba(15,23,42,.09); transform: translateY(-1px); }
  .story-language-choice:focus-visible { outline: 3px solid rgba(79,70,229,.3); outline-offset: 2px; }
  .story-language-choice.is-selected { border-color: #4F46E5; box-shadow: 0 0 0 1px #4F46E5, 0 5px 15px rgba(79,70,229,.09); }
  .story-language-choice:disabled { opacity: .7; cursor: wait; }
  .story-language-code { flex: none; min-width: 28px; font-size: 17px; line-height: 1; font-weight: 600; }
  .story-language-info { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
  .story-language-name { font-size: 12px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .story-language-description { font-size: 10px; color: #64748B; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .story-language-choice.is-selected .story-language-description { color: #4F46E5; font-weight: 800; }
  .story-language-check { position: absolute; top: 8px; right: 10px; color: #4F46E5; font-size: 15px; font-weight: 900; }
  @media (max-width: 1220px) { .story-language-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 650px) { .story-language-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; } .story-language-choice { min-height: 76px; padding: 10px; } .story-language-code { min-width: 25px; font-size: 15px; } }
`

export default function StoryLanguagePicker({ value = 'all', onChange, disabled = false }) {
  const currentValue = String(value || 'all').toLowerCase()

  return (
    <section className="story-language-picker" aria-label="Filter admin stories by language">
      <style>{styles}</style>
      <div className="story-language-heading">Story Language</div>
      <div className="story-language-grid">
        {STORY_LANGUAGE_CHOICES.map((language) => {
          const selected = language.value === currentValue

          return (
            <button
              key={language.value}
              type="button"
              className={`story-language-choice ${selected ? 'is-selected' : ''}`}
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange?.(language.value)}
            >
              <span className="story-language-code" aria-hidden="true">{language.code}</span>
              <span className="story-language-info">
                <span className="story-language-name">{language.label}</span>
                <span className="story-language-description">{selected ? 'Selected' : language.description}</span>
              </span>
              {selected ? <span className="story-language-check" aria-hidden="true">✓</span> : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
