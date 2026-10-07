import type {Level8Realm} from '@/lib/level8-config';

export type Level8Code = `AC9M8N0${1|2|3|4|5}` | `AC9M8M0${1|2|3|4|5|6|7}` | `AC9M8A0${1|2|3|4}` | `AC9M8SP0${1|2|3|4}` | `AC9M8ST0${1|2|3|4}` | `AC9M8P0${1|2|3}`;
export type Level8LessonPlan = {title:string;codes:Level8Code[]};
export type Level8WeekPlan = {week:number;title:string;lessons:Level8LessonPlan[];visual:string;assessment:'quiz'|'posttest'};
// Authoring map, not runnable lesson questions. Codes identify intended teaching coverage.
// Source: owner-supplied mathematics-curriculum-content-7-10-v9.pdf, pp.17–27.
function week(title:string,code:string,titles:[string,string,string],visual:string){
 return {title,lessons:titles.map(title=>({title,codes:code.split(',').map(c=>`AC9M8${c}` as Level8Code)})),visual};
}
const plans = {
 number:[
  week('Numbers beyond fractions','N01',['Recognise rational and irrational numbers','Locate square roots on a number line','Understand pi as an irrational number'],'Square areas, number lines and labelled circles'),
  week('Patterns in powers','N02',['Multiply powers with the same base','Divide powers with the same base','Explain the zero exponent'],'Expanded-factor strips with matching bases'),
  week('Apply exponent laws','N02',['Raise a power to a power','Combine exponent laws','Check bases and brackets'],'Linked expanded and exponent forms; cube scaling'),
  week('Decimals that stop or repeat','N03',['Recognise terminating decimals','Read and write recurring decimals','Predict terminating decimals from fractions'],'Long-division cycles and prime-factor cards'),
  week('Calculate with integers','N04',['Add and subtract signed numbers','Multiply and divide signed numbers','Use brackets and order of operations'],'Number lines, temperature scales and signed counters'),
  week('Calculate with fractions','N04',['Add and subtract rational numbers','Multiply and divide fractions','Choose efficient fraction strategies'],'Fraction strips and area models; signed number lines'),
  week('Calculate with decimals','N04',['Add and subtract signed decimals','Multiply and divide decimal numbers','Choose fractions or decimals to calculate'],'Place-value charts and measured quantities'),
  week('Choose and check a strategy','N04',['Regroup to simplify a calculation','Estimate and check rational-number answers','Solve a mixed-operation problem'],'Calculation routes and estimation number lines'),
  week('Percentage change','N05',['Calculate percentage increases','Calculate percentage decreases','Compare changes using the original amount'],'Percentage bars and before-and-after quantities'),
  week('Percentages in context','N05',['Model mark-ups and discounts','Calculate tax-inclusive and tax-exclusive prices','Explain successive percentage changes'],'Price tags and multiplier diagrams; supplied rates'),
  week('Build a financial model','N05,M05,M07',['Model pay and a simple budget','Use a supplied income-tax table','Compare financial choices and assumptions'],'Editable budget and fictional tax/rate tables'),
  week('Apply and review Number skills','N01,N02,N03,N04,N05',['Choose exact values or useful approximations','Solve a rational-number modelling problem','Check and explain a percentage model'],'Choice of number line, percentage bar or calculation table'),
 ],
 measurement:[
  week('Composite perimeter and area','M01',['Find missing boundary lengths','Find the perimeter of a composite shape','Split a shape to calculate its area'],'Dimensioned L-shapes with controllable decomposition'),
  week('Irregular areas and practical plans','M01',['Estimate area using a grid','Improve an irregular-area estimate','Choose perimeter or area for a practical task'],'Fine/coarse grids over recognisable plots'),
  week('Volume and capacity','M02',['Connect cubic units with litres','Calculate the volume of a right prism','Find capacity and compare containers'],'Prism cross-sections, cubic units and labelled containers'),
  week('Use volume in practical problems','M02',['Find a missing prism dimension','Work out how many boxes fit','Model filling a tank'],'Packing models and a tank with supplied flow data'),
  week('Circle circumference and area','M03',['Connect radius and diameter','Calculate circumference','Calculate the area of a circle'],'Labelled circles and sector rearrangement'),
  week('Apply circle formulas','M03',['Find a radius from area or circumference','Measure semicircles and rings','Choose a formula for a circular design'],'Semicircle boundary and annulus diagrams'),
  week('Pythagoras: find the longest side','M06',['Identify the hypotenuse','Explain the squares on a right triangle','Calculate the hypotenuse'],'Squares built on precisely drawn right triangles'),
  week('Pythagoras in practical problems','M06',['Find a shorter side','Calculate a ladder length or diagonal','Recognise and check Pythagorean triples'],'Ladders, diagonals and right-angle marks'),
  week('Time zones and duration','M04',['Convert times using supplied UTC offsets','Calculate travel time across zones','Plan a meeting across dates and time zones'],'Timeline, date cards and explicit whole/half-hour offsets'),
  week('Compare quantities using rates','M05',['Read a rate and its units','Calculate speed, distance and time','Compare flow and consumption rates'],'Distance-time tables, taps and fuel gauges'),
  week('Ratios, scales and models','M07',['Use a map scale','Scale a mixture or material plan','Build and check a ratio or rate model'],'Scale maps, mixture vessels and editable assumptions'),
  week('Apply and review Measurement skills','M01,M02,M03,M04,M05,M06,M07',['Plan a shape or container design','Combine duration and rate calculations','Review a practical measurement model'],'Design plans with dimensions, units and a model checklist'),
 ],
 space:[
  week('Same shape and size','SP01',['Match corresponding sides and angles','Recognise congruent shapes after a movement','Test congruence by overlaying shapes'],'Draggable overlays, rotations and reflections'),
  week('When triangles must match','SP01',['Use three sides to test congruence','Use sides and an included angle','Use angles or a right triangle to test congruence'],'Marked triangles; include counterexamples to insufficient information'),
  week('Similar shapes and scale factors','SP01',['Recognise similar shapes','Calculate a scale factor','Find missing corresponding lengths'],'Paired shapes with correspondence highlights'),
  week('Explain similarity and transformations','SP01',['Use triangle angles to test similarity','Compare congruence and similarity','Check what a transformation preserves'],'Resizable triangles and transformation controls'),
  week('Quadrilateral properties','SP02',['Compare sides and angles','Compare diagonals and symmetry','Classify quadrilaterals using their properties'],'Quadrilateral family and diagonal overlays'),
  week('Reason with quadrilaterals','SP02',['Use congruent triangles to explain properties','Find unknown angles and lengths','Test a quadrilateral claim with a counterexample'],'Split quadrilaterals, angle marks and adjustable examples'),
  week('Locate points in three dimensions','SP03',['Read three coordinates in order','Place a point in a 3D grid','Rotate a view without changing position'],'Rotatable labelled 3D grid with projection lines'),
  week('Move and describe objects in 3D','SP03',['Follow a route through a 3D grid','Locate vertices and vertical columns','Describe a practical 3D position'],'Cuboid vertices, floor levels and drone coordinates'),
  week('Build a shape-sorting algorithm','SP04',['Trace a congruence or similarity flowchart','Find and repair a faulty decision','Create and test a sorting algorithm'],'Editable decision nodes and test-case shapes'),
  week('Apply and review Space skills','SP01,SP02,SP03,SP04',['Explain a shape comparison','Solve a quadrilateral or 3D-location task','Test and improve a shape algorithm'],'Mixed diagram tasks plus student-created decision flow'),
 ],
 pattern:[
  week('Build and simplify expressions','A01',['Write an expression from a situation','Collect like terms with integer coefficients','Use algebraic properties to rearrange terms'],'Algebra tiles and matching expression cards'),
  week('Expand linear expressions','A01',['Expand a single bracket','Expand with negative coefficients','Expand and collect like terms'],'Signed algebra tiles and area models'),
  week('Factorise linear expressions','A01',['Find a common factor in terms','Factorise a linear expression','Check that expansion reverses factorisation'],'Tile grouping and linked factored/expanded forms'),
  week('Solve linear equations','A02',['Use inverse operations on both sides','Solve equations with rational answers','Verify a solution by substitution'],'Balance models and fraction-friendly working boxes'),
  week('Equations with terms on both sides','A02',['Collect variable terms on one side','Solve equations containing brackets','Find and fix an equation-solving error'],'Balanced step-by-step equation rows'),
  week('Solve and represent inequalities','A02',['Read strict and inclusive inequalities','Solve one-variable inequalities with positive coefficients','Graph and check an inequality solution'],'Number lines with open/closed endpoints; coordinate half-planes'),
  week('From tables to linear graphs','A02',['Recognise constant first differences','Plot a linear relation from a table','Read horizontal and vertical relations'],'Linked table and Cartesian graph'),
  week('Investigate linear functions','A04',['Change the starting value of a line','Change the rate and direction of a line','Make and test a graph conjecture'],'Interactive graph sliders with recorded trials'),
  week('Connect equations, graphs and solutions','A02,A04',['Read equation solutions from a graph','Compare intersections and parallel lines','Investigate inequalities using a graph'],'Two-line graph and inequality shading controls'),
  week('Model a rate and a starting amount','A03',['Write a model with an initial value and rate','Use a model to calculate or predict','Explain when a model stops making sense'],'Taxi, tank and pay models with linked graphs'),
  week('Compare and refine linear models','A03,M05,M07',['Compare two pricing or pay models','Use a model to meet a budget or target','Review units, assumptions and practical limits'],'Two-plan comparison with explicit supplied rates'),
  week('Apply and review Algebra skills','A01,A02,A03,A04',['Choose an expression or equation strategy','Build and check a practical linear model','Test and explain a graph conjecture'],'Tiles, equation working and an interactive graph lab'),
 ],
 statistics:[
  week('How should we collect data?','ST01',['Choose a census or a sample','Choose an experiment or observation','Explain practical limits of data collection'],'Population/sample scenes and collection-method cards'),
  week('Fair samples and reliable measurements','ST01',['Select a random sample','Spot selection and response bias','Consider measurement precision and error'],'Sampling frames and measurement-device displays'),
  week('Sources and sampling methods','ST02',['Compare primary and secondary sources','Compare random and non-random samples','Choose a method and explain its limitations'],'Source cards and selectable sampling frames'),
  week('Describe a data distribution','ST02',['Display a sample clearly','Describe shape, centre and spread','Write a conclusion supported by the data'],'Dot plots, frequency displays and sortable datasets'),
  week('Why samples give different answers','ST03',['Compare samples of the same size','Compare sample proportions','Use a sample to estimate a population count'],'Repeated-sample displays with population context'),
  week('Sample size and variation','ST03',['Run repeated samples of different sizes','Compare variation as sample size changes','Explain uncertainty in an estimate'],'Interactive sampler with repeated-run records'),
  week('How changing data changes a summary','ST03',['Investigate changes to the mean','Compare changes to median and range','Choose a useful summary for a distribution'],'Editable datasets and linked summary displays'),
  week('Plan a statistical investigation','ST04',['Choose a question and target population','Plan an ethical and fair sample','Choose a collection and recording method'],'Investigation builder and privacy/fairness choices'),
  week('Conduct and report an investigation','ST04',['Collect and organise sample data','Analyse and display the results','Report findings and acknowledge uncertainty'],'Student-run sampling task with report prompts'),
  week('Apply and review Statistics skills','ST01,ST02,ST03,ST04',['Critique a data collection plan','Compare distributions and sampling variation','Improve an investigation report'],'Sample records, graphs and an evidence-based report'),
 ],
 chance:[
  week('An event and its complement','P01',['Identify the event and the not-event','Find a complement from a fraction','Find complements from decimals and percentages'],'Spinners, outcome sets and probability bars'),
  week('Use complements in context','P01',['Find a missing probability','Calculate complements with unequal outcomes','Choose a complement to simplify a problem'],'Unequal spinners and clearly labelled forecast cards'),
  week('List two-event outcomes','P02',['Write ordered pairs','List all combinations without missing any','Count outcomes that meet a condition'],'Two coins, dice or spinners with outcome grids'),
  week('Two-way tables','P02',['Complete an outcome table','Read row, column and joint totals','Calculate probabilities from a two-way table'],'Editable two-way tables with labelled totals'),
  week('Tree diagrams','P02',['Build a tree for two events','Read outcomes along branches','Use a tree to find a probability'],'Expandable two-stage trees and ordered pairs'),
  week('Venn diagrams','P02',['Place outcomes into four regions','Find both, neither and either event','Calculate probabilities from region counts'],'Editable two-set Venn diagrams'),
  week('And, or and at least','P02',['Distinguish and from inclusive or','Compare exclusive or and mutually exclusive events','Find at least one using outcomes or complements'],'Linked Venn/table views; two-dice sum and difference grids'),
  week('Run compound-event experiments','P03',['Design a fair two-event simulation','Run trials and record actual results','Calculate experimental probabilities'],'Interactive two-coin and two-dice simulators'),
  week('Compare simulation and prediction','P02,P03',['Calculate a theoretical prediction','Compare small and large trial runs','Explain variation and review a simulation model'],'Recorded trial batches and theoretical/observed charts'),
  week('Apply and review Probability skills','P01,P02,P03',['Choose a useful event representation','Solve a compound-event probability problem','Run and explain a probability investigation'],'Student choice of table, tree or Venn plus a simulator'),
 ],
} satisfies Record<Level8Realm,ReturnType<typeof week>[]>;
export const LEVEL8_CURRICULUM = Object.fromEntries(Object.entries(plans).map(([realm,weeks])=>[
 realm,weeks.map((w,i)=>({...w,week:i+1,assessment:i===weeks.length-1?'posttest':'quiz'})),
])) as Record<Level8Realm,Level8WeekPlan[]>;

export function level8ScopeCsv(realm?:Level8Realm){
 const cell=(value:string|number)=>`"${String(value).replaceAll('"','""')}"`;
 const rows:(string|number)[][]=[['Realm','Level','Week','Week focus','Lesson','Lesson focus','Curriculum codes','Planned visual or interaction','Week assessment','Status']];
 for(const [id,weeks] of Object.entries(LEVEL8_CURRICULUM)){
  if(realm&&id!==realm)continue;
  for(const w of weeks)w.lessons.forEach((l,i)=>rows.push([id,8,w.week,w.title,i+1,l.title,l.codes.join('; '),w.visual,w.assessment==='posttest'?'Post-test (85%)':'15-question quiz (80%)','Authoring plan; lessons not released']));
 }
 return '\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
