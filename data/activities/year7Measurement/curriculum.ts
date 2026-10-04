import {polygonAngleVisual} from './polygonVisual';
import type { WeekPlan } from '@/data/programs/year1';
export const MEASUREMENT7_WEEKS = [
 {title:'Area from rectangles',code:'AC9M7M01',lessons:[
 ['Derive triangle area','explain why a triangle has half the area of a matching rectangle','A triangle and its matching copy make a parallelogram. Area is half base × perpendicular height.','Use perpendicular height, not a sloping side.'],
 ['Use perpendicular height','calculate triangle area with appropriate square units','The height meets the base, or its extension, at a right angle.','Convert lengths to the same unit before multiplying.'],
 ['Build parallelogram area','explain and use the parallelogram area formula','Cutting and moving a triangular end makes a rectangle of the same base and perpendicular height.','Do not halve a parallelogram’s area.']]},
 {title:'Area in practical problems',code:'AC9M7M01',lessons:[
 ['Recover a missing height','find a triangle height from its area and base','Undo the area calculation: twice the area divided by the base gives the perpendicular height.','Double the triangle area before dividing by its base.'],
 ['Compare area models','compare triangles and parallelograms using their dimensions','Equal base and perpendicular height mean equal areas within the same shape family. Different base and height pairs can also give the same area: 8 × 6 ÷ 2 = 12 × 4 ÷ 2.','An equal-base, equal-height triangle is half a parallelogram.'],
 ['Plan materials and costs','use combined areas and unit costs to plan materials','Find each non-overlapping area, add the areas, then apply the cost per square unit.','Keep square units separate from lengths and money.']]},
 {title:'Prism volume',code:'AC9M7M02',lessons:[
 ['Count equal layers','connect rectangular prism volume to equal layers','Volume equals the area of one layer multiplied by the number of unit-thick layers.','Volume uses cubic units.'],
 ['Use a constant cross-section','calculate volume from cross-sectional area and prism length','Every cross-section parallel to a prism’s end has the same area. Multiply that area by the perpendicular length.','The cross-section area is already in square units.'],
 ['Build triangular prism volume','calculate volume using a triangular cross-section','Find the triangle area first, then multiply by the prism length.','Halve the triangular cross-section once, not twice.']]},
 {title:'Volume and capacity decisions',code:'AC9M7M02',lessons:[
 ['Find an unknown prism length','use a known volume and cross-section to recover a length','Divide volume by cross-sectional area to undo the prism formula.','Do not confuse the prism length with triangle height.'],
 ['Connect volume and capacity','convert internal prism volume to litres','One thousand cubic centimetres is one litre. Use inside dimensions for capacity.','Convert cubic centimetres to litres by dividing by 1000.'],
 ['Compare storage designs','compare rectangular and triangular prism volumes','Use the correct cross-section for each design before comparing their volumes.','Comparing just one length cannot determine which prism holds more.']]},
 {title:'Circles and pi',code:'AC9M7M03',lessons:[
 ['Connect radius and diameter','use the relationship between radius and diameter','The centre is the middle point; a radius joins the centre to the circle; a diameter runs through the centre and contains two radii; the circumference is the distance around.','A radius is half a diameter.'],
 ['Understand pi','connect pi, diameter and circumference','Circumference is the distance around a circle. Diameter is the distance across its centre. The distance around is about 3.14 times the distance across. We call this number pi (π).','Use the diameter: all the way across the circle through its centre.'],
 ['Find circumference from diameter','use circumference equals pi times diameter','Circumference is the distance around the circle. Multiply its diameter by pi.','Circumference uses length units, not square units.']]},
 {title:'Circle measurements in context',code:'AC9M7M03',lessons:[
 ['Find circumference from radius','use circumference equals twice pi times radius','Double the radius to obtain the diameter, then multiply by pi.','Do not use pi times radius as the circumference.'],
 ['Work backwards around a circle','find diameter or radius from circumference','Divide circumference by pi for diameter, and by twice pi for radius.','Identify whether the requested length is a radius or diameter.'],
 ['Model circular journeys','use circumference to model repeated turns and material needs','One full turn without slipping travels one circumference. State the approximation to pi.','Convert units and round only at the end.']]},
 {title:'Parallel lines and transversals',code:'AC9M7M04',lessons:[
 ['Recognise corresponding angles','identify and calculate corresponding angles on parallel lines','Corresponding angles occupy matching positions at the two intersections. They are equal when the lines are parallel. Look at the positions in the diagram to decide which relationship applies.','Parallel lines must be given or justified.'],
 ['Recognise alternate angles','use alternate interior angles with a valid reason','Alternate interior angles lie between parallel lines, on opposite sides of the transversal.','Use the marked relationship rather than the appearance of the drawing.'],
 ['Use co-interior angles','calculate co-interior angles on parallel lines','Co-interior angles lie inside the parallel lines on the same side of the transversal and sum to 180 degrees.','Co-interior angles are not generally equal.']]},
 {title:'Angle reasoning',code:'AC9M7M04',lessons:[
 ['Find angles with algebra','write and solve an equation from a parallel-line angle relationship','Identify the relationship in the diagram first. Equal angles give one equation; co-interior angles give an equation that sums to 180 degrees.','Check the solution by substituting it back into each angle.'],
 ['Test for parallel lines','use angle relationships to decide whether two lines are parallel','Lines are parallel when corresponding or alternate angles are equal, or when co-interior angles sum to 180 degrees.','Lines that look parallel are not parallel unless the angles prove it.'],
 ['Model parallel supports','apply angle rules to a practical parallel-line design','Parallel rails cut by a diagonal brace form the same angle relationships as a transversal diagram. Angles on a straight line sum to 180 degrees.','Changing the gap between parallel supports does not change their angle relationships.']]},
 {title:'Triangle angle sums',code:'AC9M7M05',lessons:[
 ['Derive the triangle angle sum','explain and apply the 180-degree triangle angle sum','The three interior angles of a triangle in the plane fit together to form a straight angle.','Add all known interior angles before subtracting from 180.'],
 ['Use equal sides and angles','find base angles in an isosceles triangle','Equal sides face equal angles. Subtract the apex angle from 180 and share the remainder equally.','Do not assume every triangle is isosceles.'],
 ['Connect interior and exterior angles','derive an exterior angle using the triangle angle sum','An exterior angle on a straight line equals the sum of the two non-adjacent interior angles.','The exterior angle is not one of the three interior angles.']]},
 {title:'Polygon angle sums',code:'AC9M7M05',lessons:[
 ['Split a quadrilateral','derive a quadrilateral’s 360-degree interior angle sum','One diagonal splits a simple quadrilateral into two triangles: two lots of 180 degrees.','The diagonal does not create extra polygon corners.'],
 ['Generalise polygon sums','use triangulation to find a polygon’s interior angle sum','Split the shape into triangles from one corner. Each triangle adds 180° to the total.','The number of triangles is two fewer than the number of sides.'],
 ['Find missing polygon angles','use an angle sum to determine a missing angle','Subtract the sum of the known interior angles from the whole polygon’s interior angle sum.','Only share the angle sum equally when all the angles are equal.']]},
 {title:'Ratio models for measurement',code:'AC9M7M06',lessons:[
 ['Scale a recipe','scale capacity quantities while preserving a ratio','Multiply each part of a recipe by the same scale factor.','Adding the same amount to each ingredient does not preserve a ratio.'],
 ['Share a measured total','divide a mass or capacity total in a given ratio','Add the ratio parts, find one part, then multiply for the required share.','Part-to-part ratios are different from fractions of the whole.'],
 ['Compare feasible mixtures','justify the largest mixture possible from available ingredients','Find the scale each ingredient permits. The smaller scale limits the whole mixture.','The plan must keep the ratio and stay within both supplies.']]},
 {title:'Measurement modelling expedition',code:'AC9M7M06',lessons:[
 ['Restore a mixture','calculate an addition needed to restore a target ratio','Use the unchanged ingredient to establish the required partner amount, then find the difference.','Check the final ratio after the addition.'],
 ['Scale a construction plan','use ratios of lengths to interpret a scale drawing','A scale ratio compares matching units. Convert units before applying the ratio.','Length scale factors do not apply directly to area.'],
 ['Justify a practical plan','choose and explain a feasible ratio plan with costs','Model the total in ratio parts, calculate each ingredient and its cost, then check the budget.','A valid plan must meet the quantity, ratio and budget constraints.']]},
] as const;
// Bump whenever lesson content changes so saved resume snapshots are discarded.
export const MEASUREMENT7_READABILITY_REVISION = 5;
export function measurement7Guide(week:number,lesson:number){const w=MEASUREMENT7_WEEKS[week-1],l=w?.lessons[lesson-1];return l?{title:l[0],goal:l[1],idea:l[2],caution:l[3],code:w.code}:undefined;}
export const MEASUREMENT7_PROGRAM:WeekPlan[]=MEASUREMENT7_WEEKS.map((w,i)=>({id:`y7-measurement-w${i+1}`,week:i+1,topic:w.title,curriculum:[w.code] as WeekPlan['curriculum'],lessons:w.lessons.map((l,j)=>({id:`y7-measurement-w${i+1}-l${j+1}`,week:i+1,lesson:j+1,title:l[0],focus:l[1],config:{teacherPreviewHref:`/demo-review/shattered-realms/measurement/lesson?realm_id=measurement&year=Year%207&week=${i+1}&lessonId=y7-measurement-w${i+1}-l${j+1}&expedition=1&teacher_preview=1&review=1`},curriculum:[w.code] as WeekPlan['curriculum'],activityIdeas:[l[1],'explain my method and check units and reasonableness'],quizSafe:true,activities:['fast_thinking','reasoning','apply_create'].map(role=>({activityType:'multiple_choice' as const,weight:role==='fast_thinking'?4:1,config:{mode:`m7_w${i+1}_l${j+1}_${role}`,rotationRole:role,rotationLabel:role==='fast_thinking'?'Fluency':role==='reasoning'?'Reasoning':'Apply',lessonStructure:'8_minute_rotation'}}))}))}));

// Concrete opening examples before the more varied practice questions.
export function measurement7IntroExample(week:number,lesson:number){
 if(week===10&&lesson===3)return {
  prompt:'Find angle x in this quadrilateral.',answer:'80°',
  explanation:'360° − 280° = 80°.',
  steps:['A quadrilateral has an angle sum of 360°.','Add the known angles: 90° + 110° + 80° = 280°.','Subtract: 360° − 280° = 80°.'],
  measurementVisual:polygonAngleVisual([90,110,80,80],['90°','110°','80°','x°']),
 };
 if(week===10&&lesson===2)return {
  prompt:'A pentagon has 5 sides. Find its interior angle sum.',
  answer:'540°',
  explanation:'3 triangles × 180° = 540°.',
  steps:['Split the pentagon into 3 triangles.','Multiply: 3 × 180° = 540°.','The pattern: angle sum = (number of sides − 2) × 180°.'],
  measurementVisual:undefined,
 };
 if(week!==5||lesson!==2)return undefined;
 return {
  prompt:'A circle has a diameter of 10 cm. Find its circumference using π ≈ 3.14.',
  answer:'31.4 cm',
  explanation:'Circumference ≈ 3.14 × 10 = 31.4 cm.',
  steps:['Use 3.14 for pi (π).','Multiply the diameter by 3.14.','3.14 × 10 = 31.4 cm around the circle.'],
  measurementVisual:{type:'measurement_year7_panel' as const,task:'circle' as const,values:[10],unit:'cm',circleMeasure:'diameter' as const,description:'The line across the centre is the diameter. The curved edge is the circumference.'},
 };
}
