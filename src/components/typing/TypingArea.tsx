import { useRef, useEffect } from 'react'
import { CharState } from '../../types'

interface TypingAreaProps {
  text: string
  charStates: CharState[]
  typed: string
  onChange: (value: string) => void
  disabled?: boolean
  shake?: boolean
  fontSize?: 'md' | 'lg'
  smoothCaret?: boolean
}

export default function TypingArea({ text, charStates, typed, onChange, disabled, shake, fontSize = 'lg', smoothCaret = true }: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-surface/90 p-5 md:p-8 cursor-text astral-card ${shake ? 'shake' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        value={typed}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing input"
        className="absolute h-px w-px opacity-0"
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          // allow backspace/normal typing; block browser shortcuts that could paste-like inject
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') e.preventDefault()
        }}
      />
      <p
        className={`font-mono leading-relaxed tracking-wide select-none ${
          fontSize === 'lg' ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
        }`}
        style={{ wordBreak: 'break-word' }}
      >
        {text.split('').map((char, i) => {
          const state = charStates[i]
          const cls =
            state === 'correct'
              ? 'text-good'
              : state === 'incorrect'
              ? 'text-bad bg-bad/10 rounded-[2px]'
              : state === 'current'
              ? `text-ink ${smoothCaret ? 'char-current' : 'border-l-2 border-accent'}`
              : 'text-muted'
          return (
            <span key={i} className={cls}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          )
        })}
      </p>
    </div>
  )
}
