import { createElement } from './utils';

const DEFAULT_OPTIONS: VisualizeOptions = {
  showSpace: true,
  showTab: true,
  showNewline: true,
  showCarriageReturn: true,
};

const createCharMap = (opts: VisualizeOptions) => ({
  ' ': { show: opts.showSpace ?? true, type: 'space' },
  '\t': { show: opts.showTab ?? true, type: 'tab' },
  '\n': { show: opts.showNewline ?? true, type: 'newline' },
  '\r': { show: opts.showCarriageReturn ?? true, type: 'carriage-return' },
});

const updateDisplay = (
  text: string,
  lastText: string,
  element: HTMLElement,
  opts: VisualizeOptions = {}
) => {
  if (text === lastText) return text;

  const mergedOpts = { ...DEFAULT_OPTIONS, ...opts };

  if (!text) {
    element.innerHTML = '';
    return text;
  }

  if (text.startsWith(lastText)) {
    const newText = text.slice(lastText.length);
    if (newText) {
      element.appendChild(createVisualizedNodes(newText, mergedOpts));
    }
    return text;
  }

  element.innerHTML = '';
  if (text) {
    element.appendChild(createVisualizedNodes(text, mergedOpts));
  }

  return text;
};

export function createVisualizedNodes(
  text: string,
  opts: VisualizeOptions = {}
): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const mergedOpts = { ...DEFAULT_OPTIONS, ...opts };
  const charMap = createCharMap(mergedOpts);

  let normalTextBuffer = '';

  const flushNormalText = () => {
    if (normalTextBuffer) {
      fragment.appendChild(document.createTextNode(normalTextBuffer));
      normalTextBuffer = '';
    }
  };

  for (let i = 0, len = text.length; i < len; i++) {
    const char = text[i];
    const mapping = charMap[char as keyof typeof charMap];

    if (char in charMap && mapping.show) {
      flushNormalText();
      const el = createElement(
        'span',
        'mk-text-visible-char',
        `mk-text-visible-char-${mapping.type}`
      );
      el.textContent = char;
      fragment.appendChild(el);
    } else {
      normalTextBuffer += char;
    }
  }

  flushNormalText();

  return fragment;
}

export function createVisibleInput(
  container: HTMLElement,
  options: VisualizeOptions = {}
): {
  wrapperEl: HTMLElement;
  textareaEl: HTMLTextAreaElement;
  visualizeEl: HTMLElement;
  update: (text?: string) => void;
} {
  const wrapperEl = createElement('div', 'mk-text-visible-input-wrapper');
  const textareaEl = createElement('textarea', 'mk-text-visible-input');
  const visualizeEl = createElement('pre', 'mk-text-visible-input-visualize');

  wrapperEl.appendChild(visualizeEl);
  wrapperEl.appendChild(textareaEl);
  container.appendChild(wrapperEl);

  let lastValue = '';
  const mergedOpts = { ...DEFAULT_OPTIONS, ...options };

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
}

export function createVisibleDisplay(
  container: HTMLElement,
  options: VisualizeOptions = {}
): {
  displayEl: HTMLPreElement;
  update: (text: string) => void;
} {
  const displayEl = createElement('pre', 'mk-text-visible-display');

  container.appendChild(displayEl);

  let lastText = '';
  const mergedOpts = { ...DEFAULT_OPTIONS, ...options };

  return {
    displayEl,
    update: (text: string) => {
      lastText = updateDisplay(text, lastText, displayEl, mergedOpts);
    },
  };
}

export function linkInputToDisplay(
  input: HTMLTextAreaElement,
  display: HTMLPreElement,
  options: VisualizeOptions = {}
): () => void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
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
  };
}

export function setCustomSymbols(
  container: HTMLElement,
  symbols: Partial<CustomSymbols> & { color?: string }
): void {
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
}

export const SYMBOL_THEMES = {
  default: { space: '·', tab: '→', newline: '␊', carriageReturn: '␍' },
  dots: { space: '•', tab: '»', newline: '¶', carriageReturn: '↩' },
  arrows: { space: '·', tab: '⇥', newline: '⏎', carriageReturn: '⏸' },
  minimal: { space: '∙', tab: '⊢', newline: '↵', carriageReturn: '←' },
  classic: { space: '○', tab: '⇨', newline: '⤵', carriageReturn: '↪' },
} as const;

export function applySymbolTheme(
  container: HTMLElement,
  theme: keyof typeof SYMBOL_THEMES
): void {
  if (SYMBOL_THEMES[theme]) {
    setCustomSymbols(container, SYMBOL_THEMES[theme]);
  }
}

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
