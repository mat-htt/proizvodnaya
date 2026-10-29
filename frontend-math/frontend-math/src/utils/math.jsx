import React, { useEffect, useRef } from 'react';

const DELIMITERS = [
  { left: '$$', right: '$$', display: true },
  { left: '\\[', right: '\\]', display: true },
  { left: '$', right: '$', display: false },
  { left: '\\(', right: '\\)', display: false },
];

// Рендерит формулы KaTeX внутри элемента (KaTeX подключён в public/index.html)
export const renderMath = (element) => {
  if (element && window.renderMathInElement) {
    window.renderMathInElement(element, {
      delimiters: DELIMITERS,
      throwOnError: false,
      strict: 'ignore',
    });
  }
};

// Текст с формулами. React не управляет содержимым элемента,
// поэтому KaTeX может свободно заменять узлы внутри.
export const MathText = ({ text, as: Tag = 'span', className }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = text || '';
    renderMath(ref.current);
  }, [text]);
  return <Tag ref={ref} className={className} />;
};
