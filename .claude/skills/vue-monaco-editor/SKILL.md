---
name: vue-monaco-editor
description: >
  Step-by-step guide for building a Vim-style Markdown editor with Vue 3 +
  Monaco Editor. Trigger when the user asks how to create, scaffold, or build
  a markdown editor, code editor, Monaco-based editor, or writing app —
  especially one with Vim keybindings.
---

# Building a Vim-Style Markdown Editor with Vue 3 + Monaco

This guide walks through building a dedicated Markdown editor with Vim mode,
TextMate-powered syntax highlighting, live preview, and a dark VSCode-like UI.

## Architecture Overview

```
Vite dev server
  └─ Vue 3 SPA
       ├─ Monaco Editor (markdown mode)
       │    ├─ monaco-vim → Vim keybindings
       │    └─ TextMate grammars → code block syntax highlight
       ├─ Markdown preview panel (marked)
       ├─ Settings panel (Pinia store)
       └─ Tailwind CSS v4 + Iconify → UI
```

## Phase 1 — Project Scaffold

```bash
npm create vite@latest my-md-editor -- --template vue-ts
cd my-md-editor
npm install monaco-editor monaco-vim pinia
npm install -D @tailwindcss/vite tailwindcss
npm install @iconify/vue marked
```

**vite.config.ts** — add Tailwind plugin AFTER `vue()`:
```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
```

**src/main.css** — create with Tailwind import + theme tokens:
```css
@import "tailwindcss";
@theme {
  --color-bg: var(--t-bg);
  --color-bg-alt: var(--t-bg-alt);
  --color-text: var(--t-text);
  --color-accent: var(--t-accent);
  /* ... define all color tokens referencing CSS variables ... */
}
:root { --t-bg: #1e1e1e; --t-text: #cccccc; /* dark defaults */ }
html.theme-vs { --t-bg: #fff; --t-text: #333; /* light override */ }
```

**src/main.ts** — import CSS before mounting:
```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './main.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

## Phase 2 — Monaco Editor Shell

### Configure Workers

Monaco ships language workers as Web Workers. Since this editor is markdown-only, you only need the editor worker:

```ts
// src/components/MonacoEditor.vue
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

self.MonacoEnvironment = {
  getWorker() { return new editorWorker() }
}
```

No `tsWorker`, `jsonWorker`, `cssWorker` etc. are needed — markdown doesn't use them.

### Create the Editor

```ts
const editor = monaco.editor.create(editorContainer.value, {
  value: props.value || '',
  language: 'markdown',
  theme: 'vs-dark',
  fontSize: 14,
  automaticLayout: true,
  scrollbar: { vertical: 'hidden', horizontal: 'hidden' }, // hide scrollbar track
  scrollBeyondLastColumn: false,
})
```

### Wire v-model

The component exposes `value` prop (ingress) and `change` emit (egress):

```ts
const props = defineProps<{ value?: string }>()
const emit = defineEmits<{ change: [value: string] }>()

editor.onDidChangeModelContent(() => {
  emit('change', editor?.getValue() || '')
})

watch(() => props.value, (newValue) => {
  if (editor && editor.getValue() !== newValue) editor.setValue(newValue || '')
})
```

## Phase 3 — Vim Mode

### Install and Init

```ts
import { initVimMode } from 'monaco-vim'

const statusBar = ref<HTMLElement | null>(null)
let vimAdapter = initVimMode(editor, statusBar.value)
```

`initVimMode` renders the mode indicator (`--NORMAL--`, `--INSERT--` etc.) into `statusBar.value`. This element must be hidden with CSS because you'll render your own status bar in the parent component:

```css
/* MonacoEditor.vue scoped style */
.vim-mount,
.vim-mount * { display: none !important; }
```

### Emit Status to Parent

Don't render the status bar inside MonacoEditor. Emit it so the parent can span it across both editor and preview panes:

```ts
const emit = defineEmits<{
  change: [value: string]
  'vim-status': [status: { mode: string; line: number; col: number; chars: number }]
}>()
```

Hook into `editor.onDidChangeCursorPosition` and the Vim adapter's `vim-mode-change` event to emit continuously.

## Phase 4 — TextMate Grammars for Code Block Highlighting

The built-in Monarch tokenizer renders all code blocks as a single `comment` token. To get real syntax highlighting inside ` ```javascript` fences, you need TextMate grammars.

### Install Dependencies

```bash
npm install monaco-editor-textmate monaco-textmate onigasm
```

`monaco-textmate` uses `onigasm` (a Wasm-based Oniguruma regex engine) as its backend. It's a peer dep — install both.

### Download Grammar Files

Create `public/grammars/` and populate it with `.tmLanguage.json` files from VSCode's source. The key files:

| File | Source |
|------|--------|
| `TypeScript.tmLanguage.json` | `vscode/extensions/typescript-basics/syntaxes/` |
| `JavaScript.tmLanguage.json` | `vscode/extensions/javascript/syntaxes/` |
| `markdown.tmLanguage.json` | `vscode/extensions/markdown-basics/syntaxes/` |

The VSCode Markdown grammar (`text.html.markdown`) has built-in `fenced_code_block_*` patterns for ~50 languages. Each pattern `include`s the corresponding source grammar (e.g., `source.ts` for TypeScript). This is what enables code block highlighting.

For languages without `.tmLanguage.json` (like Python, which VSCode publishes as plist), download from TextMate bundles instead, and set `format: 'plist'` in the grammar definition.

### Copy Oniguruma Wasm

```bash
cp node_modules/onigasm/lib/onigasm.wasm public/onigasm.wasm
```

### Initialize TextMate

```ts
// src/utils/textmate.ts
import { loadWASM } from 'onigasm'
import { Registry, INITIAL } from 'monaco-textmate'
import * as monaco from 'monaco-editor'

export async function initTextMate() {
  // 1. Load Wasm
  const buf = await fetch('./onigasm.wasm').then(r => r.arrayBuffer())
  await loadWASM(buf)

  // 2. Create registry with grammar resolver
  const registry = new Registry({
    getGrammarDefinition: async (scopeName: string) => {
      const url = './grammars/' + SCOPE_TO_FILE[scopeName]
      const res = await fetch(url)
      if (url.endsWith('.tmLanguage') && !url.endsWith('.json')) {
        return { format: 'plist', content: await res.text() }
      }
      return { format: 'json', content: await res.json() }
    },
  })

  // 3. Replace Monaco token providers with TextMate
  for (const [langId, scopeName] of LANGUAGE_SCOPES) {
    const grammar = await registry.loadGrammar(scopeName)
    monaco.languages.setTokensProvider(langId, {
      getInitialState: () => INITIAL,
      tokenize: (line: string, state: any) => {
        const result = grammar.tokenizeLine(line, state)
        return {
          endState: result.ruleStack,
          tokens: result.tokens.map(t => ({
            startIndex: t.startIndex,
            scopes: t.scopes[t.scopes.length - 1],
          })),
        }
      },
    })
  }
}
```

**Call this in parallel** with editor creation (don't await — let Monarch handle the first frames, then TextMate takes over):

```ts
onMounted(() => {
  initTextMate()  // async, non-blocking
  initEditor()    // sync
})
```

## Phase 5 — Markdown Preview

```bash
npm install marked
```

Create `MarkdownPreview.vue`:

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { marked } from 'marked'
const props = defineProps<{ content: string }>()
const html = ref('')
watch(() => props.content, async (v) => {
  html.value = await marked.parse(v, { breaks: true, gfm: true })
}, { immediate: true })
</script>
<template>
  <div class="preview-body" v-html="html"></div>
</template>
```

Style the rendered HTML with `:deep()` selectors using theme CSS variables (`var(--color-text)`, `var(--color-bg)`, etc.) so the preview respects theme changes.

## Phase 6 — Split-Screen Layout (Vim Style)

In `App.vue`, the main content area should be a row flex container:

```html
<main class="flex flex-col flex-1 overflow-hidden">
  <div class="flex flex-1 overflow-hidden">
    <section class="flex-1 min-w-0 flex flex-col">     <!-- Editor pane -->
      <MonacoEditor .../>
    </section>
    <div v-if="showPreview" class="w-px bg-border"></div>  <!-- 1px divider -->
    <section v-if="showPreview" class="flex-1 min-w-0 flex flex-col">  <!-- Preview pane -->
      <MarkdownPreview .../>
    </section>
  </div>
  <!-- Status bar spans full width below both panes -->
  <div v-if="settingsStore.vimMode" class="flex items-center h-[22px] bg-accent">
    ...
  </div>
</main>
```

Key layout rules:
- Both panes use `flex: 1` — they split 50/50 when preview is open
- Divider is 1px (like Vim's `│` vertical separator), NOT a thick bar
- Status bar is OUTSIDE the pane container, so it spans across both
- Pane headers (`bg-bg-alt + border-b`) give each pane a Vim-like window name

## Phase 7 — Settings Store

Use Pinia with the setup-store pattern for persistent settings:

```ts
export const useSettingsStore = defineStore('settings', () => {
  const editorSettings = ref<EditorSettings>(
    loadFromStorage('myapp-editor-settings', defaultSettings)
  )
  const vimMode = ref(loadFromStorage('myapp-vim-mode', true))

  const updateEditorSetting = <K extends keyof EditorSettings>(key: K, v: EditorSettings[K]) => {
    editorSettings.value[key] = v
    save()
  }
  const toggleVimMode = () => { vimMode.value = !vimMode.value; save() }

  return { editorSettings, vimMode, updateEditorSetting, toggleVimMode }
})
```

Persist to `localStorage` with a unique key prefix to avoid collisions.

## Phase 8 — Theme Synchronization

The Monaco theme and the app's CSS theme must stay in sync. Use CSS variables for runtime theming:

```ts
// App.vue
const applyTheme = (theme: string) => {
  document.documentElement.className = `theme-${theme}`
  // MonacoEditor watches the store and calls editor.updateOptions({ theme })
}
watch(() => settingsStore.editorSettings.theme, applyTheme)
```

Define three themes in `main.css`:
- `:root` (dark) — default, no class needed
- `html.theme-vs` — light theme
- `html.theme-hc-black` — high contrast

Each overrides `--t-*` variables that feed into `@theme` — Tailwind utility classes like `bg-bg` cascade through `var(--color-bg) → var(--t-bg) → actual color`.

## Key Patterns & Gotchas

| Pattern | Detail |
|---------|--------|
| Monaco workers | Only need `editorWorker` for markdown. No TS/JSON/HTML workers |
| TextMate init | Start in `onMounted` without `await`. Editor uses Monarch as fallback until TextMate takes over |
| Vim status bar | MonacoEditor emits it, App.vue renders it. Hide monaco-vim's native element with `display: none !important` |
| `@apply` | NOT supported in Vue scoped `<style>` with Tailwind v4. Use inline utility classes or direct CSS with `var(--color-*)` |
| Grammar files | Vite serves `public/` as-is. Fetch URLs in TextMate setup are `./grammars/...` and `./onigasm.wasm` |
| CSS variables in `@theme` | `--color-bg: var(--t-bg)` makes Tailwind utilities respond to runtime `<html>` class changes |
| `v-model` with Monaco | MonacoEditor uses `value` prop and `change` emit. Parent must use `:value` + `@change` (Vue 3 default `v-model` maps to `modelValue` / `update:modelValue`) |
