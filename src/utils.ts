export const parseClass = (
  ...classNames: (string | string[] | undefined)[]
): string[] => {
  return classNames.flatMap((className) => {
    if (typeof className === 'string') {
      return className.trim().split(/\s+/).filter(Boolean);
    }
    return className || [];
  });
};

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  ...className: (string | string[])[]
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tagName);
  element.classList.add(...parseClass(...className));
  return element;
};
