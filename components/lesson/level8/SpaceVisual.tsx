"use client";
import {
  Polygon,
  Space,
  polygonSpeech,
} from "@/components/starpath/Level8StarpathAssessmentCard";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { QuestionDraft } from "@/data/activities/level8/shared";
export default function SpaceVisual({
  visual,
}: {
  visual: NonNullable<QuestionDraft["spaceVisual"]>;
}) {
  return (
    <div className="rounded-xl border border-violet-300 bg-white p-4 text-slate-900">
      {visual.polygons && (
        <>
          <div className="mx-auto grid max-w-xs grid-cols-1 gap-3 sm:max-w-none sm:grid-cols-2">
            {visual.polygons.map((p, i) => (
              <Polygon key={i} p={p} />
            ))}
          </div>
          <ReadAloudBtn
            text={visual.polygons.map(polygonSpeech).join(". ")}
            label="Read diagram"
          />
        </>
      )}
      {visual.space && <Space spec={visual.space} placed={null} />}
    </div>
  );
}
