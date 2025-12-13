import { createElement } from './utils';

type ResolvedVisualizeOptions = Required<VisualizeOptions>;
type CharMapEntry = { show: boolean; type: string; warp?: boolean };
type CharMap = { [key: string]: CharMapEntry };

const DEFAULT_OPTIONS: ResolvedVisualizeOptions = {
  showSpace: true,
  showTab: true,
  showNewline: true,
  showCarriageReturn: true,
};

const resolveOptions = (
  opts: VisualizeOptions = {}
): ResolvedVisualizeOptions => ({
  ...DEFAULT_OPTIONS,
  ...opts,
});

const charMapCache = new Map<string, CharMap>();

const getCharMapCacheKey = (opts: ResolvedVisualizeOptions): string =>
  `${Number(opts.showSpace)}-${Number(opts.showTab)}-${Number(
    opts.showNewline
  )}-${Number(opts.showCarriageReturn)}`;

const createCharMap = (opts: ResolvedVisualizeOptions): CharMap => ({
  ' ': { show: opts.showSpace, type: 'space' },
  '\t': { show: opts.showTab, type: 'tab' },
  '\n': { show: opts.showNewline, type: 'newline', warp: true },
  '\r': { show: opts.showCarriageReturn, type: 'carriage-return', warp: true },
});

const getCharMap = (opts: ResolvedVisualizeOptions): CharMap => {
  const cacheKey = getCharMapCacheKey(opts);
  const cached = charMapCache.get(cacheKey);
  if (cached) return cached;

  const nextMap = createCharMap(opts);
  charMapCache.set(cacheKey, nextMap);
  return nextMap;
};

const updateDisplay = (
  text: string,
  lastText: string,
  element: HTMLElement,
  opts: VisualizeOptions = {}
) => {
  if (text === lastText) return text;

  const mergedOpts = resolveOptions(opts);

  if (!text) {
    element.replaceChildren();
    return text;
  }

  if (text.startsWith(lastText)) {
    const newText = text.slice(lastText.length);
    if (newText) {
      element.appendChild(createVisualizedNodes(newText, mergedOpts));
    }
    return text;
  }

  element.replaceChildren(createVisualizedNodes(text, mergedOpts));

  return text;
};

export const createVisualizedNodes = (
  text: string,
  opts: VisualizeOptions = {}
): DocumentFragment => {
  const fragment = document.createDocumentFragment();
  const mergedOpts = resolveOptions(opts);
  const charMap = getCharMap(mergedOpts);

  let normalTextBuffer = '';

  const flushNormalText = () => {
    if (normalTextBuffer) {
      fragment.appendChild(document.createTextNode(normalTextBuffer));
      normalTextBuffer = '';
    }
  };

  for (let i = 0, len = text.length; i < len; i++) {
    const char = text[i];
    const mapping = charMap[char];

    if (mapping && mapping.show) {
      flushNormalText();
      const el = createElement(
        'span',
        'mk-text-visible-char',
        `mk-text-visible-char-${mapping.type}`
      );

      if (mapping.warp) {
        const warpEl = createElement(
          'span',
          'mk-text-visible-warp',
          `mk-text-visible-warp-${mapping.type}`
        );
        warpEl.appendChild(el);
        warpEl.appendChild(document.createTextNode(char));
        fragment.appendChild(warpEl);
      } else {
        el.textContent = char;
        fragment.appendChild(el);
      }
    } else {
      normalTextBuffer += char;
    }
  }

  flushNormalText();

  return fragment;
};

export const createVisibleInput = (
  container: HTMLElement,
  options: VisualizeOptions = {}
): {
  wrapperEl: HTMLElement;
  textareaEl: HTMLTextAreaElement;
  visualizeEl: HTMLElement;
  update: (text?: string) => void;
} => {
  const wrapperEl = createElement('div', 'mk-text-visible-input-wrapper');
  const textareaEl = createElement('textarea', 'mk-text-visible-input');
  const visualizeEl = createElement('pre', 'mk-text-visible-input-visualize');

  wrapperEl.appendChild(visualizeEl);
  wrapperEl.appendChild(textareaEl);
  container.appendChild(wrapperEl);

  let lastValue = '';
  const mergedOpts = resolveOptions(options);

  const update = (text?: string) => {
    if (typeof text === 'string') {
      textareaEl.value = text;
    }

    lastValue = updateDisplay(
      textareaEl.value,
      lastValue,
      visualizeEl,
      mergedOpts
    );

    textareaEl.dispatchEvent(new Event('mk:update'));
  };

  const handleScroll = () => {
    visualizeEl.scrollTop = textareaEl.scrollTop;
    visualizeEl.scrollLeft = textareaEl.scrollLeft;
  };

  textareaEl.addEventListener('input', () => update());
  textareaEl.addEventListener('scroll', handleScroll);

  update();

  return { wrapperEl, textareaEl, visualizeEl, update };
};

export const createVisibleDisplay = (
  container: HTMLElement,
  options: VisualizeOptions = {}
): {
  displayEl: HTMLPreElement;
  update: (text: string) => void;
} => {
  const displayEl = createElement('pre', 'mk-text-visible-display');

  container.appendChild(displayEl);

  let lastText = '';
  const mergedOpts = resolveOptions(options);

  return {
    displayEl,
    update: (text: string) => {
      lastText = updateDisplay(text, lastText, displayEl, mergedOpts);
    },
  };
};

export const linkInputToDisplay = (
  input: HTMLTextAreaElement,
  display: HTMLPreElement,
  options: VisualizeOptions = {}
): (() => void) => {
  const opts = resolveOptions(options);
  let lastValue = '';

  const update = () => {
    lastValue = updateDisplay(input.value, lastValue, display, opts);
  };

  input.addEventListener('input', update);
  input.addEventListener('change', update);
  // Custom event for external triggers
  input.addEventListener('mk:update', update);

  update();

  return () => {
    input.removeEventListener('input', update);
    input.removeEventListener('change', update);
    input.removeEventListener('mk:update', update);
  };
};

export const setCustomSymbols = (
  container: HTMLElement,
  symbols: Partial<CustomSymbols> & { color?: string }
): void => {
  const { style } = container;
  if (symbols.space) {
    style.setProperty('--mk-space-symbol', `'${symbols.space}'`);
  }
  if (symbols.tab) style.setProperty('--mk-tab-symbol', `'${symbols.tab}'`);
  if (symbols.newline) {
    style.setProperty('--mk-newline-symbol', `'${symbols.newline}'`);
  }
  if (symbols.carriageReturn) {
    style.setProperty(
      '--mk-carriage-return-symbol',
      `'${symbols.carriageReturn}'`
    );
  }
  if (symbols.color) style.setProperty('--mk-symbol-color', symbols.color);
};

export const SYMBOL_THEMES = {
  default: { space: '·', tab: '→', newline: '␊', carriageReturn: '␍' },
  dots: { space: '•', tab: '»', newline: '¶', carriageReturn: '↩' },
  arrows: { space: '·', tab: '⇥', newline: '⏎', carriageReturn: '⏸' },
  minimal: { space: '∙', tab: '⊢', newline: '↵', carriageReturn: '←' },
  classic: { space: '○', tab: '⇨', newline: '⤵', carriageReturn: '↪' },
} as const;

export const applySymbolTheme = (
  container: HTMLElement,
  theme: keyof typeof SYMBOL_THEMES
): void => {
  if (SYMBOL_THEMES[theme]) {
    setCustomSymbols(container, SYMBOL_THEMES[theme]);
  }
};

export interface CustomSymbols {
  space?: string;
  tab?: string;
  newline?: string;
  carriageReturn?: string;
}

export interface VisualizeOptions {
  showSpace?: boolean;
  showTab?: boolean;
  showNewline?: boolean;
  showCarriageReturn?: boolean;
}
