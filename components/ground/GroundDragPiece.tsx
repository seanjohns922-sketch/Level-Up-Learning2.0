'use client';

import { useRef, useState, type ReactNode } from 'react';
import { groundBlip } from './GroundCheer';

/**
 * A piece a child can drag with a finger. A plain tap does the same job, so no child gets stuck
 * because dragging is still hard for them. Drop targets are any element with data-ground-drop.
 */
export default function GroundDragPiece({ onPlace, label, children, disabled = false, className = '' }: {
  onPlace: (target: string | null) => void;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  function finish(x: number, y: number) {
    const wasDrag = moved.current;
    start.current = null;
    moved.current = false;
    setOffset(null);
    groundBlip(620);
    if (!wasDrag) return onPlace(null);
    const hit = document.elementsFromPoint(x, y).map(el => el.closest<HTMLElement>('[data-ground-drop]')).find(Boolean);
    if (hit) onPlace(hit.dataset.groundDrop ?? '');
  }

  return <button
    type="button"
    aria-label={label}
    disabled={disabled}
    data-ground-piece
    className={`touch-none select-none ${offset ? 'relative z-50 scale-110 cursor-grabbing' : 'cursor-grab'} ${className}`}
    style={offset ? { transform: `translate(${offset.x}px,${offset.y}px) scale(1.15)` } : undefined}
    onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); start.current = { x: event.clientX, y: event.clientY, id: event.pointerId }; moved.current = false; groundBlip(440); }}
    onPointerMove={event => {
      const from = start.current;
      if (!from) return;
      const x = event.clientX - from.x, y = event.clientY - from.y;
      if (Math.hypot(x, y) > 8) moved.current = true;
      if (moved.current) setOffset({ x, y });
    }}
    onPointerUp={event => { if (start.current) finish(event.clientX, event.clientY); }}
    onPointerCancel={() => { start.current = null; moved.current = false; setOffset(null); }}
    onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onPlace(null); } }}
  >{children}</button>;
}
