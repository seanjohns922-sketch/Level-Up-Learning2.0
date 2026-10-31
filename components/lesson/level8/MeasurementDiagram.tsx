import type { ReactNode } from 'react';
import type { Measurement8Visual } from '@/data/assessments/revisions/year8MeasurementFiveForms';

// Controlled React SVG: labels come from the question's supplied quantities.
const ink = '#583714', stroke = '#8051a8', fill = '#e9daf3';
const text = (x: number, y: number, value: string) => <text x={x} y={y} textAnchor="middle" fill={ink} fontSize="16" fontWeight="700">{value}</text>;
const prism = (x: number, y: number, size = 1) => <g transform={'translate('+x+' '+y+') scale('+size+')'} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round"><path d="M0 40L60 0H200V120L140 160H0Z" fill={fill}/><path d="M0 40H140V160M140 40L200 0" fill="none"/><path d="M60 0V120H200M60 120L0 160" fill="none" strokeDasharray="5 5"/></g>;

export default function MeasurementDiagram({ visual: v }: { visual: Measurement8Visual }) {
  const n = v.values, labels = v.labels ?? [];
  let content: ReactNode;
  let height = 330;
  switch (v.variant) {
    case 'grid': {
      const [full, partial] = n, count = full + partial, cols = 12, size = 28;
      height = Math.max(190, Math.ceil(count / cols) * size + 80);
      content = <>{Array.from({ length: count }, (_, i) => {
        const x = 110 + i % cols * size, y = 28 + Math.floor(i / cols) * size;
        return <g key={i}><rect x={x} y={y} width={size} height={size} fill={i < full ? fill : 'white'} stroke={stroke}/>{i >= full && <path d={'M'+x+' '+y+'h'+size+'l-'+size+' '+size+'Z'} fill={fill} stroke={stroke}/>}</g>;
      })}{text(280, height - 25, full+' full squares; '+partial+' half-covered squares')}</>;
      break;
    }
    case 'gridCompare':
      content = <>{[0, 1].map(i => <g key={i} transform={'translate('+(70+i*250)+' 60)'}><path d="M10 130Q-10 20 80 20Q190 -5 160 110Q130 180 10 130" fill={fill} stroke={stroke}/>{Array.from({ length: i ? 61 : 7 }, (_, j) => <path key={j} d={'M'+j*(i?3:30)+' 0V180M0 '+j*(i?3:30)+'H180'} stroke={stroke} strokeWidth="0.6"/>)}{text(90, 220, labels[i])}</g>)}</>;
      break;
    case 'strips': {
      const max = Math.max(...n), w = 420 / n.length;
      content = <>{n.map((len, i) => <g key={i}><rect x={70 + i * w} y={260 - len / max * 180} width={w} height={len / max * 180} fill="#c5e2ed" stroke={stroke}/>{text(70 + (i + .5) * w, 285, String(i + 1))}{text(70 + (i + .5) * w, 245 - len / max * 180, String(len))}</g>)}{text(280, 35, 'Strip lengths (m)')}</>;
      break;
    }
    case 'boundary': {
      const points = [[100,100],[270,50],[440,100],[460,230],[290,280],[100,230]];
      content = <><polygon points={points.map(p=>p.join(',')).join(' ')} fill={fill} stroke={stroke} strokeWidth="3"/>{points.map(([x,y],i)=>{const [a,b]=points[(i+1)%6];return <g key={i}>{text((x+a)/2+(x+a>560?30:-20),(y+b)/2+(y+b>330?25:-15),labels[i])}</g>;})}</>;
      break;
    }
    case 'rectangle': case 'diagonal':
      content = <><rect x="120" y="65" width="320" height="190" fill={fill} stroke={stroke} strokeWidth="3"/>{text(280, 48, labels[0])}{text(490, 165, labels[1])}{v.variant === 'diagonal' && <><path d="M120 255L440 65" stroke={ink} strokeWidth="3" strokeDasharray="7 5"/>{text(290,180,'?')}</>}</>;
      break;
    case 'prism': case 'cube': content = <>{prism(155, 70, 1.2)}{text(235,290,v.variant==='cube'?'Side: ?':'Length')}{v.variant==='prism'&&<>{text(405,230,'Width')}{text(125,180,labels.some(label=>label.startsWith('Cross-section:'))?'End':'Height')}</>}</>; break;
    case 'triPrism': content = <g stroke={stroke} strokeWidth="3"><path d="M100 270L100 100L310 270Z" fill={fill}/><path d="M100 100L245 40L455 210L310 270Z" fill="#d6e8bd"/><path d="M100 270L245 210L455 210M245 210V40" fill="none" strokeDasharray="6 5"/><path d="M100 250H120V270" fill="none"/></g>; break;
    case 'twoPrisms': case 'packing':
      content = <>{prism(45,85,1.1)}{prism(350,130,.65)}{text(150,295,v.variant==='twoPrisms'?'Container A':'Container')}{text(420,295,v.variant==='twoPrisms'?'Container B':'One cube')}</>; break;
    case 'layers': content = <><path d="M100 45H460M100 270H460M110 45V270" stroke={stroke} strokeWidth="4"/><rect x="220" y="215" width="120" height="55" fill={fill} stroke={stroke}/><path d="M220 205V70M340 205V70" stroke={stroke} strokeWidth="2" strokeDasharray="6 5"/>{text(280,150,'More whole layers?')}</>; break;
    case 'capacity': content = <g stroke={stroke} strokeWidth="3"><path d="M90 80V250Q90 275 220 275Q350 275 350 250V80" fill="#c5e2ed"/><ellipse cx="220" cy="80" rx="130" ry="25" fill={fill}/>{labels.some(label=>label.startsWith("Bottle:"))&&<path d="M425 130V160L405 185V265Q435 280 465 265V185L445 160V130Z" fill="#c5e2ed"/>}</g>; break;
    case 'circleUnknown': content = <><circle cx="280" cy="160" r="115" fill={fill} stroke={stroke} strokeWidth="3"/><path d="M280 160H395" stroke={ink} strokeWidth="2"/><circle cx="280" cy="160" r="4" fill={ink}/>{text(335,185,'r = ?')}</>; break;
    case 'wheel': content = <><circle cx="280" cy="160" r="115" fill="none" stroke={ink} strokeWidth="9"/>{Array.from({length:12},(_,i)=><path key={i} d={'M280 160L'+(280+110*Math.cos(i*Math.PI/6))+' '+(160+110*Math.sin(i*Math.PI/6))} stroke={stroke} strokeWidth="2"/>)}<circle cx="280" cy="160" r="8" fill={ink}/></>; break;
    case 'squareCircle': content = <><rect x="165" y="45" width="230" height="230" fill={fill} stroke={stroke} strokeWidth="3"/><circle cx="280" cy="160" r={115*n[0]} fill="white" stroke={stroke} strokeWidth="3"/><path d={'M'+(280-115*n[0])+' 160H'+(280+115*n[0])} stroke={ink} strokeWidth="2"/><circle cx="280" cy="160" r="3" fill={ink}/></>; break;
    case 'twoCircles': {
      const max=Math.max(...n);
      content = <>{n.map((r,i)=><g key={i}><circle cx={150+260*i} cy="160" r={110*r/max} fill={fill} stroke={stroke} strokeWidth="3"/><path d={'M'+(150+260*i)+' 160h'+110*r/max} stroke={ink} strokeWidth="2"/>{text(150+260*i,300,i?'Second circle':'First circle')}</g>)}</>; break;
    }
    case 'quadrant': content = <><path d="M180 260V60A200 200 0 0 1 380 260Z" fill={fill} stroke={stroke} strokeWidth="3"/><path d="M180 240H200V260" fill="none" stroke={ink}/></>; break;
    case 'arch': {
      const inner=180*n[1]/n[0];
      content=<><path d={'M100 260A180 180 0 0 1 460 260H'+(280+inner)+'A'+inner+' '+inner+' 0 0 0 '+(280-inner)+' 260Z'} fill={fill} stroke={stroke} strokeWidth="3"/><path d="M280 260L460 260M280 260L280 80" stroke={ink} strokeDasharray="5 4"/></>;break;
    }
    case 'circleCompare': content=<><circle cx="100" cy="150" r="65" fill={fill} stroke={stroke}/><path d="M215 190A65 65 0 0 1 345 190Z" fill={fill} stroke={stroke}/><path d="M420 190V100A90 90 0 0 1 510 190Z" fill={fill} stroke={stroke}/>{text(100,260,'Circle')}{text(280,260,'Semicircle')}{text(465,260,'Quadrant')}</>;break;
    case 'track': content=<><path d="M180 60H380A100 100 0 0 1 380 260H180A100 100 0 0 1 180 60Z" fill="#d6e8bd" stroke={stroke} strokeWidth="7"/><path d="M180 60V260M380 60V260" stroke={ink} strokeDasharray="5 5"/>{text(280,45,'Straight')}{text(280,290,'Straight')}</>;break;
    case 'triangle': case 'squares': {
      const [a,b,c]=n, px=(a*a+b*b-c*c)/(2*a), py=Math.sqrt(Math.max(0,b*b-px*px));
      const points=[[0,0],[a,0],[px,-py]];
      const square=(p:number[],q:number[])=>{const dx=q[0]-p[0],dy=q[1]-p[1];return [p,q,[q[0]-dy,q[1]+dx],[p[0]-dy,p[1]+dx]];};
      const squares=[square(points[0],points[1]),square(points[2],points[0]),square(points[1],points[2])];
      const all=v.variant==='squares'?squares.flat():points, xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),loX=Math.min(...xs),loY=Math.min(...ys),scale=Math.min(390/(Math.max(...xs)-loX),220/(Math.max(...ys)-loY));
      const pos=(p:number[])=>[85+(p[0]-loX)*scale,45+(p[1]-loY)*scale];
      content=<>{v.variant==='squares'&&squares.map((sq,i)=><polygon key={i} points={sq.map(p=>pos(p).join(',')).join(' ')} fill={['#d6e8bd','#c5e2ed',fill][i]} stroke={stroke} strokeWidth="2"/>)}<polygon points={points.map(p=>pos(p).join(',')).join(' ')} fill="white" stroke={stroke} strokeWidth="3"/>{(v.variant==='squares'?squares.map(sq=>[sq.reduce((t,p)=>t+p[0],0)/4,sq.reduce((t,p)=>t+p[1],0)/4]):[[a/2,.1*py],[px/2-.15*a,-py/2],[(a+px)/2+.15*a,-py/2]]).map((p,i)=>{const [x,y]=pos(p);return <g key={i}>{text(x,y,String.fromCharCode(65+i))}</g>;})}</>;break;
    }
    case 'isoscelesHeight':content=<><path d="M100 270H460L280 50Z" fill={fill} stroke={stroke} strokeWidth="3"/><path d="M280 50V270" stroke={ink} strokeDasharray="6 5"/><path d="M280 250H300V270" stroke={ink} fill="none"/>{text(300,170,'?')}</>;break;
    case 'walk': case 'mast': case 'glass':content=<><path d="M130 260H410V70" fill="none" stroke={stroke} strokeWidth="5"/><path d="M130 260L410 70" stroke={ink} strokeWidth="3" strokeDasharray="7 4"/><path d="M390 260V240H410" fill="none" stroke={ink}/>{v.variant==='glass'&&<><path d="M130 70V260H410V70" fill="none" stroke="#76abc0" strokeWidth="5"/><path d="M130 260L470 29" stroke="#a33c41" strokeWidth="5"/></>}{v.variant==='walk'&&<>{text(280,290,'East →')}{text(460,160,'North ↑')}</>}</>;break;
    case 'scale':content=<><path d="M70 100H490M70 85V115M490 85V115M200 230H360M200 215V245M360 215V245" stroke={stroke} strokeWidth="4"/>{text(280,70,'Real distance')}{text(280,280,'Map or model distance')}</>;break;
    case 'ratio': {
      const total=n.reduce((a,b)=>a+b,0), w=420/total;
      content=<>{n.map((count,i)=>{const x=70+n.slice(0,i).reduce((sum,value)=>sum+value,0)*w;return <g key={i}>{Array.from({length:count},(_,j)=><rect key={j} x={x+j*w} y="100" width={w} height="90" fill={['#c5e2ed',fill,'#d6e8bd'][i]} stroke={stroke} strokeWidth="2"/>)}{text(x+count*w/2,220,String.fromCharCode(65+i))}</g>;})}{text(280,275,'Each block is one equal part')}</>;break;
    }
    default: throw new Error('Missing Measurement lesson diagram: '+v.variant);
  }
  const keyed=['triangle','squares','ratio'].includes(v.variant??'');
  return <div className="w-full"><svg viewBox={'0 0 560 '+height} aria-hidden="true" className="mx-auto block w-full max-w-[650px]">{content}</svg><div className="mt-2 grid gap-2 text-center text-base font-bold">{labels.map((label,i)=><p key={i}>{keyed&&i<n.length?String.fromCharCode(65+i)+': ':''}{label}</p>)}</div></div>;
}

/** Describes visible geometry without narrating any computed or hidden value. */
export function measurementLessonDescription(v: Measurement8Visual): string {
  if(v.variant==='grid') return `${v.values[0]} full squares and ${v.values[1]} half-covered squares, arranged for counting.`;
  if(v.variant==='strips') return `Adjacent rectangular strips. Strip lengths in metres: ${v.values.join(', ')}.`;
  if(['triangle','squares','ratio'].includes(v.variant??'')) return `${v.variant==='squares'?'Squares are drawn outwards on the three triangle sides.':v.variant==='ratio'?'Each block represents one equal part.':'Triangle sides are marked A, B and C.'} ${(v.labels??[]).slice(0,v.values.length).map((label,i)=>`${String.fromCharCode(65+i)}: ${label}.`).join(' ')}`;
  const descriptions: Record<string,string> = {
    gridCompare:'The same curved outline on a coarse grid and a grid with ten times as many divisions in each direction.',
    boundary:'Six boundary pieces form one closed shape. Labels follow the boundary clockwise.',
    rectangle:'A rectangular region with its length and width labelled.',
    diagonal:'A dashed diagonal joins opposite corners of the rectangle; its length is unknown.',
    prism:'A prism with a constant cross-section. Use the supplied measurements below.',
    cube:'A cube with unknown side length.', triPrism:'A triangular prism. The triangular end has a perpendicular base and height.',
    twoPrisms:'Container A on the left and container B on the right.', packing:'The container is on the left; one cube is on the right. Diagrams are not to the same scale.',
    layers:'One whole box layer is shown below the available space. Dashed lines show where more layers could fit.',
    capacity:'A container of water.', circleUnknown:'A circle with its centre and an unknown radius marked.',
    wheel:'Spokes join the centre to the wheel rim.', squareCircle:'A circle is centred inside a square. The horizontal line passes through the circle centre.',
    twoCircles:'Two circles with a radius marked in each.', quadrant:'A quarter circle, bounded by two perpendicular radii and a curved edge.',
    arch:'The shaded arch lies between two semicircles with the same centre.', circleCompare:'A full circle, a semicircle and a quarter circle, shown schematically.',
    track:'Two equal straights are joined by two semicircular ends. Dashed lines mark their diameters.',
    isoscelesHeight:'A perpendicular height divides the isosceles triangle into two right triangles. The height is unknown.',
    walk:'An eastward leg is followed by a northward leg. The dashed line joins the start and finish.',
    mast:'The vertical mast and horizontal ground meet at a right angle. The cable joins the ground point to the top of the mast.',
    glass:'A vertical cross-section of the glass. The straw runs diagonally from the bottom corner through the opposite rim and extends above it.',
    scale:'The upper line represents the real distance; the lower line represents the map or model distance. Use the stated scale, not the screen lengths.',
  };
  return descriptions[v.variant??'']??'';
}
