'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';

/** Read only the currently visible teaching content, including labelled artwork.
 * Legacy teaching cards keep their own diagram and individual read controls.
 * Closed examples, hidden answers and button labels are deliberately excluded.
 */
export function visibleGuideText(root: HTMLElement): string {
  function read(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (!(node instanceof Element)) return '';
    if (node.matches('button,script,style,[hidden],[aria-hidden="true"],.sr-only')) return '';
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return '';
    if (node.matches('svg,img,[role="img"]')) return node.getAttribute('aria-label') ?? node.getAttribute('alt') ?? node.textContent ?? '';
    if (node.matches('details:not([open])')) return node.querySelector('summary')?.textContent ?? '';
    return Array.from(node.childNodes).map(read).join(' ');
  }
  return read(root).replace(/\s+/g, ' ').trim();
}

export default function NarratedLessonGuide({ children, title }: { children: ReactNode; title?: string }) {
  const content = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  useEffect(() => {
    const root = content.current;
    if (!root) return;
    const update = () => setText(visibleGuideText(root));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, []);
  return <section data-narrated-lesson-guide>
    <div className="mb-3 flex justify-end"><ReadAloudBtn text={`${title ?? ''}. ${text}`} label="Read whole guide" /></div>
    <div ref={content}>{children}</div>
  </section>;
}
