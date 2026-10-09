// Real React reconciliation/effects in a DOM. Artwork and speech controls may be
// stubbed; this does not test browser layout, touch geometry or audible speech.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
const require = createRequire(import.meta.url);
export function domHarness() {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost' });
  const previous = new Map();
  for (const [name, value] of Object.entries({ window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  const timers = new Map(); let timerId = 0;
  dom.window.setTimeout = fn => { timers.set(++timerId, fn); return timerId; };
  dom.window.clearTimeout = id => timers.delete(id);
  dom.window.setInterval = dom.window.setTimeout;
  dom.window.clearInterval = dom.window.clearTimeout;
  const root = createRoot(dom.window.document.getElementById('root'));
  const cache = new Map();
  const Speech = () => null;
  function load(file) {
    const filename = path.resolve(file);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} }; cache.set(filename, module);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    function localRequire(id) {
      if (/^@\/components\/(ReadAloudBtn|OptionReadAloudButton)$/.test(id)) return { __esModule: true, default: Speech };
      if (!id.startsWith('@/') && !id.startsWith('.')) return require(id);
      const base = id.startsWith('@/') ? path.resolve(id.slice(2)) : path.resolve(path.dirname(filename), id);
      const target = ['', '.ts', '.tsx', '.js', '/index.ts'].map(ext => base + ext).find(p => fs.existsSync(p) && fs.statSync(p).isFile());
      if (!target) throw Error(`Cannot resolve ${id}`);
      return load(target);
    }
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename })(localRequire, module, module.exports);
    return module.exports;
  }
  return {
    load, document: dom.window.document,
    async render(Component, props) { await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(Component, props)))); },
    async click(element) { if (!element) throw Error('Missing control'); await act(async () => element.click()); },
    async flushTimers() { await act(async () => { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()); }); },
    async close() { await act(async () => root.unmount()); dom.window.close(); for (const [name, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } },
  };
}
