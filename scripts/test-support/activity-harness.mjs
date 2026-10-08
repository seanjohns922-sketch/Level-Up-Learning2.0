// Executes the production component's event handlers with controlled hook state.
// This is a shallow interaction test, not a browser/layout or React lifecycle test.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const root = process.cwd();
const compiled = new Map();
const jsx = (type, props) => ({ type, props: props ?? {} });
export function activityHarness(file, props, exportName = 'default') {
  const slots = []; const timers = []; let cursor = 0;
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(value) { const index = cursor++; return slots[index] ??= { current: value }; },
    useMemo(fn) { return fn(); }, useCallback(fn) { return fn; }, useEffect() {},
    createElement: (type, props, ...children) => jsx(type, { ...props, children }),
    Fragment: 'fragment',
  };
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} }; cache.set(filename, module);
    let code = compiled.get(filename);
    if (!code) {
      code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
        module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
      }, fileName: filename }).outputText;
      compiled.set(filename, code);
    }
    function localRequire(specifier) {
      if (specifier === 'react') return hooks;
      if (specifier === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
      if (specifier.startsWith('@/components/') || specifier === 'lucide-react') {
        return new Proxy({ __esModule: true }, { get: (object, key) => key === '__esModule' ? true : (object[key] ??= props => jsx(String(key), props)) });
      }
      if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return require(specifier);
      const base = specifier.startsWith('@/') ? path.join(root, specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
      const target = ['', '.ts', '.tsx', '.js', '/index.ts'].map(ext => base + ext).find(p => fs.existsSync(p) && fs.statSync(p).isFile());
      if (!target) throw new Error(`Cannot resolve ${specifier} from ${filename}`);
      if (target.endsWith('.json')) return JSON.parse(fs.readFileSync(target, 'utf8'));
      return load(target);
    }
    vm.runInThisContext(`(function(require,module,exports,setTimeout,clearTimeout){${code}\n})`, { filename })(localRequire, module, module.exports, callback => { timers.push(callback); return timers.length; }, () => {});
    return module.exports;
  }
  const Component = load(path.resolve(file))[exportName];
  function render() {
    cursor = 0;
    let tree = Component(props);
    // Follow same-file wrappers such as PlaceValueBuilderInner, leaving visual children shallow.
    while (typeof tree?.type === 'function') tree = tree.type(tree.props);
    return tree;
  }
  function nodes(type) {
    const found = [];
    function walk(node) {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== 'object') return;
      if (typeof node.type === 'function') return walk(node.type(node.props));
      if (node.type === type) found.push(node);
      walk(node.props?.children);
    }
    walk(render()); return found;
  }
  function text(node) {
    if (Array.isArray(node)) return node.map(text).join('');
    if (node == null || typeof node === 'boolean') return '';
    return typeof node === 'object' ? text(node.props?.children) : String(node);
  }
  return {
    render, nodes, text, flushTimers() { while (timers.length) timers.shift()(); },
    input(index, value) { const node = nodes('input')[index]; if (!node) throw new Error(`Missing input ${index}`); node.props.onChange({ target: { value: String(value) } }); },
    click(label) { const button = nodes('button').find(node => text(node).trim() === label); if (!button) throw new Error(`Missing button ${label}: ${nodes('button').map(text)}`); if (!button.props.disabled) button.props.onClick(); },
  };
}
