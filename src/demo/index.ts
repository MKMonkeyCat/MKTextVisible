import './style.css';

import {
  createVisibleInput,
  createVisibleDisplay,
  linkInputToDisplay,
  applySymbolTheme,
  SYMBOL_THEMES,
} from '../textVisualizer';

const select = document.getElementById('themeSelect') as HTMLSelectElement;

Object.keys(SYMBOL_THEMES).forEach((theme) => {
  const option = document.createElement('option');

  option.value = theme;
  option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
  select.appendChild(option);
});

const container = document.getElementById('container')!;

const { wrapperEl, textareaEl, update } = createVisibleInput(container);
const { displayEl } = createVisibleDisplay(container);

linkInputToDisplay(textareaEl, displayEl);

// 設定初始文字
update(`# MK Text Visible (mk-text-visible)

一個輕量級的、基於 Vite + TypeScript + Vanilla 的不可見字元可視化 library。

> [!WARNING]  
> 由於該 Library 極其簡單，無過多優化，建議不要用於大量文本修改及顯示的場景
> 若向本 Demo 類似的場景，若不可見字元過多時，會導致卡頓(生成時)，建議用於不常修改的文本顯示

## 功能

- 可視化空格、Tab、換行符號等不可見字元
- 支援多種符號主題

空格 
Tab\t
`);

// 切換範例
select.addEventListener('change', (e) => {
  const theme = (e.target as HTMLSelectElement)
    .value as keyof typeof SYMBOL_THEMES;

  applySymbolTheme(wrapperEl, theme);
  applySymbolTheme(displayEl, theme);
});
