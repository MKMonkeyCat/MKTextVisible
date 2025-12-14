import './lib.css';

export const VERSION = import.meta.env.VITE_LIB_VERSION || 'dev';

export {
  createVisualizedNodes,
  createVisibleInput,
  createVisibleDisplay,
  linkInputToDisplay,
  setCustomSymbols,
  applySymbolTheme,
  SYMBOL_THEMES,
} from './textVisualizer';

export type { VisualizeOptions, CustomSymbols } from './textVisualizer';
