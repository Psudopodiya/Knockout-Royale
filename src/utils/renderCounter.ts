import { useEffect, useRef } from "react";

export function useRenderCounter() {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`Component rendered ${renderCount.current} times`);
  });

  return renderCount.current;
}
