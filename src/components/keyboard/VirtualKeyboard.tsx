const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
]

const FINGER_KEYS: Record<string, string[]> = {
  'Left pinky': ['q', 'a', 'z'],
  'Left ring': ['w', 's', 'x'],
  'Left middle': ['e', 'd', 'c'],
  'Left index': ['r', 'f', 'v', 't', 'g', 'b'],
  'Right index': ['y', 'h', 'n', 'u', 'j', 'm'],
  'Right middle': ['i', 'k', ','],
  'Right ring': ['o', 'l', '.'],
  'Right pinky': ['p', ';'],
}

const FINGER_ORDER = ['Left pinky', 'Left ring', 'Left middle', 'Left index', 'Right index', 'Right middle', 'Right ring', 'Right pinky']

interface VirtualKeyboardProps {
  nextChar?: string | null
  lastResult?: 'correct' | 'incorrect' | null
  showFingerGuide?: boolean
}

export default function VirtualKeyboard({ nextChar, lastResult, showFingerGuide = false }: VirtualKeyboardProps) {
  const next = nextChar?.toLowerCase()

  function fingerFor(key: string): string | null {
    for (const [finger, keys] of Object.entries(FINGER_KEYS)) {
      if (keys.includes(key)) return finger
    }
    return null
  }

  return (
    <section className="rounded-xl border border-border bg-surface/70 p-4 md:p-5 astral-card select-none" aria-label="Virtual keyboard">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Live keyboard guide</p>
          <p className="text-xs text-muted">The glowing key is next. Follow the animated finger marker.</p>
        </div>
        {next && <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-mono text-accent">Next: {next === ' ' ? 'space' : next.toUpperCase()}</span>}
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[500px] flex flex-col items-center gap-1.5">
          <div className="flex w-full gap-1.5">
            <KeyLabel label="Tab" wide />
            {ROWS[0].map((key) => <Key key={key} keyValue={key} isNext={key === next} lastResult={lastResult} />)}
            <KeyLabel label="⌫" wide />
          </div>
          <div className="flex w-full gap-1.5 pl-5">
            <KeyLabel label="Caps" wide />
            {ROWS[1].map((key) => <Key key={key} keyValue={key} isNext={key === next} lastResult={lastResult} />)}
            <KeyLabel label="Enter" wide />
          </div>
          <div className="flex w-full gap-1.5 pl-10">
            <KeyLabel label="Shift" wide />
            {ROWS[2].map((key) => <Key key={key} keyValue={key} isNext={key === next} lastResult={lastResult} />)}
            <KeyLabel label="Shift" wide />
          </div>
          <div className={`flex h-8 w-[45%] items-center justify-center rounded-md border text-[10px] font-mono uppercase transition-all ${next === ' ' ? 'border-accent bg-accent/25 text-accent keyboard-target' : 'border-border bg-surface-2 text-muted'}`}>Space</div>
        </div>
      </div>
      {showFingerGuide && next && (
        <div className="mt-4 flex flex-col items-center gap-2 text-xs text-muted">
          <div className="flex items-end gap-1.5" aria-label={`Hand position: ${fingerFor(next) ?? 'thumb'}`}>
            {FINGER_ORDER.map((finger, index) => {
              const active = finger === fingerFor(next)
              return <span key={finger} title={finger} className={`hand-finger ${active ? 'hand-finger-active' : ''}`} style={{ height: `${22 + (index === 3 || index === 4 ? 13 : index === 2 || index === 5 ? 8 : 3)}px` }} />
            })}
          </div>
          <span className="flex items-center gap-2"><span className="finger-pulse text-base text-accent">☝</span>{fingerFor(next) ? `Use your ${fingerFor(next)} finger` : 'Use your thumb for space'}</span>
        </div>
      )}
    </section>
  )
}

function Key({ keyValue, isNext, lastResult }: { keyValue: string; isNext: boolean; lastResult?: 'correct' | 'incorrect' | null }) {
  const activeStyle = lastResult === 'incorrect' ? 'border-bad bg-bad/15 text-bad' : 'border-accent bg-accent/25 text-accent keyboard-target'
  return <div className={`flex h-9 flex-1 items-center justify-center rounded-md border text-xs font-mono uppercase transition-all ${isNext ? activeStyle : 'border-border bg-surface-2 text-muted'}`}>{keyValue}</div>
}

function KeyLabel({ label, wide }: { label: string; wide?: boolean }) {
  return <div className={`flex h-9 items-center justify-center rounded-md border border-border bg-surface-2 px-2 text-[10px] font-mono text-muted ${wide ? 'min-w-11' : ''}`}>{label}</div>
}
