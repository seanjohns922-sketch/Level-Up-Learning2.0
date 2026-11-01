"use client";
import {
  Polygon,
  Space,
  polygonSpeech,
} from "@/components/starpath/Level8StarpathAssessmentCard";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import CoordinateDiagram from './CoordinateDiagram';
import type { QuestionDraft } from "@/data/activities/level8/shared";
export default function SpaceVisual({
  visual,
}: {
  visual: NonNullable<QuestionDraft["spaceVisual"]>;
}) {
  const scale=visual.polygons?.length?Math.min(...visual.polygons.map(p=>Math.min(165/(Math.max(...p.points.map(v=>v.x))-Math.min(...p.points.map(v=>v.x))||1),120/(Math.max(...p.points.map(v=>v.y))-Math.min(...p.points.map(v=>v.y))||1)))):undefined;
  return (
    <div className="rounded-xl border border-violet-300 bg-white p-4 text-slate-900">
      {visual.circles && <><svg viewBox="0 0 360 180" className="mx-auto w-full max-w-md" role="img" aria-label="Two circles at the same scale">
        {visual.circles.map((c,i)=><g key={c.label}><circle cx={90+i*180} cy={80} r={c.radius*20} fill="#ede9fe" stroke="#7c3aed" strokeWidth={2}/><text x={90+i*180} y={165} textAnchor="middle" fontSize={14}>{c.label}</text></g>)}
      </svg><ReadAloudBtn text={visual.circles.map(c=>c.label).join('. ')+'. Two circles of different sizes, drawn at the same scale.'} label="Read diagram"/></>}
      {visual.coordinate && <CoordinateDiagram scene={visual.coordinate}/>}
      {visual.polygons && (
        <>
          <div className="mx-auto grid max-w-xs grid-cols-1 gap-3 sm:max-w-none sm:grid-cols-2">
            {visual.polygons.map((p, i) => (
              <Polygon key={i} p={p} scale={scale} />
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
