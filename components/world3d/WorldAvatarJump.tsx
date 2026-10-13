"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { advanceWorldJump, createWorldJump, resetWorldJump, startWorldJump } from "@/lib/world3d/avatar-jump";

/** Animate only the avatar: the parent, camera, terrain and progression stay grounded. */
export default function WorldAvatarJump({ children, request = 0, enabled = true, resetKey = 0 }: {
  children: ReactNode;
  request?: number;
  enabled?: boolean;
  resetKey?: number;
}) {
  const group = useRef<Group>(null);
  const motion = useRef(createWorldJump());
  const previousRequest = useRef(request);

  useEffect(() => {
    const reset = () => {
      resetWorldJump(motion.current);
      if (group.current) group.current.position.y = 0;
    };
    reset();
    const down = (event: KeyboardEvent) => {
      if (!enabled || event.code !== "Space" || event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement && event.target.closest('button,a,input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="dialog"],[role="button"],[role="textbox"]')) return;
      if (document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')) return;
      event.preventDefault();
      if (!event.repeat) startWorldJump(motion.current);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [enabled, resetKey]);

  useEffect(() => {
    if (request !== previousRequest.current && enabled) startWorldJump(motion.current);
    previousRequest.current = request;
  }, [request, enabled]);

  useFrame((_, delta) => {
    if (group.current) group.current.position.y = enabled ? advanceWorldJump(motion.current, delta) : 0;
  });

  return <group ref={group}>{children}</group>;
}
