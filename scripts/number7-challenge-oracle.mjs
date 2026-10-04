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
    // Second application forms, recognised by their wording.
    const gcdv=(x,y)=>y?gcdv(y,x%y):x;
    const alt=(()=>{
      if(/square patio uses/.test(p))return Math.sqrt(v[0]);
      if(/Two square rooms have areas/.test(p))return Math.sqrt(v[1])-Math.sqrt(v[0]);
      if(/square field has a perimeter/.test(p))return (v[0]/4)**2;
      if(/Both side lengths are prime/.test(p)){let f=2;while(v[0]%f)f++;return 2*(f+v[0]/f);}
      if(/bacteria count doubles/.test(p))return Math.log2(v[1]);
      if(/red beads and \d+ blue beads/.test(p))return gcdv(v[0],v[1]);
      if(/stadium holds/.test(p)){const m=p.match(/holds (.*?) people\. How many stadiums of that size would hold (.*?) people/);return calculate(m[2])/calculate(m[1]);}
      if(/ten-thousands, \d+ hundreds and \d+ ones/.test(p))return v[0]*10000+v[1]*100+v[2];
      if(/value of the digit in the thousands place/.test(p))return Math.floor(v[0]/1000)%10*1000;
      if(/students walk to school/.test(p))return v[2]/v[1]*v[0];
      if(/Three ribbons are/.test(p))return v[0]+v[1]/v[2]+v[3]+v[4]/v[5];
      if(/jacket is reduced by/.test(p))return v[0]*(100-v[1])/100;
      if(/Which is colder/.test(p))return v[0]-v[1]/v[2];
      if(/friends share a \$/.test(p))return Math.round(v[1]/v[0]*100)/100;
      if(/How much is left after buying/.test(p))return v[0]-Math.ceil(q.paintContext.need/q.paintContext.capacity)*q.paintContext.price;
      if(/by rounding each number to the nearest whole number/.test(p))return Math.round(v[0])*Math.round(v[1]);
      if(/poured into a third jug/.test(p))return v[0]/v[1]+v[2]/v[3];
      if(/play sport, and 1\/4 of those/.test(p))return v[0]*v[1]/v[2]*v[3]/v[4];
      if(/cut into pieces 2\/3 m long/.test(p))return Math.floor(v[0]*v[2]/v[1]+1e-9);
      if(/You buy \d+ items at/.test(p))return v[0]*v[1];
      if(/pipe is cut into/.test(p))return v[0]/v[1];
      if(/discounted by 20%, then a further 10%/.test(p))return v[0]*.8*.9;
      if(/at 6 am and/.test(p))return v[2]-v[0];
      if(/How much must she deposit/.test(p))return v[0]+v[1];
      if(/Five daily temperature changes/.test(p))return v.slice(0,5).reduce((t,x)=>t+x,0);
      if(/ratio of boys to girls/.test(p))return v[2]/(v[0]+v[1])*v[1];
      if(/How much more does Mia get than Leo/.test(p))return v[0]/(v[1]+v[2])*(v[1]-v[2]);
      if(/map has a scale of/.test(p))return v[2]*v[1]/100000;
      if(/game is 15% off/.test(p))return v[0]*v[1]/100;
      if(/A shop buys a toy for/.test(p))return (v[1]-v[0])/v[0]*100;
      if(/bag of rice costs/.test(p))return v[1]/(v[0]/100);
    })();
    if(alt!==undefined)return eq(calculate(option),alt);
    switch(key) {
      case 1: answer=v[2]*v[3]-v[0]*v[1];break;
      case 2: answer=Math.sqrt(v[0])*(Math.sqrt(v[0])+v[1]);break;
      case 3: answer=4*Math.sqrt(v[0]);break;
      case 4: {let k=1;while(!Number.isInteger(Math.sqrt(v[0]*k)))k++;answer=k;}break;
      case 5: answer=v[0]**v[1];break;
      case 6: {const [a,b]=v;let multiple=Math.max(a,b);while(multiple%a||multiple%b)multiple++;answer=multiple;}break;
      case 7: {const m=p.match(/holds (.*?) items and sends out (.*?) items/);answer=calculate(m[1])-calculate(m[2]);break;}
      case 8: {const m=p.match(/records (.*?) items\. Another (\d+)/);answer=calculate(m[1])+Number(m[2]);break;}
      case 9: {const m=p.match(/(\d+) = (\d+) × 10⁴ \+ □ × 10³ \+ (\d+) × 10/);answer=(Number(m[1])-Number(m[2])*10000-Number(m[3])*10)/1000;break;}
      case 10: answer=v[0]-v[0]*v[1]/v[2];break;
      case 11: answer=v[0]-(v[1]+v[2]/v[3]);break;
      case 12: answer=100*v[0]/v[1];break;
      case 13: answer=q.visual.markers[0].position+v[0]/v[1];break;
      case 14: answer=q.visual.markers[0].position+(p.includes('right')?1:-1)*v[0]/v[1];break;
      case 15: answer=v[3]+Math.abs(v[0])+v[1]/v[2];break;
      case 16: {const thousandths=Number(p.match(/\$(\d+\.\d{3})/)[1].replace('.',''));answer=Math.floor((thousandths*v[0]+5)/10)/100;break;}
      case 17: answer=Math.ceil(q.paintContext.need/q.paintContext.capacity)*q.paintContext.price;break;
      case 18: answer=v[0]*Math.round(v[1]/10)*10+v[2];break;
      case 19: answer=v[0]/v[1]+(p.includes('Use')?-1:1)*v[2]/v[3];break;
      case 20: answer=v[0]*v[1]/v[2]*v[3]/v[4];break;
      case 21: answer=Math.floor(v[0]/v[1]/(v[2]/v[3]));break;
      case 22: answer=v[0]-v[1]-v[2]-v[3];break;
      case 23: answer=(v[0]-v[1])/v[2];break;
      case 24: answer=v[0]*(100-v[1]-v[2])/100;break;
      case 25: answer=Math.max(...v)-Math.min(...v);break;
      case 26: answer=v[0]+v[1]-v[2];break;
      case 27: assert.ok(p.includes('−$'));answer=-v[0]-v[1]+v[2];break;
      case 28: answer=(v[0]+v[2])/(v[0]+v[1]+v[2]);break;
      case 29: answer=v[2]/v[0]*(v[0]+v[1]);break;
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
    case 7: {const [big,small]=[...p.matchAll(/10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g)].map(m=>calculate(`10${m[1]}`));answer=big/small;break;}
    case 8: answer=calculate(p.match(/wrote (.*?)\. What/)[1]);break;
    case 9: answer=v[0]-v[1]*9000;break;
    case 10: return option.startsWith('Divide the top and bottom')&&o[0]===v[0]/v[2]&&eq(v[0]/v[1],v[2]/v[3]);
    case 11: answer=v[0]/v[1];break;
    case 12: return eq(o[0],v[0]/100)&&eq(o[1]/o[2],v[0]/100);
    case 13: return eq(calculate(option),q.visual.markers[0].position);
    case 14: return eq(calculate(option),q.visual.markers[0].position);
    case 15: return option.includes(' < ')&&o[0]<o[1]&&option.includes('farther left');
    case 16: {const x=Number(p.match(/What is (\d+\.\d+) to 1 decimal/)[1]);return eq(Number(option),Math.round(x*10)/10);}
    case 17: return Number(option)===Math.ceil(q.paintContext.need/q.paintContext.capacity);
    case 18: answer=Math.round(v[0])*Math.round(v[1]);break;
    case 19: answer=v[0]/v[1]+v[2]/v[3];break;
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
