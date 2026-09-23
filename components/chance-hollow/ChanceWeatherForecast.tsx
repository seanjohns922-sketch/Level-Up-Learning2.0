import {useId} from 'react';

/** Forecast evidence only: no time, area shading or probability conversion. */
export default function ChanceWeatherForecast({percent}:{percent:number}){
 const id=useId();
 return <svg viewBox='0 0 460 258' role='img' aria-label={`Local weather forecast. Your location. Tomorrow. Chance of rain: ${percent} percent.`} style={{width:'100%',maxHeight:280,display:'block'}}>
  <defs>
   <linearGradient id={`${id}-sky`} x2='1' y2='1'><stop stopColor='#153d62'/><stop offset='1' stopColor='#347f9b'/></linearGradient>
   <linearGradient id={`${id}-cloud`} x2='0' y2='1'><stop stopColor='#fff'/><stop offset='1' stopColor='#cfdeea'/></linearGradient>
  </defs>
  <rect x='3' y='3' width='454' height='252' rx='24' fill={`url(#${id}-sky)`}/>
  <path d='M295 3H433Q457 3 457 27V179Q395 145 349 98T295 3' fill='#ffffff' opacity='.05'/>
  <text x='26' y='32' fontSize='12' letterSpacing='2' fontWeight='700' fill='#c7e5ef'>LOCAL WEATHER</text>
  <g transform='translate(27 51)' fill='none' stroke='#bfe3ef' strokeWidth='1.7'><path d='M0 6a6 6 0 1 1 12 0c0 4-6 10-6 10S0 10 0 6Z'/><circle cx='6' cy='6' r='2'/></g>
  <text x='47' y='65' fontSize='14' fill='#e8f5f9'>Your location</text>
  <text x='26' y='111' fontSize='29' fontWeight='750' fill='white'>Tomorrow</text>
  <circle cx='357' cy='66' r='26' fill='#ffce69'/><circle cx='357' cy='66' r='33' fill='none' stroke='#ffce69' strokeOpacity='.22' strokeWidth='9'/>
  <path d='M285 126C265 126 258 99 275 88C271 62 303 48 323 66C338 60 355 68 359 84C383 82 394 111 374 123C370 126 366 126 362 126Z' fill='#102d4c' opacity='.15' transform='translate(2 7)'/>
  <path d='M285 126C265 126 258 99 275 88C271 62 303 48 323 66C338 60 355 68 359 84C383 82 394 111 374 123C370 126 366 126 362 126Z' fill={`url(#${id}-cloud)`}/>
  {[294,321,348].map((x,i)=><path key={x} d={`M${x} ${137+i%2*5}q-10 13-4 15q8 4 4-15Z`} fill='#7cddff'/>)}
  <rect x='23' y='174' width='414' height='61' rx='14' fill='#fff'/>
  <path d='M48 188Q35 204 43 210Q55 217 58 206Q60 200 48 188Z' fill='#2b8cb6'/>
  <text x='73' y='211' fontSize='19' fontWeight='650' fill='#29495c'>Chance of rain</text>
  <text x='416' y='216' textAnchor='end' fontSize='36' fontWeight='800' fill='#185878'>{percent}%</text>
 </svg>;
}
