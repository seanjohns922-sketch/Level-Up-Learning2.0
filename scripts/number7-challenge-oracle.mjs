// Independent answer checks read quantities from the student-facing wording.
// This module never reads generator operands, expectedValue or its explanation.
import assert from 'node:assert/strict';
export const numbers = s => (s.replace(/(?<=\d),(?=\d)/g,'').replaceAll('−','-').match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
export function calculate(s) {
  s=s.replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/').replace(/(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,(_,a,b)=>`(${a}**${[...b].map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')})`);
  assert.match(s,/^[\d\s.()+*/-]+$/);
  return Function(`return (${s})`)();
}
const eq=(x,y)=>Math.abs(x-y)<1e-7;
export function validChallenge(key,q,option) {
  const p=q.prompt,v=numbers(p),o=numbers(option);let answer;
  if(q.tier==='apply_create') {
    switch(key) {
      case 1: answer=v[2]*v[3]-v[0]*v[1];break;
      case 2: answer=Math.sqrt(v[0])*(Math.sqrt(v[0])+v[1]);break;
      case 3: answer=4*Math.sqrt(v[0]);break;
      case 4: answer=v[0]/v.at(-1);break;
      case 5: answer=v[0]**v[1];break;
      case 6: {const [a,b]=v;let multiple=Math.max(a,b);while(multiple%a||multiple%b)multiple++;answer=multiple;}break;
      case 7: {const m=p.match(/holds (.*?) items and sends out (.*?) items/);answer=calculate(m[1])-calculate(m[2]);break;}
      case 8: {const m=p.match(/records (.*?) items\. Another (\d+)/);answer=calculate(m[1])+Number(m[2]);break;}
      case 9: {const m=p.match(/(\d+) = (\d+) × 10⁴ \+ □ × 10² \+ (\d+) × 10/);answer=(Number(m[1])-Number(m[2])*10000-Number(m[3])*10)/100;break;}
      case 10: answer=v[0]-v[0]*v[1]/v[2];break;
      case 11: answer=v[0]-v[1]/v[2];break;
      case 12: answer=100*v[0]/v[1];break;
      case 13: answer=v[0]/v[1]+v[2]/v[1];break;
      case 14: answer=v[0]+v[1]/4;break;
      case 15: answer=v[2]-v[0]/v[1];break;
      case 16: {const thousandths=Number(p.match(/\$(\d+\.\d{3})/)[1].replace('.',''));answer=Math.floor((thousandths*v[0]+5)/10)/100;break;}
      case 17: answer=Math.ceil(v[0]/v[1])*v[2];break;
      case 18: answer=v[0]*Math.round(v[1]/10)*10+v[2];break;
      case 19: answer=Math.round((v[0]-v[1]/v[2]-v[3]/v[4])*1000)/1000;break;
      case 20: answer=v[0]*v[1]/v[2]*v[3]/v[4];break;
      case 21: answer=Math.floor(v[0]/v[1]/(v[2]/v[3]));break;
      case 22: answer=v[0]-v[1]-v[2]-v[3];break;
      case 23: answer=(v[0]-v[1])/v[2];break;
      case 24: answer=v[0]*(100-v[1]-v[2])/100;break;
      case 25: answer=Math.max(...v)-Math.min(...v);break;
      case 26: answer=v[0]+v[1]-v[2];break;
      case 27: answer=v[0]-v[1]+v[2];break;
      case 28: answer=(v[0]+v[2])/(v[0]+v[1]+v[2]);break;
      case 29: answer=v[0]*v[1]/(v[1]+v[2]);break;
      case 30: answer=(v[0]+v[2])*v[4]/v[3]-v[1];break;
      case 31: answer=v[3]-v[0]*(100-v[1])/100-v[2];break;
      case 32: answer=(v[2]-v[0]-v[1])/(v[0]+v[1])*100;break;
      case 33: answer=v[1]/v[0];break;
      case 34: answer=v[0]-v[1]*v[2];break;
      case 35: answer=v[0]+v[1]-v[2];break;
      case 36: answer=v[0]/100*v[1]*v[2]-v[3];break;
      default: throw Error(`Missing application oracle ${key}`);
    }
    return eq(calculate(option),answer);
  }
  assert.equal(q.tier,'reasoning');
  switch(key) {
    case 1: answer=v[2]*v[3]-v[0]*v[1];break;
    case 2: answer=v[0]*4;break;
    case 3: return option.startsWith('Between')&&o[0]+1===o[1]&&o[0]**2<v[0]&&v[0]<o[1]**2&&o[2]===o[0]**2&&o[3]===v[0]&&o[4]===o[1]**2;
    case 4: return option.includes('each exponent counts')&&eq(calculate(option.split(';')[0]),v[0]);
    case 5: answer=calculate(p.match(/writes (.*?) =/)[1]);break;
    case 6: return option==='Find the highest common factor.';
    case 7: return option==='It contains one additional factor of 10.';
    case 8: answer=v[0];break;
    case 9: answer=v[0]-v[1]*9000;break;
    case 10: return option.startsWith('Divide the top and bottom')&&o[0]===v[0]/v[2]&&eq(v[0]/v[1],v[2]/v[3]);
    case 11: answer=v[0]/v[1];break;
    case 12: return eq(o[0],v[0]/100)&&eq(o[1]/o[2],v[0]/100);
    case 13: return eq(calculate(option.split('=')[0].trim()),v[0]/v[2])&&option.includes('divide the interval count');
    case 14: return eq(o[0],v[0]/v[1])&&o[1]<o[0]&&o[0]<o[2]&&option.includes('left of zero');
    case 15: return option.includes(' < ')&&o[0]<o[1]&&option.includes('farther left');
    case 16: return option.startsWith('Round the original value directly')&&eq(o[0],Math.round(v[0]*10)/10)&&option.includes('hundredths digit');
    case 17: return o[0]===Math.ceil(v[0]/v[1])&&option.includes('round up.');
    case 18: answer=Math.round(v[0])*Math.round(v[1]);break;
    case 19: answer=v[0]/v[1]-v[2]/v[3];break;
    case 20: return v[2]/v[3]>0&&v[2]/v[3]<1&&option.startsWith('It is smaller because')&&option.includes('positive and less than 1');
    case 21: answer=v[0]/v[1]/(v[2]/v[3]);break;
    case 22: answer=v[0]+v[1];break;
    case 23: answer=v[0]/v[1];break;
    case 24: answer=v[2]*v[0]/100;break;
    case 25: return o[0]===Math.min(...v)&&Math.abs(o[0])===Math.max(...v.map(Math.abs))&&option.endsWith('greater magnitude but the smaller value.');
    case 26: return o[0]===v[0]&&o[1]===Math.abs(v[1])&&o[2]===v[0]+v[1]&&option.includes(v[1]<0?'left':'right');
    case 27: answer=v[0]-v[1];break;
    case 28: answer=v[0]/(v[0]+v[1]);break;
    case 29: answer=v[0]*v[1]/(v[1]+v[2]);break;
    case 30: answer=v[2]*v[1]/(v[0]+v[1]);break;
    case 31: answer=v[0]*(1-v[1]/100)+v[2];break;
    case 32: answer=(v[1]-v[0])/v[0]*100;break;
    case 33: return option.startsWith('B is cheaper:')&&eq(o[0],v[3]/v[2])&&eq(o[1],v[1]/v[0])&&o[0]<o[1];
    case 34: answer=v[0]-v[1]*v[2]-v[3];break;
    case 35: answer=v[0]+v[1]-v[2];break;
    case 36: answer=v[0]/100*v[1]*v[2];break;
    default: throw Error(`Missing reasoning oracle ${key}`);
  }
  return eq(calculate(option),answer);
}
