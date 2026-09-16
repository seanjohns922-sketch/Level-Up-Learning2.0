/** Flat fabric ribbon. Its outer ends stay exactly at x and x + width. */
export default function MeasuredRibbon({x,y,width,height=28,colour,squareEnd=false}:{x:number;y:number;width:number;height?:number;colour:string;squareEnd?:boolean}) {
 const notch=squareEnd?0:Math.min(height*.45,width*.08);
 return <g>
  <path d={`M${x} ${y}H${x+width}L${x+width-notch} ${y+height/2}L${x+width} ${y+height}H${x}Z`} fill={colour} stroke={colour} strokeWidth=".5"/>
  <path d={`M${x+2} ${y+3}H${x+width-notch-2}M${x+2} ${y+height-3}H${x+width-notch-2}`} stroke="white" strokeOpacity=".65" strokeWidth="1" strokeDasharray="3 2"/>
  <path d={`M${x+2} ${y+height*.32}H${x+width-notch-2}`} stroke="white" strokeOpacity=".22" strokeWidth={height*.22}/>
  {Array.from({length:Math.max(0,Math.floor((width-notch-4)/4))},(_,i)=><path key={i} d={`M${x+3+i*4} ${y+5}v${height-10}`} stroke="white" strokeOpacity=".12" strokeWidth=".5"/>)}
 </g>;
}
