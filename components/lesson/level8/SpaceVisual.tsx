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
  const polys=visual.polygons??[],many=polys.length>4,fit=polys.length?Math.min(...polys.map(p=>Math.min((polys.length===2?190:205)/(Math.max(...p.points.map(v=>v.x))-Math.min(...p.points.map(v=>v.x))||1),(polys.length===2?140:150)/(Math.max(...p.points.map(v=>v.y))-Math.min(...p.points.map(v=>v.y))||1)))):undefined;
  const maxR=Math.max(1,...(visual.circles??[]).map(c=>c.radius));
  return (
    <div className="rounded-2xl p-3 text-slate-900 sm:p-4" style={{background:"#f6f3fb"}}>
      {visual.circles && <><svg viewBox="0 0 560 280" className="mx-auto w-full max-w-xl" role="img" aria-label="Two circles at the same scale"><defs><linearGradient id="s8c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9a6cf0"/><stop offset="1" stopColor="#5a2fc2"/></linearGradient></defs>
        {visual.circles.map((c,i)=><g key={c.label}><circle cx={150+i*260} cy={118} r={c.radius/maxR*104} fill="url(#s8c)" stroke="#3c2a63" strokeWidth={3}/><text x={150+i*260} y={262} textAnchor="middle" fontSize={24} fontWeight={700} fill="#3c2a63">{c.label}</text></g>)}
      </svg><ReadAloudBtn text={visual.circles.map(c=>c.label).join('. ')+'. Two circles of different sizes, drawn at the same scale.'} label="Read diagram"/></>}
      {visual.coordinate && <CoordinateDiagram scene={visual.coordinate}/>}
      {polys.length>0 && (
        <>
          <div className={`mx-auto grid gap-2 ${many?"grid-cols-3":polys.length>1?"grid-cols-2":"max-w-md grid-cols-1"}`}>
            {polys.map((p, i) => (
              <Polygon key={i} p={p} scale={fit} compact={many} big={polys.length>=2&&!many} />
            ))}
          </div>
          <ReadAloudBtn
            text={polys.map(polygonSpeech).join(". ")}
            label="Read diagram"
          />
        </>
      )}
      {visual.space && <Space spec={visual.space} placed={null} />}
    </div>
  );
}
