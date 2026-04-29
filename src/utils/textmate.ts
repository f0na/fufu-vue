import { loadWASM } from 'onigasm';
import { Registry, INITIAL } from 'monaco-textmate';
import * as monaco from 'monaco-editor';

type GrammarMap = Record<string, string>;

const LANGUAGE_SCOPES: GrammarMap = {
  javascript: 'source.js',
  typescript: 'source.ts',
  python: 'source.python',
  rust: 'source.rust',
  go: 'source.go',
  java: 'source.java',
  html: 'text.html.derivative',
  css: 'source.css',
  json: 'source.json',
  shell: 'source.shell',
  sql: 'source.sql',
  cpp: 'source.cpp',
  csharp: 'source.cs',
  markdown: 'text.html.markdown',
};

const SCOPE_URLS: Record<string, string> = {
  'source.js': './grammars/JavaScript.tmLanguage.json',
  'source.ts': './grammars/TypeScript.tmLanguage.json',
  'source.python': './grammars/python.tmLanguage',
  'source.rust': './grammars/rust.tmLanguage.json',
  'source.go': './grammars/go.tmLanguage.json',
  'source.java': './grammars/java.tmLanguage.json',
  'text.html.derivative': './grammars/html-derivative.tmLanguage.json',
  'source.css': './grammars/css.tmLanguage.json',
  'source.json': './grammars/JSON.tmLanguage.json',
  'source.shell': './grammars/shell-unix-bash.tmLanguage.json',
  'source.sql': './grammars/sql.tmLanguage.json',
  'source.cpp': './grammars/cpp.tmLanguage.json',
  'source.cs': './grammars/csharp.tmLanguage.json',
  'text.html.markdown': './grammars/markdown.tmLanguage.json',
};

let initialized = false;

export async function init_text_mate() {
  if (initialized) return;
  initialized = true;

  const wasm_response = await fetch('./onigasm.wasm');
  const wasm_buffer = await wasm_response.arrayBuffer();
  await loadWASM(wasm_buffer);

  const registry = new Registry({
    getGrammarDefinition: async (scopeName: string) => {
      const url = SCOPE_URLS[scopeName];
      if (!url) {
        throw new Error(`No grammar file for scope: ${scopeName}`);
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load grammar: ${url} (${response.status})`);
      }
      const is_plist = url.endsWith('.tmLanguage') && !url.endsWith('.json');
      if (is_plist) {
        return { format: 'plist' as const, content: await response.text() };
      }
      return { format: 'json' as const, content: await response.json() };
    },
  });

  const promises = Object.entries(LANGUAGE_SCOPES).map(async ([lang_id, scope_name]) => {
    try {
      const grammar = await registry.loadGrammar(scope_name);
      monaco.languages.setTokensProvider(lang_id, {
        getInitialState: () => INITIAL,
        tokenize: (line: string, state: monaco.languages.IState) => {
          const result = grammar.tokenizeLine(line, state);
          return {
            endState: result.ruleStack,
            tokens: result.tokens.map((token) => ({
              startIndex: token.startIndex,
              scopes: token.scopes[token.scopes.length - 1],
            })),
          };
        },
      });
    } catch (err) {
      console.warn(`[textmate] Failed to load grammar "${scope_name}" for "${lang_id}":`, err);
    }
  });

  await Promise.allSettled(promises);
}
