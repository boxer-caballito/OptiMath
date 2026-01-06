import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathProps {
  tex: string;
  display?: boolean;
}

export default function Math({ tex, display = false }: MathProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(tex, containerRef.current, {
        displayMode: display,
        throwOnError: false,
        strict: false,
      });
    }
  }, [tex, display]);

  return <span ref={containerRef} className={display ? 'math-display' : 'math-inline'} />;
}
