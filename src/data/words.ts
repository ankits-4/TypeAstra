export const COMMON_WORDS = [
  'the','of','and','a','to','in','is','you','that','it','he','was','for','on','are','as','with','his','they','I',
  'at','be','this','have','from','or','one','had','by','word','but','not','what','all','were','we','when','your','can','said',
  'there','use','an','each','which','she','do','how','their','if','will','up','other','about','out','many','then','them','these','so',
  'some','her','would','make','like','him','into','time','has','look','two','more','write','go','see','number','no','way','could','people',
  'my','than','first','water','been','call','who','oil','its','now','find','long','down','day','did','get','come','made','may','part',
  'over','new','sound','take','only','little','work','know','place','year','live','me','back','give','most','very','after','thing','our','just',
  'name','good','sentence','man','think','say','great','where','help','through','much','before','line','right','too','mean','old','any','same','tell',
  'boy','follow','came','want','show','also','around','form','three','small','set','put','end','does','another','well','large','must','big','even',
  'such','because','turn','here','why','ask','went','men','read','need','land','different','home','us','move','try','kind','hand','picture','again',
  'change','off','play','spell','air','away','animal','house','point','page','letter','mother','answer','found','study','still','learn','should','America','world',
]

export function generateRandomWords(count: number): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    out.push(COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)])
  }
  return out
}

const NUMBER_CHUNKS = ['12','345','6789','04','581','92','3301','77','4520','8','19','256','740','3','9081']

export function generateNumberText(wordCount: number): string {
  const out: string[] = []
  for (let i = 0; i < wordCount; i++) {
    out.push(NUMBER_CHUNKS[Math.floor(Math.random() * NUMBER_CHUNKS.length)])
  }
  return out.join(' ')
}

const PUNCT_SNIPPETS = [
  '"Hello," she said, "how are you?"', "It's a beautiful day; isn't it?", 'Wait... what?! (No way.)',
  'Items: apples, oranges, & pears.', "Don't stop — keep going!", 'She asked: "Really?"',
  '[Note] See page 12, section 3.', "That's (probably) not right...", 'Cost: $12.50 — final sale.',
  'Well, well, well... look at this.',
]

export function generatePunctuationText(count: number): string {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    out.push(PUNCT_SNIPPETS[Math.floor(Math.random() * PUNCT_SNIPPETS.length)])
  }
  return out.join(' ')
}

export function generateMixedWords(count: number): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const r = Math.random()
    if (r < 0.15) out.push(NUMBER_CHUNKS[Math.floor(Math.random() * NUMBER_CHUNKS.length)])
    else if (r < 0.3) {
      const w = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)]
      out.push(Math.random() < 0.5 ? w + ',' : w + '.')
    } else out.push(COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)])
  }
  return out
}

// key-focused drills, e.g. for lessons that target specific keys
export function generateKeyDrill(keys: string[], length = 40): string {
  const chars: string[] = []
  for (let i = 0; i < length; i++) {
    chars.push(keys[Math.floor(Math.random() * keys.length)])
    if ((i + 1) % (3 + Math.floor(Math.random() * 3)) === 0) chars.push(' ')
  }
  return chars.join('').trim().replace(/\s+/g, ' ')
}
