"use client";

import ReadAloudBtn from "@/components/ReadAloudBtn";

export default function OptionReadAloudButton({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <ReadAloudBtn text={text} />
    </span>
  );
}
