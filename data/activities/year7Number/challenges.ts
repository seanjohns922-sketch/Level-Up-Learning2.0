import type { MultipleChoiceQuestion } from '@/data/activities/year2/lessonEngine';
import { number7Guide, number7ContentKey, NUMBER7_READABILITY_REVISION } from './curriculum';

export type Number7Role = 'fast_thinking' | 'reasoning' | 'apply_create';

type Choice = readonly [text: string, value: number];
type Task = { prompt: string; answer: string; options: string[]; explanation: string };
const fmt = (n: number) => String(Math.round(n * 1e8) / 1e8);
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
const frac = (n: number, d: number) => { const h = gcd(n, d); return d / h === 1 ? String(n / h) : `${n / h}/${d / h}`; };
const mixed = (n: number, d: number) => { const h = gcd(n, d), N = n / h, D = d / h; if (D === 1) return String(N); const w = Math.trunc(N / D), r = Math.abs(N % D); return w ? `${w} ${r}/${D}` : `${N}/${D}`; };
const article = (n: number) => /^(8|11|18)/.test(String(n)) ? 'An' : 'A';
const power = (a: number, b: number) => `${a}${String(b).replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])}`;

// These are separate reasoning and application tasks, not reworded fluency.
// Model distractors are mathematically distinct and all have the same format.
export function number7Challenge(week: number, lesson: number, seed: number, role: 'reasoning' | 'apply_create') {
  const guide = number7Guide(week, lesson);
  if (!guide) throw Error('Unknown Level 7 lesson');
  let state = (seed >>> 0) || 1;
  const int = (lo: number, hi: number) => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return lo + state % (hi - lo + 1); };
  const pick = <T,>(xs: T[]) => xs[int(0, xs.length - 1)];
  const n = int(5, 16), a = int(3, 8), b = int(2, 6), c = int(2, 5);
  const ra = a / gcd(a, b), rb = ra === b / gcd(a, b) ? ra + 1 : b / gcd(a, b);
  const key = number7ContentKey(week, lesson);
  let task: Task | undefined;
  let paintContext: MultipleChoiceQuestion["paintContext"];
  let visual: MultipleChoiceQuestion["visual"], diagramSpeech: string | undefined;
  const numberLine = (u:number,d:number,direction?:number) => {
    const min=Math.min(0,Math.floor(u/d)-1),max=Math.max(1,Math.ceil(u/d)+1);
    visual={type:"fraction_number_line",title:"Read point P",leftLabel:"",rightLabel:"",leftPosition:min,rightPosition:max,min,max,subdivisions:d,markers:[{label:"P",position:u/d}]};
    if (direction) visual.jumps={start:u/d,step:direction/d,count:1,label:`1/${d}`};
    diagramSpeech=`Number line from ${min} to ${max}. Each whole has ${d} equal spaces. P is ${Math.abs(u)} spaces to the ${u<0?'left':'right'} of zero.${direction?` One jump ${direction>0?'right':'left'}, of 1/${d}. The destination is marked with a question mark.`:''}`;
  };
  const choice = (prompt: string, answer: string, wrong: string[], explanation: string) => {
    const options = [...new Set([answer, ...wrong])];
    if (options.length !== 4) throw Error(`Invalid choices: ${key}/${role}`);
    task = { prompt, answer, options, explanation };
  };
  // Money answers show cents (5.50, not 5.5) whenever any choice is not a whole number of dollars.
  const numeric = (prompt: string, answer: number, wrong: number[], explanation: string, money = false) => {
    const options = [answer];
    for (const v of wrong) if (Number.isFinite(v) && !options.some(x => Math.abs(x - v) < 1e-7)) options.push(v);
    for (let delta = 1; options.length < 4; delta++) if (!options.some(x => Math.abs(x - answer - delta) < 1e-7)) options.push(answer + delta);
    const show = money && options.slice(0, 4).some(v => !Number.isInteger(Math.round(v * 1e8) / 1e8)) ? (v: number) => v.toFixed(2) : fmt;
    choice(prompt, show(answer), options.slice(1, 4).map(show), explanation);
  };
  const model = (prompt: string, correct: Choice, wrong: Choice[], explanation: string) => {
    const values = [correct[1]], options: string[] = [];
    for (const [text, value] of wrong) if (!values.some(v => Math.abs(v - value) < 1e-7)) { values.push(value); options.push(text); }
    if (options.length < 3) throw Error(`Equivalent models: ${key}/${role}`);
    choice(prompt, correct[0], options.slice(0, 3), explanation);
  };

  if (role === 'reasoning') switch (key) {
    case 1: {
      const next = (n + 1) ** 2, base = n ** 2;
      model(`${article(n)} ${n} by ${n} square grows to ${n + 1} by ${n + 1}. Which calculation finds the number of extra tiles?`,
        [`${n} + ${n} + 1`, next - base], [[`${n} + ${n}`, 2*n], [`${n} × ${n} + 1`, base+1], [`(${n} + 1) × 2`, 2*(n+1)]],
        `Add one row of ${n}, one column of ${n}, and the corner tile: ${2*n+1}. Check: ${next} − ${base} = ${2*n+1}.`); break;
    }
    case 2: {
      const area = n*n;
      model(`A square of area ${area} m² has each side doubled. Which model finds its new area in m²?`,
        [`(${n} × 2) × (${n} × 2)`, area*4], [[`${area} × 2`,area*2],[`${area} + 2`,area+2],[`${n} × 2`,n*2]],
        `The original side is √${area} = ${n} m. Both dimensions double, so the new area is ${2*n} × ${2*n} = ${4*area} m².`); break;
    }
    case 3: {
      const area = n*n+a;
      choice(`A square has area ${area} m². Which statement correctly locates its side length?`,
        `Between ${n} and ${n+1} m because ${n*n} < ${area} < ${(n+1)**2}.`,
        [`Between ${n-1} and ${n} m because ${(n-1)**2} < ${area} < ${n*n}.`,`Between ${n+1} and ${n+2} m because ${(n+1)**2} < ${area} < ${(n+2)**2}.`,`Exactly ${area/2} m because the area should be divided by 2.`],
        `A side is the square root of the area. The consecutive perfect squares around ${area} are ${n*n} and ${(n+1)**2}.`); break;
    }
    case 4: {
      const p = int(3,4), q = int(2,3), value = 2**p*3**q;
      choice(`A factor tree for ${value} ends with ${p} factors of 2 and ${q} factors of 3. Which explanation correctly groups the factors?`,
        `${power(2,p)} × ${power(3,q)}; each exponent counts occurrences of its prime factor.`,
        [`${power(p,2)} × ${power(q,3)}; each base counts occurrences of its prime factor.`,`${2*p} × ${3*q}; repeated prime factors should be added before multiplying.`,`${power(2,p+1)} × ${power(3,q)}; the starting number counts as an extra factor of 2.`],
        `The leaves multiply to ${value}. There are ${p} twos and ${q} threes, so the prime factorisation is ${power(2,p)} × ${power(3,q)}.`); break;
    }
    case 5: {
      const base = pick([2,3,5]), exponent = int(3,5);
      model(`A student writes ${power(base,exponent)} = ${base*exponent}. Which calculation is correct?`,
        [Array(exponent).fill(base).join(' × '),base**exponent], [[`${base} × ${exponent}`,base*exponent],[`${base} + ${exponent}`,base+exponent],[Array(exponent-1).fill(base).join(' × '),base**(exponent-1)],[Array(exponent+1).fill(base).join(' × '),base**(exponent+1)]],
        `The exponent counts equal factors, not groups to add. ${power(base,exponent)} means ${exponent} factors of ${base}, giving ${base**exponent}.`); break;
    }
    case 6: {
      const x = a*3, y = a*4;
      choice(`Share ${x} blue and ${y} gold crystals into as many identical packs as possible. None are left. Which method finds the number of packs?`,
        'Find the highest common factor.',
        ['Find the lowest common multiple.','Add the two amounts.','Multiply the two amounts.'],
        `Use the highest common factor: ${a}. Each pack has 3 blue and 4 gold crystals.`); break;
    }
    case 7: {
      const e = int(2,4), k = int(2,3);
      numeric(`A student says ${power(10,e+k)} is ${k} times as large as ${power(10,e)} because the exponent went up by ${k}. How many times as large is it really?`,10**k,[k,10*k,e+k],
        `Each step up in the exponent multiplies by another 10. Going up by ${k} multiplies by ${Array(k).fill(10).join(' × ')} = ${10**k}.`); break;
    }
    case 8: {
      const value = a*100000+b*1000+c*10, written = a*10000+b*100+c;
      numeric(`To write ${value.toLocaleString('en-AU')} using powers of ten, a student wrote ${a} × 10⁴ + ${b} × 10² + ${c}. What number does the student's expanded form actually equal?`,written,[value,value/10+c,a*100000+b*1000+c],
        `The student shifted every digit one place: ${a} × 10 000 + ${b} × 100 + ${c} = ${written}. The correct form is ${a} × 10⁵ + ${b} × 10³ + ${c} × 10.`); break;
    }
    case 9: {
      const value = a*10000+b*100+c, moved = a*1000+b*100+c;
      model(`In ${value}, the digit ${a} is moved from ten-thousands to thousands while all other place-value contributions stay unchanged. Which calculation gives the new total?`,
        [`${value} − ${a*10000} + ${a*1000}`,moved], [[`${value} ÷ 10`,value/10],[`${value} − ${a*1000}`,value-a*1000],[`${value} + ${a*1000}`,value+a*1000]],
        `Only the ${a}'s contribution changes: replace ${a*10000} with ${a*1000}. Dividing the entire number by 10 would change every contribution.`); break;
    }
    case 10: {
      const den = a+1, scale = b+1;
      choice(`How can you change ${a*scale}/${den*scale} to ${a}/${den}?`,
        `Divide the top and bottom by ${scale}.`,
        [`Subtract ${scale} from the top and bottom.`,`Divide only the top by ${scale}.`,`Divide only the bottom by ${scale}.`],
        `Equivalent fractions are formed by multiplying or dividing both parts by the same nonzero factor. Here that factor is ${scale}.`); break;
    }
    case 11: {
      const u=pick([3,5,7]), v=u/8;
      model(`Which calculation equals ${u}/8?`,
        [`(${u} × 125) ÷ (8 × 125)`,v], [[`(${u} × 125) ÷ 8`,v*125],[`${u} ÷ (8 × 125)`,v/125],[`8 ÷ ${u}`,8/u]],
        `Scale both parts by 125 to get ${u*125}/1000 = ${v}. Multiplying only one part changes the value.`); break;
    }
    case 12: {
      const percent=pick([12,28,36,64,72]), d=percent/100;
      choice(`Which pair equals ${percent}%?`,
        `${fmt(d)} and ${frac(percent,100)}`,
        [`${fmt(percent/10)} and ${frac(percent,10)}`,`${percent} and ${percent}/1`,`${fmt(percent/1000)} and ${frac(percent,1000)}`],
        `${percent}% means ${percent} out of 100. As a decimal it is ${d}, and as a simplified fraction it is ${frac(percent,100)}.`); break;
    }
    case 13: {
      const d=pick([2,4,5]), u=d+a+(a%d===0?1:0);
      numberLine(u,d);
      choice('Which fraction is at P?',frac(u,d),
        [frac(u+1,d),frac(u-1,d),frac(u+d,d)],
        `Each space is 1/${d}. Count ${u} spaces from 0: ${u}/${d}${frac(u,d)===`${u}/${d}`?'':` = ${frac(u,d)}`} = ${mixed(u,d)}.`); break;
    }
    case 14: {
      const d=pick([2,4,5]),u=-(d+a+(a%d===0?1:0));
      numberLine(u,d);
      choice('Which fraction is at P?',frac(u,d),
        [frac(-u,d),frac(u-1,d),frac(u+1,d)],
        `P is left of 0, so it is negative. Each space is 1/${d}. Its value is ${frac(u,d)}.`); break;
    }
    case 15: {
      const x=-a/4,y=-(a+1)/4;
      choice(`Which comparison and explanation are correct for ${fmt(x)} and ${fmt(y)}?`,
        `${fmt(y)} < ${fmt(x)} because ${fmt(y)} is farther left on the number line.`,
        [`${fmt(y)} > ${fmt(x)} because its distance from zero is greater.`,`${fmt(y)} = ${fmt(x)} because both numbers are negative.`,`${fmt(x)} < ${fmt(y)} because a smaller magnitude always means a smaller value.`],
        `For negative numbers, greater magnitude means farther left and therefore smaller value. ${fmt(y)} is one quarter less than ${fmt(x)}.`); break;
    }
    case 16: {
      const value=n+0.249;
      numeric(`Ana rounded ${value.toFixed(3)} → ${(n+.25).toFixed(2)} → ${(n+.3).toFixed(1)}. What is ${value.toFixed(3)} to 1 decimal place?`,n+.2,[n+.3,n+.25,n],
        `Round once, looking only at the hundredths digit: 4 is less than 5, so the tenths digit stays. ${value.toFixed(3)} → ${fmt(n+.2)}. Rounding in steps changes the answer.`); break;
    }
    case 17: {
      const need=n+.4,capacity=3, tins=Math.ceil(need/capacity), down=Math.floor(need/capacity);
      paintContext={need,capacity};
      numeric(`Sam bought ${down} ${down===1?'tin':'tins'}. How many are actually needed?`,tins,[down,need,tins+1],
        `${down} ${down===1?'tin holds':'tins hold'} only ${down*capacity} L, which is less than ${need} L. Always round up to cover the whole amount: ${tins} tins.`); break;
    }
    case 18: {
      const x=n*10-.2,y=b+.1;
      model(`Estimate ${fmt(x)} × ${fmt(y)} using nearby whole numbers to check its size. Which calculation is appropriate?`,
        [`${n*10} × ${b}`,n*10*b], [[`${n} × ${b}`,n*b],[`${n*100} × ${b}`,n*100*b],[`${n*10} + ${b}`,n*10+b]],
        `${x} is close to ${n*10} and ${y} is close to ${b}. The product should be about ${n*10*b}, helping detect a misplaced decimal point.`); break;
    }
    case 19: {
      const d=a+1,e=d+1,u=d-1,v=1;
      choice(`A student says ${u}/${d} + ${v}/${e} = ${u+v}/${d+e}. What is the correct sum? Give a fraction.`,frac(u*e+v*d,d*e),[frac(u+v,d+e),frac(u+v,d*e),frac(u*e+v*d+1,d*e)],
        `The student added the denominators, but 1/${d} and 1/${e} are different-sized parts. Rename both: ${u*e}/${d*e} + ${v*d}/${d*e} = ${frac(u*e+v*d,d*e)}.`); break;
    }
    case 20: {
      const d=a+1,e=b+1;
      choice(`Without multiplying exactly, how does ${a}/${d} × ${b}/${e} compare with ${a}/${d}?`,
        `It is smaller because ${b}/${e} is positive and less than 1.`,
        [`It is larger because multiplication always increases a quantity.`,`It is equal because multiplying fractions never changes the first factor.`,`It is negative because both numerators are smaller than their denominators.`],
        `Multiplying by ${b}/${e} takes only a fraction of the first quantity. Both factors are positive, so the result is positive and smaller than ${a}/${d}.`); break;
    }
    case 21: {
      const d=a+1,e=b+1;
      model(`Which multiplication is equivalent to ${a}/${d} ÷ ${b}/${e}?`,
        [`${a}/${d} × ${e}/${b}`,a*e/(d*b)], [[`${d}/${a} × ${b}/${e}`,d*b/(a*e)],[`${a}/${d} × ${b}/${e}`,a*b/(d*e)],[`${d}/${a} × ${e}/${b}`,d*e/(a*b)],[`${a}/${d} + ${e}/${b}`,a/d+e/b]],
        `Keep the dividend and multiply by the reciprocal of the divisor only: ${a}/${d} × ${e}/${b} = ${frac(a*e,d*b)}.`); break;
    }
    case 22: {
      const x=n+.7,y=a+.85;
      model(`Which calculation aligns place values to find ${x} + ${y}?`,
        [`(${n*100+70} + ${a*100+85}) ÷ 100`,x+y], [[`(${n*10+7} + ${a*100+85}) ÷ 100`,(n*10+7+a*100+85)/100],[`(${n*100+70} + ${a*100+85}) ÷ 10`,(x+y)*10],[`(${n*100+70} − ${a*100+85}) ÷ 100`,x-y]],
        `Write both values in hundredths: ${x} = ${n*100+70}/100 and ${y} = ${a*100+85}/100. Add like place values.`); break;
    }
    case 23: {
      const x=a*.6,y=.3;
      model(`Which whole-number division is equivalent to ${fmt(x)} ÷ ${y}?`,
        [`${a*6} ÷ 3`,a*2], [[`${a*6} ÷ 30`,a/5],[`${a*60} ÷ 3`,a*20],[`3 ÷ ${a*6}`,1/(a*2)]],
        'Scale the dividend and divisor by the same factor of 10. Scaling only one changes the quotient.'); break;
    }
    case 24: {
      const total=n*8;
      model(`Which calculation uses a fraction equivalent to 37.5% to find 37.5% of ${total}?`,
        [`${total} ÷ 8 × 3`,n*3], [[`${total} ÷ 3 × 8`,total*8/3],[`${total} ÷ 8`,n],[`${total} × 37.5`,total*37.5]],
        `37.5% = 0.375 = 3/8. One eighth of ${total} is ${n}, so three eighths is ${n*3}.`); break;
    }
    case 25: {
      const x=-n,y=-a-20;
      choice(`Which statement distinguishes value from magnitude for ${x} and ${y}?`,
        `${y} has the greater magnitude but the smaller value.`,
        [`${y} has the greater magnitude and the greater value.`,`${x} has the greater magnitude but the smaller value.`,`${x} and ${y} have equal values because both are negative.`],
        `Magnitude is distance from zero. ${y} is farther from zero but lies farther left, so it is smaller.`); break;
    }
    case 26: {
      const x=-n,y=-a;
      choice(`Which number-line move represents ${x} + (${y})?`,
        `Start at ${x} and move ${a} places left to ${x+y}.`,
        [`Start at ${x} and move ${a} places right to ${x-y}.`,`Start at ${n} and move ${a} places left to ${n-a}.`,`Start at ${n} and move ${a} places right to ${n+a}.`],
        `Adding a negative moves left. Starting at ${x}, another ${a} steps left gives ${x+y}.`); break;
    }
    case 27: {
      const x=-n,y=-a;
      model(`Which addition is equivalent to ${x} − (${y})?`,[`${x} + ${a}`,x-y],[[`${x} + (${y})`,x+y],[`${n} + ${a}`,n+a],[`${n} + (${y})`,n-a],[`${x} + ${2*a}`,x+2*a]],
        `Subtracting ${y} means adding its opposite, +${a}. Keep the starting value ${x}.`); break;
    }
    case 28: {
      choice(`Blue:gold crystals = ${ra}:${rb}. Which fraction of all crystals is blue?`,`${ra}/${ra+rb}`,[`${ra}/${rb}`,`${ra}/${ra+rb+1}`,`${ra+rb}/${ra}`],
        `There are ${ra+rb} total parts, of which ${ra} are blue. A part-to-part ratio is different from a fraction of the whole.`); break;
    }
    case 29: {
      const total=(ra+rb)*n;
      model(`Share $${total} in the ratio ${ra}:${rb}. Which model correctly finds the first share?`,[`${total} ÷ (${ra} + ${rb}) × ${ra}`,ra*n],[[`${total} ÷ ${ra}`,total/ra],[`${total} ÷ ${rb}`,total/rb],[`${total} × ${ra} ÷ ${rb}`,total*ra/rb],[`${total} + ${ra} + ${rb}`,total+ra+rb]],
        `First find one of the ${ra+rb} equal parts: $${n}. The first share contains ${ra} part${ra===1?'':'s'}, so it is $${ra*n}.`); break;
    }
    case 30: {
      const total=(ra+rb)*100;
      model(`Concentrate:water = ${ra}:${rb}. Which model finds the water in a ${total} mL mixture?`,[`${total} ÷ (${ra} + ${rb}) × ${rb}`,rb*100],[[`${total} ÷ ${rb}`,total/rb],[`${total} × ${rb} ÷ ${ra}`,total*rb/ra],[`${total} − ${rb}`,total-rb],[`${total} + ${ra} + ${rb}`,total+ra+rb]],
        `The mixture has ${ra+rb} parts altogether. Water takes ${rb} of them, so use ${frac(rb,ra+rb)} of ${total} mL.`); break;
    }
    case 31: {
      const price=n*20,rate=pick([15,20,25]),fee=a,paid=1-rate/100;
      model(`A $${price} bag is ${rate}% off. Delivery of $${fee} is not discounted. Which model gives the final cost?`,[`${price} × ${paid} + ${fee}`,price*paid+fee],[[`(${price} + ${fee}) × ${paid}`,(price+fee)*paid],[`${price} × ${rate/100} + ${fee}`,price*rate/100+fee],[`${price} − ${rate} + ${fee}`,price-rate+fee],[`${price} + ${fee}`,price+fee]],
        `Pay ${100-rate}% of the bag's price, then add all of the delivery fee. The discount is a percentage, not $${rate}.`); break;
    }
    case 32: {
      const cost=n*10,profit=a*5,revenue=cost+profit;
      model(`An event costs $${cost} and earns $${revenue}. Which calculation expresses profit as a percentage of cost?`,[`(${revenue} − ${cost}) ÷ ${cost} × 100`,profit/cost*100],[[`(${revenue} − ${cost}) ÷ ${revenue} × 100`,profit/revenue*100],[`${revenue} ÷ ${cost} × 100`,revenue/cost*100],[`(${cost} − ${revenue}) ÷ ${cost} × 100`,-profit/cost*100]],
        `Profit is revenue minus cost. Compare that profit with the original cost, not revenue, then multiply by 100.`); break;
    }
    case 33: {
      const unit=a+.5,pack=4*unit,large=6*(unit-.25);
      choice(`Pack A: 4 notebooks for $${pack.toFixed(2)}. Pack B: 6 for $${large.toFixed(2)}. Which comparison correctly identifies the lower unit price?`,
        `B is cheaper: $${(large/6).toFixed(2)} each versus A: $${unit.toFixed(2)} each.`,
        [`A is cheaper: $${unit.toFixed(2)} each versus B: $${(large/6).toFixed(2)} each.`,`A is better because its total pack price is smaller.`,`Both have equal unit prices because both contain notebooks.`],
        `Divide each pack's price by its quantity. B is $0.25 cheaper per notebook; total pack price alone does not compare equal quantities.`); break;
    }
    case 34: {
      const price=a+.75,count=b+3,fee=c,budget=50+n;
      model(`You have $${budget}. Buy ${count} supplies at $${price.toFixed(2)} each and pay one delivery fee of $${fee}. Which model gives money remaining?`,[`${budget} − (${count} × ${price} + ${fee})`,budget-count*price-fee],[[`${budget} − ${count} × (${price} + ${fee})`,budget-count*(price+fee)],[`${budget} − (${count} + ${price} + ${fee})`,budget-count-price-fee],[`${budget} − ${count} × ${price} + ${fee}`,budget-count*price+fee]],
        `Multiply quantity by unit price, add delivery once, then subtract the full cost from the budget.`); break;
    }
    case 35: {
      model(`A lift starts at floor −${a}, rises ${n} floors, then descends ${b}. Which model finds the final floor?`,[`−${a} + ${n} − ${b}`,-a+n-b],[[`${a} + ${n} + ${b}`,a+n+b],[`−${a} − ${n} − ${b}`,-a-n-b],[`${n} − ${b}`,n-b]],
        `Use the signed starting position, add the rise and subtract the descent. Distance travelled would be ${n+b}, a different quantity.`); break;
    }
    case 36: {
      const students=n*20,pct=pick([35,45,65,75]),price=b+.5;
      model(`${pct}% of ${students} students buy a ticket costing $${price.toFixed(2)}. Which model gives ticket revenue?`,[`${students} × ${pct/100} × ${price}`,students*pct/100*price],[[`${students} × ${pct} × ${price}`,students*pct*price],[`${students} × ${pct/100} + ${price}`,students*pct/100+price],[`${students} × ${1-pct/100} × ${price}`,students*(1-pct/100)*price]],
        `Convert the attendance percentage to a decimal to find the number buying tickets, then multiply by the ticket price.`); break;
    }
  }

  if (role === 'apply_create') switch (key) {
    case 1: numeric(`A square display has ${n} rows of ${n} crystals. It is enlarged to ${n+2} rows of ${n+2}. How many extra crystals are needed?`,(n+2)**2-n*n,[4,2*n,4*n],`Subtract areas, not side lengths: (${n}+2)² − ${n}² = ${(n+2)**2} − ${n*n} = ${4*n+4}.`); break;
    case 2: numeric(`A square floor has area ${n*n} m². One side length is extended by ${a} m to make a rectangle; its width stays unchanged. What is the rectangle's area in m²?`,n*(n+a),[n*n+a,(n+a)**2,n+a],`The square's side is √${n*n} = ${n} m. The rectangle measures ${n+a} m by ${n} m, so area = ${n*(n+a)} m².`); break;
    case 3: numeric(`A square garden has area ${n*n} m². What is its perimeter in metres?`,4*n,[n,n*n,2*n],`Each side is √${n*n} = ${n} m. Four sides give ${4*n} m.`); break;
    case 4: { const p=int(2,5),q=pick([1,3]),value=2**p*3**q,boxes=(p%2?2:1)*3; numeric(`Tiles come in boxes of ${value}. A designer wants one solid square made from full boxes only. What is the smallest number of boxes needed?`,boxes,[2,boxes*2,boxes+1],`${value} = ${power(2,p)} × ${power(3,q)}. A perfect square needs every exponent even, so multiply by ${p%2?'2 × 3':'3'} = ${boxes}: ${value*boxes} = ${Math.sqrt(value*boxes)}².`); break; }
    case 5: { const base=pick([2,3]),e=int(3,4); numeric(`Each branch splits into ${base} branches. After ${e} splits, how many endpoints are there?`,base**e,[base*e,base+e,base**(e-1)],`Multiply by ${base} at each split: ${power(base,e)} = ${base**e}.`); break; }
    case 6: { const x=2*a,y=3*a,lcm=6*a; numeric(`Two lights flash every ${x} and ${y} seconds. They flash together now. How many seconds until they next flash together?`,lcm,[a,x+y,x*y],`Find the lowest common multiple of ${x} and ${y}: ${lcm} seconds.`); break; }
    case 7: { const e=int(3,5),packs=a*10**e,used=b*10**(e-1); numeric(`A warehouse holds ${a} × ${power(10,e)} items and sends out ${b} × ${power(10,e-1)} items. How many remain?`,packs-used,[packs+used,(a-b)*10**e,packs-b*(e-1)],`Evaluate each power before subtracting: ${packs} − ${used} = ${packs-used}.`); break; }
    case 8: { const total=a*10000+b*100+c*10,extra=n*1000; numeric(`A counter records ${a} × 10⁴ + ${b} × 10² + ${c} × 10 items. Another ${extra} items arrive. What is the new total?`,total+extra,[total-extra,total+n,total+extra*10],`Expanded count = ${total}. Add ${extra} to get ${total+extra}; regroup place values where needed.`); break; }
    case 9: { const total=a*10000+b*1000+c*10,known=a*10000+c*10; numeric(`A record says ${total} = ${a} × 10⁴ + □ × 10³ + ${c} × 10. What digit belongs in the box?`,b,[b*10,b*1000,b+1],`Subtract known contributions ${known} from ${total}, leaving ${b*1000}. That is ${b} thousands, so the digit is ${b}.`); break; }
    case 10: { const den=pick([8,12,16]),used=den/4,total=n*den; numeric(`A tank holds ${total} L. ${used}/${den} of its capacity is used. How many litres remain?`,total*3/4,[total/4,total-used,total*used],`${used}/${den} simplifies to 1/4. One quarter of ${total} L is ${total} ÷ 4 = ${total/4} L used, so ${total} − ${total/4} = ${total*3/4} L remain.`); break; }
    case 11: { const q=pick([1,3]),length=n+a+.75,cut=a+q/4; numeric(`A rope is ${length} m long. A piece of ${a} ${q}/4 m is cut off. How many metres remain?`,length-cut,[length+cut,length-a,length-a-q/10],`Convert ${a} ${q}/4 to ${fmt(cut)} m, then subtract from ${length} m to get ${fmt(length-cut)} m.`); break; }
    case 12: { const percent=pick([15,35,45,60,65,85]),whole=pick([20,40,60,80]),part=whole*percent/100; numeric(`${part} of a club's ${whole} members attend. What percentage attend?`,percent,[part,100-percent,whole-part],`Attendance as a fraction is ${part}/${whole} = ${frac(part,whole)}. Scale to hundredths: ${percent}/100 = ${percent}%.`); break; }
    case 13: { const d=pick([2,4,5]),u=d+a+(a%d===0?1:0);numberLine(u,d,1);numeric(`Start at P. Move 1/${d} to the right. What decimal do you reach?`,(u+1)/d,[(u-1)/d,u/d,(u+d)/d],`P is ${fmt(u/d)}. Move one space right: ${fmt(u/d)} + ${fmt(1/d)} = ${fmt((u+1)/d)}.`); break; }
    case 14: { const d=pick([2,4,5]),u=-(d+a+(a%d===0?1:0)),direction=seed%2===0?1:-1;numberLine(u,d,direction);numeric(`Move 1/${d} ${direction>0?'right':'left'} from P. Give the new decimal.`,(u+direction)/d,[(u-direction)/d,u/d,-(u+direction)/d],`P is ${fmt(u/d)}. Moving ${direction>0?'right adds':'left subtracts'} ${fmt(1/d)}. You reach ${fmt((u+direction)/d)}.`); break; }
    case 15: { const q=pick([1,3]),low=-(Math.floor(a/2)+q/4),high=b/2; numeric(`At dawn it is −${mixed(-low*4,4)} °C. At noon it is ${high} °C. By how many degrees has the temperature risen?`,high-low,[high+low,high,Math.abs(low)],`Use comparable decimals: dawn ${fmt(low)} °C. Rise = ${high} − (${fmt(low)}) = ${fmt(high-low)} °C.`); break; }
    case 16: { const unit=(n*1000+345)/1000,count=b; const exactCents=Math.round((n*1000+345)*count/10); numeric(`Fabric: ${count} m at $${unit.toFixed(3)} per metre. Find the total cost, rounded to cents.`,exactCents/100,[Math.round(unit*100)/100*count,Math.floor(unit*count*100)/100,exactCents/100+.1,exactCents/100+1],`Multiply before rounding: ${count} × ${unit.toFixed(3)} = ${(unit*count).toFixed(3)}. Round that total once to $${(exactCents/100).toFixed(2)}.`); break; }
    case 17: { const need=n+.4,price=a*5; paintContext={need,capacity:3,price}; numeric(`What is the cheapest total cost in dollars?`,Math.ceil(need/3)*price,[Math.floor(need/3)*price,need/3*price,Math.ceil(need)*price],`At least ${Math.ceil(need/3)} whole tins are needed. Multiply by $${price}: $${Math.ceil(need/3)*price}.`); break; }
    case 18: { const price=n*10-.2,qty=b+1,delivery=c*10; numeric(`Estimate the cost of ${qty} items at $${price.toFixed(2)} each plus $${delivery} delivery. Round the item price to the nearest ten before calculating. What is the estimate in dollars?`,qty*n*10+delivery,[qty*(n*10+delivery),qty*n+delivery,qty*n*10-delivery],`Use $${n*10} per item: ${qty} × ${n*10} + ${delivery} = $${qty*n*10+delivery}. Add delivery once.`); break; }
    case 19: { const d=pick([3,4,6]),e=d+1,sub=seed%2===0,u=sub?d-1:1,v=1,top=sub?u*e-v*d:u*e+v*d;
      choice(`A jug holds ${u}/${d} L. ${sub?'Use':'Add'} ${v}/${e} L. How many litres ${sub?'remain':'are there now'}? Give a fraction.`,frac(top,d*e),[frac(top+1,d*e),frac(top-1,d*e),frac(top+d,d*e)],
        `Match denominators: ${u}/${d} = ${u*e}/${d*e}; ${v}/${e} = ${v*d}/${d*e}. ${sub?'Subtract':'Add'} the numerators: ${frac(top,d*e)} L.`); break; }
    case 20: { const total=n*12; numeric(`A tank holds ${total} L. First 3/4 of the water is set aside. Then 2/3 of that amount is used. How many litres are used?`,total*.75*2/3,[total*(.75+2/3),total*.75,total*2/3],`A fraction of a fraction means multiply: ${total} × 3/4 × 2/3 = ${total}/2 = ${total/2} L.`); break; }
    case 21: { const halves=n%2?n:n+1,stock=halves/2,portion=3/4; numeric(`You have ${halves}/2 L of juice. Each bottle holds 3/4 L. What is the greatest number of completely full bottles you can fill?`,Math.floor(stock/portion),[Math.ceil(stock/portion),stock*portion,stock/portion+1,Math.floor(stock/portion)+2],`Divide by the bottle capacity: ${halves}/2 ÷ 3/4 = ${frac(2*halves,3)}. Only whole complete bottles count, so round down to ${Math.floor(2*halves/3)}.`); break; }
    case 22: { const cash=n*5,one=a+.75,two=b+.85,three=c+.65; numeric(`You pay with $${cash} for items costing $${one.toFixed(2)}, $${two.toFixed(2)} and $${three.toFixed(2)}. What is your change in dollars?`,cash-one-two-three,[cash-one-two+three,cash+one+two+three,one+two+three],`Total = $${(one+two+three).toFixed(2)}. Change = $${cash} − $${(one+two+three).toFixed(2)} = $${(cash-one-two-three).toFixed(2)}.`,true); break; }
    case 23: { const stock=n*1.2,reserve=.6,size=.3; numeric(`There are ${fmt(stock)} kg of seed. Reserve 0.6 kg, then divide the rest into 0.3 kg bags. How many bags can be filled?`,(stock-reserve)/size,[stock/size,(stock+reserve)/size,(stock-reserve)*size],`Available seed = ${fmt(stock-reserve)} kg. Scale the division by 10: ${fmt((stock-reserve)*10)} ÷ 3 = ${4*n-2} bags.`); break; }
    case 24: { const total=n*16; numeric(`A grant is $${total}. Equipment uses 37.5% and transport uses 12.5% of the original grant. How many dollars remain?`,total/2,[total*.375,total*.125,total*(1-.375)*(1-.125)],`37.5% = 3/8 and 12.5% = 1/8. Together 4/8 is spent, leaving half: $${total/2}. Both percentages refer to the original grant.`); break; }
    case 25: { const values=[-n-20,-a,0,b]; numeric(`Four sites have elevations ${values.join(', ')} m. How many metres higher is the highest site than the lowest?`,b+n+20,[b-n-20,n+20,b+a],`The lowest is ${-n-20} m and highest is ${b} m. Count up from ${-n-20} to 0 (${n+20} m), then from 0 to ${b} (${b} m): ${b+n+20} m.`); break; }
    case 26: { const start=-n,up=a+10,down=b+3; numeric(`A diver starts at ${start} m relative to sea level, rises ${up} m, then descends ${down} m. What is the final signed position in metres?`,start+up-down,[start-up-down,-start+up-down,start+up+down],`Model the changes: ${start} + ${up} + (${-down}) = ${start+up-down} m. Up is positive and down is negative.`); break; }
    case 27: { const start=-n,charge=a,refund=a===b+2?b+3:b+2; numeric(`An account balance is −$${-start}. A charge of $${charge} is made, then a mistaken debit of $${refund} is reversed. What is the final signed balance in dollars?`,start-charge+refund,[start-charge-refund,start+charge+refund,-start-charge+refund],`The charge subtracts ${charge}. Reversing a debit subtracts a negative: ${start} − ${charge} − (${-refund}) = ${start-charge+refund}.`); break; }
    case 28: { const blue=2*n,gold=3*n,extra=pick([1,3])*n,total=blue+gold+extra; numeric(`A bag has ${blue} blue and ${gold} gold crystals. Add ${extra} blue crystals. What fraction of the new total is blue? Give a decimal.`,(blue+extra)/total,[2/5,3/5,(blue+extra)/gold],`Blue becomes ${blue+extra}; the new total is ${total}. The fraction is ${frac(blue+extra,total)} = ${fmt((blue+extra)/total)}. Adding changes the original 2:3 ratio.`); break; }
    case 29: { const A=ra,B=rb,first=A*n,total=(A+B)*n; numeric(`Mia and Leo share money in the ratio ${A}:${B}. Mia receives $${first}. How many dollars do they share altogether?`,total,[B*n,first+B,first*B],`One part is $${first} ÷ ${A} = $${n}. Altogether there are ${A+B} parts: ${A+B} × $${n} = $${total}.`); break; }
    case 30: { const concentrate=n*100,water=4*concentrate,extra=concentrate; numeric(`A drink contains ${concentrate} mL concentrate and ${water} mL water. Add ${extra} mL concentrate. How much extra water is needed to restore a 1:4 concentrate-to-water ratio?`,4*extra,[extra,water+4*extra,4*extra-concentrate],`New concentrate is ${2*concentrate} mL, requiring ${8*concentrate} mL water. There is already ${4*concentrate} mL, so add ${4*extra} mL.`); break; }
    case 31: { const price=n*20,fee=Math.min(a,4),other=price*.8; numeric(`Store A sells a $${price} bag at 25% off plus $${fee} delivery. Store B charges $${other} with free delivery. How many dollars cheaper is Store A?`,other-(price*.75+fee),[price*.25,other-price*.75,price*.75+fee],`A costs $${price*.75+fee}; B costs $${other}. Compare final costs: ${other} − ${price*.75+fee} = $${fmt(other-price*.75-fee)}.`,true); break; }
    case 32: { const cost=n*20,fee=n*5,revenue=n*pick([28,30,35]),profit=revenue-cost-fee,percent=profit/(cost+fee)*100; numeric(`A fundraiser spends $${cost} on supplies and $${fee} on a venue. It earns $${revenue}. What is its profit as a percentage of total cost?`,percent,[profit/cost*100,profit/revenue*100,revenue/(cost+fee)*100],`Total cost = $${n*25}. Profit = $${profit}. Profit percentage = (${profit} ÷ ${n*25}) × 100 = ${percent}%. Include both costs.`); break; }
    case 33: { const size=a,price=a*(b+.5); numeric(`${size} notebooks cost $${price.toFixed(2)}. What is the cost of one notebook in dollars?`,b+.5,[price*size,price-size,b+.05],`Divide the pack price by ${size}: $${price.toFixed(2)} ÷ ${size} = $${(b+.5).toFixed(2)}.`,true); break; }
    case 34: { const budget=n*20,count=a+3,price=b+2.5; numeric(`You have $${budget}. You buy ${count} kits at $${price.toFixed(2)} each. How many dollars remain?`,budget-count*price,[budget-price,budget+count*price,count*price],`Kits cost ${count} × $${price.toFixed(2)}. Subtract this cost from $${budget}.`,true); break; }
    case 35: { const start=-a,rise=n,finish=-b; numeric(`A lift starts at floor ${start}, rises ${rise} floors, then descends to floor ${finish}. How many floors does it descend?`,start+rise-finish,[rise+finish,start+rise+finish,rise-start-finish],`After rising, the lift is at floor ${start+rise}. The descent from there to ${finish} is ${start+rise} − (${finish}) = ${start+rise-finish} floors.`); break; }
    case 36: { const students=n*20,percent=60,ticket=b+.5,cost=n*5; numeric(`${percent}% of ${students} students attend an event and pay $${ticket.toFixed(2)} each. Total event costs are $${cost}. What is the profit in dollars?`,students*.6*ticket-cost,[students*ticket-cost,students*.6*ticket,students*.4*ticket-cost],`Attendance = ${students} × 0.6 = ${students*.6}. Revenue = ${students*.6} × $${ticket.toFixed(2)} = $${students*.6*ticket}. Subtract costs of $${cost} to get $${students*.6*ticket-cost}.`,true); break; }
  }
  // Second application forms: half of the application questions ask a structurally different
  // question about the same skill, so a quiz's two application questions are not twins.
  // Week 6 Lessons 1–2 keep their number-line form (see level7-readability-test).
  // The form is chosen from a hash of the seed: this generator's low random bits alternate.
  if (role === 'apply_create' && key !== 13 && key !== 14 && ((Math.imul(seed >>> 0, 2654435761) >>> 15) & 1) === 1) {
    const prev = { task, visual, paintContext, diagramSpeech };
    task = undefined; visual = undefined; diagramSpeech = undefined;
    const pair = pick([[2,3],[3,4],[2,5],[3,5],[4,5],[5,6]]), [A2, B2] = pair[0] > pair[1] ? pair : [pair[1], pair[0]];
    switch (key) {
      case 1: numeric(`A square patio uses ${n*n} square tiles. How many tiles are along one edge?`, n, [n*n/2, n*n/4, n+1], `The patio is n by n tiles with n × n = ${n*n}, so n = √${n*n} = ${n}.`); break;
      case 2: numeric(`Two square rooms have areas ${n*n} m² and ${(n+a)*(n+a)} m². How much longer is a side of the larger room, in metres?`, a, [(n+a)*(n+a)-n*n, 2*a, n+a], `Sides are √${n*n} = ${n} m and √${(n+a)*(n+a)} = ${n+a} m; the difference is ${a} m.`); break;
      case 3: numeric(`A square field has a perimeter of ${4*n} m. What is its area in m²?`, n*n, [4*n, 2*n*n, n*4*n], `Each side is ${4*n} ÷ 4 = ${n} m, so the area is ${n} × ${n} = ${n*n} m².`); break;
      case 4: { const [p1, p2] = pick([[2,7],[3,5],[3,7],[2,11],[5,7],[3,11]]); numeric(`A rectangle has an area of ${p1*p2} cm². Both side lengths are prime numbers of centimetres. What is its perimeter in cm?`, 2*(p1+p2), [p1+p2, p1*p2, 2*p1*p2], `${p1*p2} = ${p1} × ${p2}, both prime. Perimeter = 2 × (${p1} + ${p2}) = ${2*(p1+p2)} cm.`); break; }
      case 5: { const k = c + 3; numeric(`A bacteria count doubles every hour, starting from 1. After how many hours will there be ${2**k} bacteria?`, k, [2**k/2, k+1, 2*k], `${2**k} = 2${'⁰¹²³⁴⁵⁶⁷⁸⁹'[k]}, so it takes ${k} doublings.`); break; }
      case 6: numeric(`${pair[0]*n} red beads and ${pair[1]*n} blue beads are shared into identical bags with none left over. What is the greatest number of bags?`, n, [pair[0]*pair[1]*n, pair[0]+pair[1], n*2], `The greatest number of bags is the highest common factor of ${pair[0]*n} and ${pair[1]*n}, which is ${n}.`); break;
      case 7: { const e1 = int(3,4), e2 = e1 + int(1,3); numeric(`A stadium holds ${a} × ${power(10,e1)} people. How many stadiums of that size would hold ${a} × ${power(10,e2)} people?`, 10**(e2-e1), [e2-e1, 10*(e2-e1), a*(e2-e1)], `Divide: ${power(10,e2)} ÷ ${power(10,e1)} = ${power(10,e2-e1)} = ${10**(e2-e1)}.`); break; }
      case 8: numeric(`A number has ${a} ten-thousands, ${b} hundreds and ${c} ones. What is the number?`, a*10000+b*100+c, [a*1000+b*100+c, a*10000+b*10+c, a*10000+b*1000+c], `${a} × 10 000 + ${b} × 100 + ${c} = ${a*10000+b*100+c}. Empty places need zeros.`); break;
      case 9: { const value = a*10000+b*1000+c*10; numeric(`In ${value}, what is the value of the digit in the thousands place?`, b*1000, [b, b*100, b*10000], `The thousands digit is ${b}, so its value is ${b} × 1000 = ${b*1000}.`); break; }
      case 10: numeric(`${pair[0]} of every ${pair[0]+pair[1]} students walk to school. There are ${(pair[0]+pair[1])*n} students. How many walk?`, pair[0]*n, [pair[1]*n, (pair[0]+pair[1])*n/pair[0], pair[0]+n], `${pair[0]}/${pair[0]+pair[1]} of ${(pair[0]+pair[1])*n} = ${(pair[0]+pair[1])*n} ÷ ${pair[0]+pair[1]} × ${pair[0]} = ${pair[0]*n}.`); break;
      case 11: { const qtr = int(1,3); numeric(`Three ribbons are ${a} ${qtr}/4 m, ${b}.5 m and 3/4 m long. What is their total length in metres?`, a+qtr/4+b+.5+.75, [a+b+qtr/4, a+b+.5+.75, a+qtr+b+.5+.75], `Convert to decimals: ${fmt(a+qtr/4)} + ${b}.5 + 0.75 = ${fmt(a+qtr/4+b+1.25)} m.`); break; }
      case 12: { const pct = pick([10,20,25,50]), price = n*20; numeric(`A $${price} jacket is reduced by ${pct}%. What is the sale price in dollars?`, price*(100-pct)/100, [price*pct/100, price-pct, price*(100+pct)/100], `${pct}% of $${price} is $${price*pct/100}; $${price} − $${price*pct/100} = $${price*(100-pct)/100}.`, true); break; }
      case 15: numeric(`Which is colder, −${a} 3/4 °C or −${a}.7 °C? Type the colder temperature as a decimal.`, -(a+.75), [-(a+.7), a+.75, -(a+.5)], `−${a} 3/4 = −${fmt(a+.75)}, which is further below zero than −${a}.7, so it is colder.`); break;
      case 16: { const people = b+1, bill = n*7+.45; numeric(`${people} friends share a $${bill.toFixed(2)} bill equally. How much each, to the nearest cent?`, Math.round(bill/people*100)/100, [Math.floor(bill/people*100)/100+.01, bill/people*10, bill-people], `$${bill.toFixed(2)} ÷ ${people} = ${(bill/people).toFixed(4)}… which rounds to $${(Math.round(bill/people*100)/100).toFixed(2)}.`, true); break; }
      case 17: { const need=n+.4, capacity=3, price=a*5, tins=Math.ceil(need/capacity), budget=tins*price+b*5; paintContext={need,capacity,price}; numeric(`You have $${budget}. How much is left after buying?`, budget-tins*price, [budget-Math.floor(need/capacity)*price, budget-need*price, tins*price], `${tins} tins are needed and cost ${tins} × $${price} = $${tins*price}. $${budget} − $${tins*price} = $${budget-tins*price}.`); break; }
      case 18: numeric(`Estimate ${a}9.7 × ${b}.2 by rounding each number to the nearest whole number.`, (a*10+10)*b, [a*10*b, (a*10+9)*b, (a*10+10)*(b+1)], `${a}9.7 rounds to ${a*10+10} and ${b}.2 rounds to ${b}: ${a*10+10} × ${b} = ${(a*10+10)*b}.`); break;
      case 19: { const d = pick([3,4,5]), e = d+1; choice(`One jug holds 1/${d} L of water and another holds 1/${e} L. Both are poured into a third jug. How many litres are in it? Give a fraction.`, frac(d+e, d*e), [frac(2, d+e), frac(d+e+1, d*e), frac(1, d*e)], `Use a common denominator of ${d*e}: ${e}/${d*e} + ${d}/${d*e} = ${frac(d+e, d*e)}.`); break; }
      case 20: numeric(`A class has ${n*12} students. 2/3 of them play sport, and 1/4 of those play netball. How many students play netball?`, n*2, [n*8, n*3, n*12*(2/3+1/4)], `2/3 of ${n*12} is ${n*8}; 1/4 of ${n*8} is ${n*2}. Multiply: ${n*12} × 2/3 × 1/4 = ${n*2}.`); break;
      case 21: numeric(`A ribbon ${n} m long is cut into pieces 2/3 m long. How many complete pieces can be cut?`, Math.floor(n*3/2), [Math.ceil(n*3/2) === Math.floor(n*3/2) ? n*3/2+1 : Math.ceil(n*3/2), n*2/3, n*3], `${n} ÷ 2/3 = ${n} × 3/2 = ${fmt(n*1.5)}, so ${Math.floor(n*1.5)} complete pieces.`); break;
      case 22: numeric(`You buy ${b} items at $${a}.95 each. What is the total cost in dollars?`, b*(a+.95), [b*a+.95, b*(a+1), b*(a+.9)], `${b} × $${a}.95 = $${(b*(a+.95)).toFixed(2)}. Check: ${b} × $${a+1} − ${b} × $0.05.`, true); break;
      case 23: numeric(`A ${n}.5 m pipe is cut into 0.5 m lengths. How many lengths are there?`, (n+.5)/.5, [(n+.5)*.5, n*2, n+.5], `${n}.5 ÷ 0.5 = ${(n+.5)/.5}: there are two halves in every metre.`); break;
      case 24: numeric(`A $${n*40} bike is discounted by 20%, then a further 10% off the new price. What is the final price in dollars?`, n*40*.8*.9, [n*40*.7, n*40*.8, n*40-30], `After 20% off: $${n*32}. Then 10% off that: $${n*32} − $${fmt(n*3.2)} = $${fmt(n*28.8)}. Not the same as 30% off.`, true); break;
      case 25: numeric(`The temperature was ${-a} °C at 6 am and ${b+5} °C at 2 pm. By how many degrees did it rise?`, b+5+a, [b+5-a, a, b+5], `Count up from ${-a} to 0 (${a} degrees), then from 0 to ${b+5}: ${a} + ${b+5} = ${a+b+5}.`); break;
      case 26: numeric(`Mia's bank balance is −$${n}. How much must she deposit to have $${b*10}?`, n+b*10, [b*10-n, n, b*10], `From −$${n} to $0 needs $${n}; then $${b*10} more: $${n+b*10}.`); break;
      case 27: numeric(`Five daily temperature changes are +${a}, −${b}, −${c}, +${b} and −${a+1} °C. What is the overall change in °C?`, -c-1, [c+1, -c, a-c], `+${a} and −${a+1} make −1; −${b} and +${b} cancel; with −${c} the total is ${-c-1}.`); break;
      case 28: numeric(`In a class, the ratio of boys to girls is ${pair[0]}:${pair[1]}. There are ${(pair[0]+pair[1])*n} students. How many are girls?`, pair[1]*n, [pair[0]*n, (pair[0]+pair[1])*n/pair[1], pair[1]+n], `${pair[0]+pair[1]} parts share ${(pair[0]+pair[1])*n} students, so one part is ${n}. Girls are ${pair[1]} parts: ${pair[1]*n}.`); break;
      case 29: numeric(`Mia and Leo share $${(A2+B2)*n} in the ratio ${A2}:${B2}. How much more does Mia get than Leo, in dollars?`, (A2-B2)*n, [A2*n, (A2+B2)*n/2, A2-B2], `One part is $${(A2+B2)*n} ÷ ${A2+B2} = $${n}. Mia gets ${A2-B2} more part${A2-B2===1?'':'s'}: $${(A2-B2)*n}.`); break;
      case 30: { const scale = pick([50000,100000,200000]); numeric(`A map has a scale of 1:${scale}. Two towns are ${b+1} cm apart on the map. How many kilometres apart are they?`, (b+1)*scale/100000, [(b+1)*scale/1000, (b+1)*scale, (b+1)*scale/10000], `${b+1} cm × ${scale} = ${(b+1)*scale} cm = ${(b+1)*scale/100} m = ${(b+1)*scale/100000} km.`); break; }
      case 31: numeric(`A $${n*20} game is 15% off. How many dollars do you save?`, n*3, [n*20-n*3, n*15, n*2], `15% of $${n*20} = 0.15 × ${n*20} = $${n*3}.`, true); break;
      case 32: { const pct = pick([10,20,25,40,50]), cost = n*20; numeric(`A shop buys a toy for $${cost} and sells it for $${cost*(100+pct)/100}. What is the profit as a percentage of the cost?`, pct, [cost*pct/100, pct/2, Math.round(pct/(100+pct)*100)], `Profit = $${cost*pct/100}. As a percentage of the cost: ${cost*pct/100} ÷ ${cost} × 100 = ${pct}%.`); break; }
      case 33: { const price = a*(b+.5); numeric(`A ${a*100} g bag of rice costs $${price.toFixed(2)}. What is the price per 100 g, in dollars?`, b+.5, [price*a, price/10, b+.05], `There are ${a} lots of 100 g: $${price.toFixed(2)} ÷ ${a} = $${(b+.5).toFixed(2)}.`, true); break; }
    }
    if (!task) ({ task, visual, paintContext, diagramSpeech } = prev);
  }
  if (!task) throw Error(`Missing Level 7 challenge ${key}/${role}`);
  for (let i=task.options.length-1;i>0;i--) { const j=int(0,i); [task.options[i],task.options[j]]=[task.options[j],task.options[i]]; }
  return {
    ...task, visual, paintContext, diagramSpeech, readabilityRevision: NUMBER7_READABILITY_REVISION, kind: 'multiple_choice' as const, skill: guide.code, seed,
    lessonId: `y7-w${week}-l${lesson}`, version: 2 as const, tier: role,
    helper: 'Choose one answer.',
  } satisfies MultipleChoiceQuestion & {skill:string;seed:number;lessonId:string;version:2;tier:string;diagramSpeech?:string};
}
