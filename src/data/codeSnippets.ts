export interface CodeSnippet {
  language: string
  code: string
}

export const CODE_SNIPPETS: CodeSnippet[] = [
  { language: 'JavaScript', code: `function add(a, b) {\n  return a + b;\n}` },
  { language: 'TypeScript', code: `interface User {\n  id: number;\n  name: string;\n}` },
  { language: 'Python', code: `def greet(name):\n    return f"Hello, {name}!"` },
  { language: 'HTML', code: `<div class="card">\n  <h1>Hello</h1>\n</div>` },
  { language: 'CSS', code: `.card {\n  padding: 16px;\n  border-radius: 8px;\n}` },
  { language: 'SQL', code: `SELECT id, name FROM users WHERE active = 1;` },
  { language: 'JSON', code: `{\n  "name": "TypAstra",\n  "version": "1.0.0"\n}` },
  { language: 'JavaScript', code: `const nums = [1, 2, 3].map(n => n * 2);` },
  { language: 'Python', code: `for i in range(10):\n    print(i ** 2)` },
  { language: 'TypeScript', code: `const sum = (a: number, b: number): number => a + b;` },
]

export function randomCodeSnippet(): string {
  return CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)].code
}
